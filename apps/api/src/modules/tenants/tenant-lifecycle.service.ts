import { Inject, Injectable } from "@nestjs/common";
import { Prisma, type PrismaClient, type TenantStatus } from "@prisma/client";

import { PrismaService } from "../../platform/database/prisma.service.js";
import type { AuditWriterPort } from "../audit/audit-writer.port.js";
import { AUDIT_WRITER_PORT } from "../audit/audit-writer.port.js";
import {
  TENANT_BASE_ROLE_CODES,
  TenantOnboardingAccess,
  type TenantInitialAccessResult,
} from "../identity-integration/tenant-onboarding-access.js";
import {
  TENANT_INITIAL_ADMIN_IDENTITY_PORT,
  TenantLifecycleError,
  type CreateTenantInput,
  type TenantInitialAdminIdentity,
  type TenantInitialAdminIdentityPort,
  type TenantLifecycleResult,
} from "./tenant-lifecycle.contract.js";

const MAX_SERIALIZATION_ATTEMPTS = 3;
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "core",
  "dashboard",
  "help",
  "login",
  "logout",
  "platform",
  "public",
  "resident",
  "settings",
  "support",
  "system",
  "www",
]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const COLOR = /^#[0-9A-Fa-f]{6}$/u;
const SUBJECT = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,254}$/u;
const LIFECYCLE_AUDIT_ACTION = {
  activate: "tenant.activated",
  archive: "tenant.archived",
  reactivate: "tenant.reactivated",
  suspend: "tenant.suspended",
} as const;

export interface CreateTenantResult {
  readonly tenant: {
    readonly id: string;
    readonly name: string;
    readonly legalName: string | null;
    readonly slug: string;
    readonly status: TenantStatus;
    readonly timezone: string;
    readonly currency: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly suspendedAt: Date | null;
    readonly suspensionReason: string | null;
    readonly archivedAt: Date | null;
    readonly profile: object | null;
    readonly branding: object | null;
    readonly wordpressMapping: object | null;
  };
  readonly initialAdmin: {
    readonly userProfileId: string;
    readonly email: string;
    readonly membershipStatus: "active";
    readonly role: "TenantAdmin";
  };
}

type LifecycleOperation = "activate" | "archive" | "reactivate" | "suspend";

