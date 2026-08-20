import { createHash } from "node:crypto";

import { Inject, Injectable } from "@nestjs/common";
import { Prisma, type InvitationStatus } from "@prisma/client";

import { PrismaService } from "../../platform/database/prisma.service.js";
import type { AuditWriterPort } from "../audit/audit-writer.port.js";
import { AUDIT_WRITER_PORT } from "../audit/audit-writer.port.js";
import {
  type CreateInvitationInput,
  type InvitationRecord,
  InvitationsMembershipsError,
  type MembershipRecord,
  type TenantActorContext,
} from "./invitations-memberships.contract.js";
import {
  createInvitationToken,
  hashInvitationToken,
  InvitationTokenError,
} from "./invitation-token.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const MAX_SERIALIZATION_ATTEMPTS = 3;
const DEFAULT_EXPIRATION_HOURS = 72;
const MAX_EXPIRATION_HOURS = 168;

type Transaction = Prisma.TransactionClient;

@Injectable()
export class InvitationsMembershipsService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AUDIT_WRITER_PORT)
    private readonly auditWriter: AuditWriterPort,
  ) {}

  public async createInvitation(
    input: CreateInvitationInput,
    actor: TenantActorContext,
    traceId: string,
  ): Promise<{ invitation: InvitationRecord; token: string }> {
    const normalized = normalizeInvitationInput(input);
    const token = createInvitationToken();
    const tokenHash = hashInvitationToken(token);
    const expiresAt = new Date(
      Date.now() + normalized.expiresInHours * 60 * 60 * 1_000,
    );

    const invitation = await this.withSerializableTransaction(async (tx) => {
      await this.assertTenantPermission(tx, actor, "users.invite");
      const role = await this.requireAssignableRole(
        tx,
        actor,
        normalized.roleId,
      );
      await this.lock(
        tx,
        `invitation-create:${actor.tenantId}:${normalized.email}`,
      );
      const existing = await tx.invitation.findFirst({
        select: { id: true },
        where: {
          email: normalized.email,
          status: "PENDING",
          tenantId: actor.tenantId,
        },
      });
      if (existing !== null) {
        throw new InvitationsMembershipsError("INVITATION_ALREADY_EXISTS");
      }
      const created = await tx.invitation.create({
        data: {
          email: normalized.email,
          expiresAt,
          invitedBy: actor.userProfileId,
          roleId: role.id,
          tenantId: actor.tenantId,
          tokenHash,
        },
        include: { role: true },
      });
      await this.auditWriter.recordConfirmed(tx, auditContext(actor, traceId), {
        action: "invitation.created",
        metadata: { expiresAt: expiresAt.toISOString(), roleId: role.id },
        occurredAt: new Date(),
        resourceId: created.id,
      });
      return toInvitationRecord(created);
    });
    return { invitation, token };
  }

  public listInvitations(
    actor: TenantActorContext,
    traceId: string,
    filters: {
      readonly email?: string;
      readonly status?: InvitationStatus;
      readonly page: number;
      readonly pageSize: number;
    },
  ): Promise<{ items: InvitationRecord[]; total: number }> {
    return this.withSerializableTransaction(async (tx) => {
      await this.assertTenantPermission(tx, actor, "users.read");
      const email = filters.email?.trim().toLowerCase();
      const where = {
        tenantId: actor.tenantId,
        ...(email === undefined ? {} : { email }),
        ...(filters.status === undefined ? {} : { status: filters.status }),
      };
      const [rows, total] = await Promise.all([
        tx.invitation.findMany({
          include: { role: true },
          orderBy: { createdAt: "desc" },
          skip: (filters.page - 1) * filters.pageSize,
          take: filters.pageSize,
          where,
        }),
        tx.invitation.count({ where }),
      ]);
      return { items: rows.map(toInvitationRecord), total };
    });
  }

  public async revokeInvitation(
    invitationId: string,
    actor: TenantActorContext,
    traceId: string,
  ): Promise<InvitationRecord> {
    const result = await this.withSerializableTransaction(async (tx) => {
      await this.assertTenantPermission(tx, actor, "users.invite");
      await this.lock(tx, `invitation:${invitationId}`);
      const invitation = await tx.invitation.findFirst({
        include: { role: true },
        where: { id: invitationId, tenantId: actor.tenantId },
      });
      if (invitation === null) {
        throw new InvitationsMembershipsError("INVITATION_NOT_FOUND");
      }
      if (invitation.status === "REVOKED") {
        return { kind: "ok" as const, value: toInvitationRecord(invitation) };
      }
      if (invitation.status !== "PENDING") {
        throw invitationStateError(invitation.status);
      }
      if (invitation.expiresAt.getTime() <= Date.now()) {
        await this.expireInvitation(tx, invitation, traceId);
        return { kind: "expired" as const };
      }
      const revoked = await tx.invitation.update({
        data: {
          revokedAt: new Date(),
          revokedBy: actor.userProfileId,
          status: "REVOKED",
        },
        include: { role: true },
        where: { id: invitation.id },
      });
      await this.auditWriter.recordConfirmed(tx, auditContext(actor, traceId), {
        action: "invitation.revoked",
        metadata: { newStatus: "revoked", previousStatus: "pending" },
        occurredAt: new Date(),
        resourceId: invitation.id,
      });
      return { kind: "ok" as const, value: toInvitationRecord(revoked) };
    });
    if (result.kind === "expired") {
      throw new InvitationsMembershipsError("INVITATION_EXPIRED");
    }
    return result.value;
  }

  public async getInvitation(token: string, traceId: string) {
    const tokenHash = safeHash(token);
    const result = await this.withSerializableTransaction(async (tx) => {
      await this.lock(tx, `invitation-token:${tokenHash}`);
      const invitation = await tx.invitation.findFirst({
        include: { role: true, tenant: { include: { profile: true } } },
        where: { tokenHash },
      });
      if (invitation === null) {
        throw new InvitationsMembershipsError("INVITATION_NOT_FOUND");
      }
      if (
        invitation.status === "PENDING" &&
        invitation.expiresAt.getTime() <= Date.now()
      ) {
        await this.expireInvitation(tx, invitation, traceId);
        return { kind: "expired" as const };
      }
      if (invitation.status !== "PENDING") {
        throw invitationStateError(invitation.status);
      }
      if (invitation.tenant.status !== "ACTIVE") {
        throw new InvitationsMembershipsError("TENANT_NOT_ACTIVE");
      }
      return {
        kind: "ok" as const,
        value: {
          email: invitation.email,
          expiresAt: invitation.expiresAt,
          role: { code: invitation.role.code, name: invitation.role.name },
          status: "pending" as const,
          tenant: {
            displayName:
              invitation.tenant.profile?.displayName ?? invitation.tenant.name,
            slug: invitation.tenant.slug,
          },
        },
      };
    });
    if (result.kind === "expired") {
      throw new InvitationsMembershipsError("INVITATION_EXPIRED");
    }
    return result.value;
  }

  public async acceptInvitation(
    token: string,
    userProfileId: string,
    traceId: string,
  ): Promise<{
    acceptedAt: Date;
    membership: MembershipRecord;
    role: { code: string; name: string };
    tenantSlug: string;
  }> {
    const tokenHash = safeHash(token);
    const result = await this.withSerializableTransaction(async (tx) => {
      await this.lock(tx, `invitation-token:${tokenHash}`);
      const invitation = await tx.invitation.findFirst({
        include: { role: true, tenant: true },
        where: { tokenHash },
      });
      if (invitation === null) {
        throw new InvitationsMembershipsError("INVITATION_NOT_FOUND");
      }
      if (
        invitation.status === "PENDING" &&
        invitation.expiresAt.getTime() <= Date.now()
      ) {
        await this.expireInvitation(tx, invitation, traceId);
        return { kind: "expired" as const };
      }
      if (invitation.status !== "PENDING") {
        throw invitationStateError(invitation.status);
      }
      if (invitation.tenant.status !== "ACTIVE") {
        throw new InvitationsMembershipsError("TENANT_NOT_ACTIVE");
      }
      if (
        invitation.role.scope !== "TENANT" ||
        invitation.role.tenantId !== invitation.tenantId
      ) {
        throw new InvitationsMembershipsError("ROLE_NOT_ASSIGNABLE");
      }
      const profile = await tx.userProfile.findFirst({
        where: {
          id: userProfileId,
          keycloakSubjectId: { not: null },
          status: "ACTIVE",
          userType: "HUMAN",
        },
      });
      if (profile === null) {
        throw new InvitationsMembershipsError("IDENTITY_NOT_PROVISIONED");
      }
      if (profile.email.trim().toLowerCase() !== invitation.email) {
        throw new InvitationsMembershipsError("IDENTITY_EMAIL_MISMATCH");
      }
      const existingMembership = await tx.userTenantMembership.findUnique({
        where: {
          userProfileId_tenantId: {
            tenantId: invitation.tenantId,
            userProfileId,
          },
        },
      });
      if (existingMembership !== null) {
        throw new InvitationsMembershipsError("MEMBERSHIP_ALREADY_EXISTS");
      }
      const acceptedAt = new Date();
      const membership = await tx.userTenantMembership.create({
        data: {
          invitedBy: invitation.invitedBy,
          joinedAt: acceptedAt,
          status: "ACTIVE",
          tenantId: invitation.tenantId,
          userProfileId,
        },
      });
      const assignment = await tx.membershipRole.create({
        data: {
          assignedBy: invitation.invitedBy,
          membershipId: membership.id,
          roleId: invitation.roleId,
        },
      });
      const accepted = await tx.invitation.updateMany({
        data: { acceptedAt, acceptedBy: userProfileId, status: "ACCEPTED" },
        where: { id: invitation.id, status: "PENDING" },
      });
      if (accepted.count !== 1) {
        throw new InvitationsMembershipsError("INVITATION_ALREADY_USED");
      }
      const auditContextValue = {
        actor: {
          membershipId: membership.id,
          type: "USER" as const,
          userProfileId,
        },
        tenantId: invitation.tenantId,
        traceId,
      };
      await this.auditWriter.recordConfirmed(tx, auditContextValue, {
        action: "invitation.accepted",
        metadata: { newStatus: "accepted", previousStatus: "pending" },
        occurredAt: acceptedAt,
        resourceId: invitation.id,
      });
      await this.auditWriter.recordConfirmed(tx, auditContextValue, {
        action: "membership.created",
        occurredAt: acceptedAt,
        resourceId: membership.id,
      });
      await this.auditWriter.recordConfirmed(tx, auditContextValue, {
        action: "membership.roleAssigned",
        metadata: { roleId: invitation.roleId },
        occurredAt: acceptedAt,
        resourceId: assignment.id,
      });
      return {
        kind: "ok" as const,
        value: {
          acceptedAt,
          membership: toMembershipRecord(membership),
          role: { code: invitation.role.code, name: invitation.role.name },
          tenantSlug: invitation.tenant.slug,
        },
      };
    });
    if (result.kind === "expired") {
      throw new InvitationsMembershipsError("INVITATION_EXPIRED");
    }
    return result.value;
  }

  public assignRole(
    membershipId: string,
    roleId: string,
    actor: TenantActorContext,
    traceId: string,
  ): Promise<{ id: string; roleId: string; assignedAt: Date }> {
    return this.withSerializableTransaction(async (tx) => {
      await this.assertTenantPermission(tx, actor, "users.roles.assign");
      await this.lock(tx, `membership-role:${membershipId}:${roleId}`);
      const membership = await this.requireActiveMembership(
        tx,
        actor.tenantId,
        membershipId,
      );
      const role = await this.requireAssignableRole(tx, actor, roleId);
      const existing = await tx.membershipRole.findUnique({
        where: { membershipId_roleId: { membershipId, roleId } },
      });
      if (existing?.removedAt === null) {
        throw new InvitationsMembershipsError(
          "MEMBERSHIP_ROLE_ALREADY_ASSIGNED",
        );
      }
      const assignment =
        existing === null
          ? await tx.membershipRole.create({
              data: {
                assignedBy: actor.userProfileId,
                membershipId: membership.id,
                roleId: role.id,
              },
            })
          : await tx.membershipRole.update({
              data: {
                assignedAt: new Date(),
                assignedBy: actor.userProfileId,
                removedAt: null,
                removedBy: null,
              },
              where: { id: existing.id },
            });
      await this.auditWriter.recordConfirmed(tx, auditContext(actor, traceId), {
        action: "membership.roleAssigned",
        metadata: { roleId },
        occurredAt: new Date(),
        resourceId: assignment.id,
      });
      return {
        assignedAt: assignment.assignedAt,
        id: assignment.id,
        roleId: assignment.roleId,
      };
    });
  }

  public removeRole(
    membershipId: string,
    roleId: string,
    actor: TenantActorContext,
    traceId: string,
  ): Promise<{ id: string; roleId: string; removedAt: Date }> {
    return this.withSerializableTransaction(async (tx) => {
      await this.assertTenantPermission(tx, actor, "users.roles.remove");
      await this.lock(tx, `membership-role:${membershipId}:${roleId}`);
      await this.requireActiveMembership(tx, actor.tenantId, membershipId);
      const assignment = await tx.membershipRole.findFirst({
        include: { role: true },
        where: {
          membershipId,
          removedAt: null,
          roleId,
          role: { scope: "TENANT", tenantId: actor.tenantId },
        },
      });
      if (assignment === null) {
        throw new InvitationsMembershipsError("MEMBERSHIP_ROLE_NOT_FOUND");
      }
      if (assignment.role.code === "TenantAdmin") {
        await this.assertAnotherActiveTenantAdmin(
          tx,
          actor.tenantId,
          membershipId,
        );
      }
      const removedAt = new Date();
      const removed = await tx.membershipRole.update({
        data: { removedAt, removedBy: actor.userProfileId },
        where: { id: assignment.id },
      });
      await this.auditWriter.recordConfirmed(tx, auditContext(actor, traceId), {
        action: "membership.roleRemoved",
        metadata: { roleId },
        occurredAt: removedAt,
        resourceId: removed.id,
      });
      return { id: removed.id, removedAt, roleId: removed.roleId };
    });
  }

  public revokeMembership(
    membershipId: string,
    actor: TenantActorContext,
    traceId: string,
    reason?: string,
  ): Promise<MembershipRecord> {
    return this.withSerializableTransaction(async (tx) => {
      await this.assertTenantPermission(tx, actor, "users.membership.revoke");
      await this.lock(tx, `membership:${membershipId}`);
      const membership = await tx.userTenantMembership.findFirst({
        where: { id: membershipId, tenantId: actor.tenantId },
      });
      if (membership === null) {
        throw new InvitationsMembershipsError("MEMBERSHIP_NOT_FOUND");
      }
      if (membership.status === "REVOKED") {
        return toMembershipRecord(membership);
      }
      if (
        !(["ACTIVE", "SUSPENDED"] as const).includes(membership.status as never)
      ) {
        throw new InvitationsMembershipsError("MEMBERSHIP_STATUS_INVALID");
      }
      const tenantAdmin = await tx.membershipRole.findFirst({
        include: { role: true },
        where: {
          membershipId,
          removedAt: null,
          role: { code: "TenantAdmin", tenantId: actor.tenantId },
        },
      });
      if (tenantAdmin !== null) {
        await this.assertAnotherActiveTenantAdmin(
          tx,
          actor.tenantId,
          membershipId,
        );
      }
      const revokedAt = new Date();
      const revoked = await tx.userTenantMembership.update({
        data: {
          revokedAt,
          revokedBy: actor.userProfileId,
          revokedReason: normalizeReason(reason),
          status: "REVOKED",
        },
        where: { id: membership.id },
      });
      await this.auditWriter.recordConfirmed(tx, auditContext(actor, traceId), {
        action: "membership.revoked",
        metadata: {
          newStatus: "revoked",
          previousStatus: membership.status.toLowerCase(),
        },
        occurredAt: revokedAt,
        resourceId: membership.id,
      });
      return toMembershipRecord(revoked);
    });
  }

  private async assertTenantPermission(
    tx: Transaction,
    actor: TenantActorContext,
    permission: string,
  ): Promise<void> {
    const allowed = await tx.membershipRole.findFirst({
      select: { id: true },
      where: {
        membership: {
          id: actor.membershipId,
          status: "ACTIVE",
          tenant: { status: "ACTIVE" },
          tenantId: actor.tenantId,
          userProfile: { status: "ACTIVE" },
          userProfileId: actor.userProfileId,
        },
        removedAt: null,
        role: {
          scope: "TENANT",
          tenantId: actor.tenantId,
          permissions: { some: { permission: { code: permission } } },
        },
      },
    });
    if (allowed === null) {
      throw new InvitationsMembershipsError("ACCESS_DENIED");
    }
  }

  private async requireAssignableRole(
    tx: Transaction,
    actor: TenantActorContext,
    roleId: string,
  ) {
    const role = await tx.role.findFirst({
      where: { id: roleId, scope: "TENANT", tenantId: actor.tenantId },
    });
    if (role === null) {
      throw new InvitationsMembershipsError("ROLE_NOT_ASSIGNABLE");
    }
    if (role.code === "TenantAdmin") {
      const allowed = await tx.membershipRole.findFirst({
        select: { id: true },
        where: {
          membership: {
            id: actor.membershipId,
            status: "ACTIVE",
            tenantId: actor.tenantId,
            userProfileId: actor.userProfileId,
          },
          removedAt: null,
          role: {
            tenantId: actor.tenantId,
            permissions: {
              some: { permission: { code: "users.assignTenantAdmin" } },
            },
          },
        },
      });
      if (allowed === null) {
        throw new InvitationsMembershipsError("ROLE_NOT_ASSIGNABLE");
      }
    }
    return role;
  }

  private async requireActiveMembership(
    tx: Transaction,
    tenantId: string,
    membershipId: string,
  ) {
    const membership = await tx.userTenantMembership.findFirst({
      where: {
        id: membershipId,
        status: "ACTIVE",
        tenant: { status: "ACTIVE" },
        tenantId,
      },
    });
    if (membership === null) {
      throw new InvitationsMembershipsError("MEMBERSHIP_NOT_FOUND");
    }
    return membership;
  }

  private async assertAnotherActiveTenantAdmin(
    tx: Transaction,
    tenantId: string,
    excludedMembershipId: string,
  ): Promise<void> {
    const another = await tx.membershipRole.findFirst({
      select: { id: true },
      where: {
        membership: {
          id: { not: excludedMembershipId },
          status: "ACTIVE",
          tenantId,
        },
        removedAt: null,
        role: { code: "TenantAdmin", scope: "TENANT", tenantId },
      },
    });
    if (another === null) {
      throw new InvitationsMembershipsError("TENANT_ADMIN_REQUIRED");
    }
  }

  private async expireInvitation(
    tx: Transaction,
    invitation: { id: string; tenantId: string },
    traceId: string,
  ): Promise<void> {
    const expired = await tx.invitation.updateMany({
      data: { status: "EXPIRED" },
      where: { id: invitation.id, status: "PENDING" },
    });
    if (expired.count === 1) {
      await this.auditWriter.recordConfirmed(
        tx,
        { actor: { type: "SYSTEM" }, tenantId: invitation.tenantId, traceId },
        {
          action: "invitation.expired",
          metadata: { newStatus: "expired", previousStatus: "pending" },
          occurredAt: new Date(),
          resourceId: invitation.id,
        },
      );
    }
  }

  private lock(tx: Transaction, key: string): Promise<number> {
    const hash = createHash("sha256").update(key).digest().readBigInt64BE();
    return tx.$executeRaw`SELECT pg_advisory_xact_lock(${hash})`;
  }

  private async withSerializableTransaction<T>(
    operation: (transaction: Transaction) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= MAX_SERIALIZATION_ATTEMPTS; attempt += 1) {
      try {
        return await this.prisma.$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        if (
          !isRetryableTransactionError(error) ||
          attempt === MAX_SERIALIZATION_ATTEMPTS
        ) {
          throw error;
        }
      }
    }
    throw new Error("Serializable transaction retry budget exhausted.");
  }
}