@Injectable()
export class TenantLifecycleService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TENANT_INITIAL_ADMIN_IDENTITY_PORT)
    private readonly identityLookup: TenantInitialAdminIdentityPort,
    @Inject(TenantOnboardingAccess)
    private readonly onboardingAccess: TenantOnboardingAccess,
    @Inject(AUDIT_WRITER_PORT)
    private readonly auditWriter: AuditWriterPort,
  ) {}

  public async create(
    input: CreateTenantInput,
    actorUserProfileId: string,
    traceId: string,
  ): Promise<CreateTenantResult> {
    const normalized = normalizeCreateInput(input);
    const identity = await this.resolveIdentity(normalized.initialAdmin.email);

    try {
      return await this.withSerializableTransaction((transaction) =>
        this.createTransaction(
          transaction,
          normalized,
          identity,
          actorUserProfileId,
          traceId,
        ),
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new TenantLifecycleError("TENANT_SLUG_ALREADY_EXISTS");
      }
      throw error;
    }
  }

  public activate(
    tenantId: string,
    actorUserProfileId: string,
    traceId: string,
  ): Promise<TenantLifecycleResult> {
    return this.transition("activate", tenantId, actorUserProfileId, traceId);
  }

  public archive(
    tenantId: string,
    actorUserProfileId: string,
    traceId: string,
    reason: string,
  ): Promise<TenantLifecycleResult> {
    requireReason(reason);
    return this.transition("archive", tenantId, actorUserProfileId, traceId);
  }

  public reactivate(
    tenantId: string,
    actorUserProfileId: string,
    traceId: string,
  ): Promise<TenantLifecycleResult> {
    return this.transition("reactivate", tenantId, actorUserProfileId, traceId);
  }

  public suspend(
    tenantId: string,
    actorUserProfileId: string,
    traceId: string,
    reason: string,
  ): Promise<TenantLifecycleResult> {
    const normalizedReason = requireReason(reason);
    return this.transition(
      "suspend",
      tenantId,
      actorUserProfileId,
      traceId,
      normalizedReason,
    );
  }

  private async createTransaction(
    transaction: Prisma.TransactionClient,
    input: ReturnType<typeof normalizeCreateInput>,
    identity: TenantInitialAdminIdentity,
    actorUserProfileId: string,
    traceId: string,
  ): Promise<CreateTenantResult> {
    await this.assertGlobalPermission(
      transaction,
      actorUserProfileId,
      "platform.tenants.create",
    );
    const existing = await transaction.tenant.findUnique({
      select: { id: true },
      where: { slug: input.slug },
    });
    if (existing !== null) {
      throw new TenantLifecycleError("TENANT_SLUG_ALREADY_EXISTS");
    }

    const tenant = await transaction.tenant.create({
      data: {
        ...(input.branding === undefined
          ? {}
          : { branding: { create: input.branding } }),
        currency: input.currency,
        legalName: input.legalName ?? null,
        name: input.name,
        profile: {
          create: {
            ...input.profile,
            displayName: input.profile?.displayName ?? input.name,
          },
        },
        slug: input.slug,
        status: "PENDING_SETUP",
        timezone: input.timezone,
        ...(input.wordpressMapping === undefined
          ? {}
          : { wordpressMapping: { create: input.wordpressMapping } }),
      },
      include: {
        branding: true,
        profile: true,
        wordpressMapping: true,
      },
    });
    const access = await this.onboardingAccess.provision(
      transaction,
      tenant.id,
      identity,
      actorUserProfileId,
    );
    await this.recordOnboardingAudit(
      transaction,
      tenant.id,
      actorUserProfileId,
      traceId,
      access,
    );

    return {
      initialAdmin: {
        email: access.email,
        membershipStatus: "active",
        role: "TenantAdmin",
        userProfileId: access.userProfileId,
      },
      tenant,
    };
  }

  private async recordOnboardingAudit(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    actorUserProfileId: string,
    traceId: string,
    access: TenantInitialAccessResult,
  ): Promise<void> {
    const context = {
      actor: { type: "USER" as const, userProfileId: actorUserProfileId },
      tenantId,
      traceId,
    };
    const occurredAt = new Date();
    await this.auditWriter.recordConfirmed(transaction, context, {
      action: "tenant.created",
      occurredAt,
      resourceId: tenantId,
    });
    await this.auditWriter.recordConfirmed(transaction, context, {
      action: "tenant.baseRoles.created",
      occurredAt,
      resourceId: access.tenantAdminRoleId,
    });
    if (access.profileMutation === "created") {
      await this.auditWriter.recordConfirmed(transaction, context, {
        action: "user.created",
        occurredAt,
        resourceId: access.userProfileId,
      });
    } else if (access.profileMutation === "linked") {
      await this.auditWriter.recordConfirmed(transaction, context, {
        action: "user.keycloakLinked",
        occurredAt,
        resourceId: access.userProfileId,
      });
    } else if (access.profileMutation === "activated") {
      await this.auditWriter.recordConfirmed(transaction, context, {
        action: "user.updated",
        metadata: { changedFields: ["status"] },
        occurredAt,
        resourceId: access.userProfileId,
      });
    }
    await this.auditWriter.recordConfirmed(transaction, context, {
      action: "membership.created",
      occurredAt,
      resourceId: access.membershipId,
    });
    await this.auditWriter.recordConfirmed(transaction, context, {
      action: "membership.roleAssigned",
      metadata: { roleId: access.tenantAdminRoleId },
      occurredAt,
      resourceId: access.membershipRoleId,
    });
  }

  private async transition(
    operation: LifecycleOperation,
    tenantId: string,
    actorUserProfileId: string,
    traceId: string,
    reason?: string,
  ): Promise<TenantLifecycleResult> {
    requireUuid(tenantId);
    return this.withSerializableTransaction(async (transaction) => {
      await this.assertGlobalPermission(
        transaction,
        actorUserProfileId,
        `platform.tenants.${operation}`,
      );
      const tenant = await transaction.tenant.findUnique({
        include: { profile: true },
        where: { id: tenantId },
      });
      if (tenant === null) {
        throw new TenantLifecycleError("TENANT_NOT_FOUND");
      }
      const nextStatus = getNextStatus(operation, tenant.status);
      if (operation === "activate" || operation === "reactivate") {
        await this.assertActivationReady(
          transaction,
          tenant.id,
          tenant.profile,
        );
      }
      const now = new Date();
      const updated = await transaction.tenant.update({
        data:
          operation === "suspend"
            ? {
                status: nextStatus,
                suspendedAt: now,
                suspendedBy: actorUserProfileId,
                suspensionReason: reason ?? null,
              }
            : operation === "archive"
              ? {
                  archivedAt: now,
                  archivedBy: actorUserProfileId,
                  status: nextStatus,
                }
              : {
                  status: nextStatus,
                  suspendedAt: null,
                  suspendedBy: null,
                  suspensionReason: null,
                },
        where: { id: tenant.id },
      });
      await this.auditWriter.recordConfirmed(
        transaction,
        {
          actor: { type: "USER", userProfileId: actorUserProfileId },
          tenantId: tenant.id,
          traceId,
        },
        {
          action: LIFECYCLE_AUDIT_ACTION[operation],
          metadata: {
            newStatus: toContractStatus(nextStatus),
            previousStatus: toContractStatus(tenant.status),
          },
          occurredAt: now,
          resourceId: tenant.id,
        },
      );
      return updated;
    });
  }

  private async assertActivationReady(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    profile: object | null,
  ): Promise<void> {
    if (profile === null) {
      throw new TenantLifecycleError("TENANT_CANNOT_BE_ACTIVATED");
    }
    const roles = await transaction.role.findMany({
      select: { code: true },
      where: { isSystem: true, scope: "TENANT", tenantId },
    });
    const roleCodes = new Set(roles.map((role) => role.code));
    if (TENANT_BASE_ROLE_CODES.some((code) => !roleCodes.has(code))) {
      throw new TenantLifecycleError("TENANT_CANNOT_BE_ACTIVATED");
    }
    const tenantAdmin = await transaction.membershipRole.findFirst({
      select: { id: true },
      where: {
        membership: {
          status: "ACTIVE",
          tenantId,
          userProfile: { status: "ACTIVE" },
        },
        removedAt: null,
        role: { code: "TenantAdmin", scope: "TENANT", tenantId },
      },
    });
    if (tenantAdmin === null) {
      throw new TenantLifecycleError("TENANT_CANNOT_BE_ACTIVATED");
    }
  }

  private async assertGlobalPermission(
    transaction: Prisma.TransactionClient,
    actorUserProfileId: string,
    permission: string,
  ): Promise<void> {
    requireUuid(actorUserProfileId);
    const assignment = await transaction.userGlobalRole.findFirst({
      select: { id: true },
      where: {
        removedAt: null,
        userProfile: { id: actorUserProfileId, status: "ACTIVE" },
        userProfileId: actorUserProfileId,
        role: {
          scope: "GLOBAL",
          tenantId: null,
          permissions: { some: { permission: { code: permission } } },
        },
      },
    });
    if (assignment === null) {
      throw new TenantLifecycleError("TENANT_PERMISSION_DENIED");
    }
  }

  private async resolveIdentity(
    email: string,
  ): Promise<TenantInitialAdminIdentity> {
    try {
      const identity = await this.identityLookup.resolveByEmail(email);
      if (
        !identity.enabled ||
        !identity.emailVerified ||
        identity.email !== email
      ) {
        throw new TenantLifecycleError("IDENTITY_NOT_ELIGIBLE");
      }
      if (!SUBJECT.test(identity.subject)) {
        throw new TenantLifecycleError("IDENTITY_SUBJECT_INVALID");
      }
      return identity;
    } catch (error) {
      if (error instanceof TenantLifecycleError) {
        throw error;
      }
      const code = readIdentityErrorCode(error);
      if (code !== null) {
        throw new TenantLifecycleError(code);
      }
      throw new TenantLifecycleError("IDENTITY_PROVIDER_UNAVAILABLE");
    }
  }

  private async withSerializableTransaction<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= MAX_SERIALIZATION_ATTEMPTS; attempt += 1) {
      try {
        return await (this.prisma as PrismaClient).$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 10_000,
          timeout: 20_000,
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < MAX_SERIALIZATION_ATTEMPTS
        ) {
          continue;
        }
        throw error;
      }
    }
    throw new TenantLifecycleError("TENANT_INVALID_INPUT");
  }
}

function normalizeCreateInput(input: CreateTenantInput) {
  const name = requireText(input.name, 200);
  const slug = normalizeSlug(input.slug ?? name);
  const email = normalizeEmail(input.initialAdmin.email);
  const timezone = input.timezone ?? "America/Guayaquil";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
  } catch {
    throw new TenantLifecycleError("TENANT_INVALID_INPUT");
  }
  if ((input.currency ?? "USD") !== "USD") {
    throw new TenantLifecycleError("TENANT_INVALID_INPUT");
  }
  validateColors(input.branding);
  validateUrls(input.branding, input.wordpressMapping);
  return {
    ...input,
    currency: "USD",
    initialAdmin: { email },
    legalName:
      input.legalName === undefined
        ? undefined
        : requireText(input.legalName, 200),
    name,
    slug,
    timezone,
  };
}

function normalizeSlug(value: string): string {
  const slug = value
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
  if (
    slug.length < 3 ||
    slug.length > 80 ||
    !SLUG.test(slug) ||
    RESERVED_SLUGS.has(slug)
  ) {
    throw new TenantLifecycleError("TENANT_INVALID_INPUT");
  }
  return slug;
}

function normalizeEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) {
    throw new TenantLifecycleError("TENANT_INVALID_INPUT");
  }
  return email;
}