function normalizeInvitationInput(input: CreateInvitationInput) {
  const email = input.email.trim().toLowerCase();
  const expiresInHours = input.expiresInHours ?? DEFAULT_EXPIRATION_HOURS;
  if (
    !EMAIL.test(email) ||
    email.length > 254 ||
    !Number.isInteger(expiresInHours) ||
    expiresInHours < 1 ||
    expiresInHours > MAX_EXPIRATION_HOURS
  ) {
    throw new InvitationsMembershipsError("INVITATION_INVALID_INPUT");
  }
  return { email, expiresInHours, roleId: input.roleId };
}

function normalizeReason(reason: string | undefined): string | null {
  if (reason === undefined) return null;
  const value = reason.trim();
  if (value.length === 0 || value.length > 500) {
    throw new InvitationsMembershipsError("INVITATION_INVALID_INPUT");
  }
  return value;
}

function safeHash(token: string): string {
  try {
    return hashInvitationToken(token);
  } catch (error) {
    if (error instanceof InvitationTokenError) {
      throw new InvitationsMembershipsError("INVITATION_NOT_FOUND");
    }
    throw error;
  }
}

function invitationStateError(status: InvitationStatus) {
  return new InvitationsMembershipsError(
    {
      ACCEPTED: "INVITATION_ALREADY_USED",
      CANCELLED: "INVITATION_CANCELLED",
      EXPIRED: "INVITATION_EXPIRED",
      PENDING: "INVITATION_INVALID_INPUT",
      REVOKED: "INVITATION_REVOKED",
    }[status] as never,
  );
}

function auditContext(actor: TenantActorContext, traceId: string) {
  return {
    actor: {
      membershipId: actor.membershipId,
      type: "USER" as const,
      userProfileId: actor.userProfileId,
    },
    tenantId: actor.tenantId,
    traceId,
  };
}

function toInvitationRecord(invitation: {
  id: string;
  tenantId: string;
  email: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
  role: { id: string; code: string; name: string };
}): InvitationRecord {
  return {
    createdAt: invitation.createdAt,
    email: invitation.email,
    expiresAt: invitation.expiresAt,
    id: invitation.id,
    revokedAt: invitation.revokedAt,
    role: invitation.role,
    status: invitation.status,
    tenantId: invitation.tenantId,
  };
}

function toMembershipRecord(membership: {
  id: string;
  tenantId: string;
  userProfileId: string;
  status: MembershipRecord["status"];
  joinedAt: Date | null;
  revokedAt: Date | null;
}): MembershipRecord {
  return membership;
}

function isRetryableTransactionError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2034" || error.code === "P2028")
  );
}