function requireText(value: string, maximumLength: number): string {
  const text = value.trim();
  if (text.length === 0 || text.length > maximumLength || /[<>]/u.test(text)) {
    throw new TenantLifecycleError("TENANT_INVALID_INPUT");
  }
  return text;
}

function requireReason(value: string): string {
  return requireText(value, 500);
}

function requireUuid(value: string): void {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      value,
    )
  ) {
    throw new TenantLifecycleError("TENANT_PERMISSION_DENIED");
  }
}

function validateColors(input: CreateTenantInput["branding"]): void {
  for (const value of [
    input?.accentColor,
    input?.primaryColor,
    input?.secondaryColor,
  ]) {
    if (value !== undefined && !COLOR.test(value)) {
      throw new TenantLifecycleError("TENANT_INVALID_INPUT");
    }
  }
}

function validateUrls(
  branding: CreateTenantInput["branding"],
  mapping: CreateTenantInput["wordpressMapping"],
): void {
  for (const value of [
    branding?.bannerUrl,
    branding?.logoUrl,
    mapping?.accessUrl,
    mapping?.wordpressSiteUrl,
  ]) {
    if (value === undefined) {
      continue;
    }
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") {
        throw new Error("HTTPS required");
      }
    } catch {
      throw new TenantLifecycleError("TENANT_INVALID_INPUT");
    }
  }
}

function getNextStatus(
  operation: LifecycleOperation,
  current: TenantStatus,
): TenantStatus {
  if (operation === "activate" && current === "PENDING_SETUP") {
    return "ACTIVE";
  }
  if (operation === "suspend" && current === "ACTIVE") {
    return "SUSPENDED";
  }
  if (
    operation === "reactivate" &&
    (current === "SUSPENDED" || current === "INACTIVE")
  ) {
    return "ACTIVE";
  }
  if (
    operation === "archive" &&
    (current === "SUSPENDED" || current === "INACTIVE")
  ) {
    return "ARCHIVED";
  }
  throw new TenantLifecycleError("TENANT_STATUS_TRANSITION_INVALID");
}

function toContractStatus(status: TenantStatus): string {
  const values: Record<TenantStatus, string> = {
    ACTIVE: "active",
    ARCHIVED: "archived",
    INACTIVE: "inactive",
    PENDING_SETUP: "pendingSetup",
    SUSPENDED: "suspended",
  };
  return values[status];
}

function readIdentityErrorCode(
  error: unknown,
):
  | "IDENTITY_LINK_CONFLICT"
  | "IDENTITY_NOT_ELIGIBLE"
  | "IDENTITY_NOT_PROVISIONED"
  | "IDENTITY_PROVIDER_UNAVAILABLE"
  | "IDENTITY_RESOLUTION_AMBIGUOUS"
  | "IDENTITY_SUBJECT_INVALID"
  | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" &&
    [
      "IDENTITY_LINK_CONFLICT",
      "IDENTITY_NOT_ELIGIBLE",
      "IDENTITY_NOT_PROVISIONED",
      "IDENTITY_PROVIDER_UNAVAILABLE",
      "IDENTITY_RESOLUTION_AMBIGUOUS",
      "IDENTITY_SUBJECT_INVALID",
    ].includes(code)
    ? (code as ReturnType<typeof readIdentityErrorCode>)
    : null;
}
