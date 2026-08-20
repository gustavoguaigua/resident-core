import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { AuditWriterPort } from "../../src/modules/audit/audit-writer.port.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import { TenantOnboardingAccess } from "../../src/modules/identity-integration/tenant-onboarding-access.js";
import { KeycloakPlatformIdentityClient } from "../../src/modules/platform-admin-bootstrap/keycloak-platform-identity-client.js";
import { TenantLifecycleService } from "../../src/modules/tenants/tenant-lifecycle.service.js";
import type { TenantActorContext } from "../../src/modules/users-roles/invitations-memberships.contract.js";
import { InvitationsMembershipsService } from "../../src/modules/users-roles/invitations-memberships.service.js";
import { hashInvitationToken } from "../../src/modules/users-roles/invitation-token.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";

const enabled = process.env.INVITATION_PHASE7_TEST === "1";
const trace = (label: string) => `phase7-${label}-${randomUUID()}`;
const slug = (label: string) =>
  `phase7-${label}-${randomUUID().replaceAll("-", "").slice(0, 10)}`;

if (!enabled) {
  describe.skip("Phase 7 invitations and memberships", () => {
    it("runs only through the phase 7 gate", () => undefined);
  });
} else {
  const prisma = new PrismaService();
  const auditWriter = new PrismaAuditWriter(prisma);
  const invitations = new InvitationsMembershipsService(prisma, auditWriter);
  const identityClient = KeycloakPlatformIdentityClient.fromEnvironment();
  const tenants = new TenantLifecycleService(
    prisma,
    identityClient,
    new TenantOnboardingAccess(),
    auditWriter,
  );
  let platformAdminId: string;
  let residentUserId: string;

  describe.sequential("Phase 7 invitations and memberships", () => {
    beforeAll(async () => {
      await prisma.$connect();
      const platformAdmin = await prisma.userProfile.findUnique({
        where: { email: "platform.admin@example.com" },
      });
      if (platformAdmin === null) {
        throw new Error(
          "Phase 7 requires the integrated PlatformAdmin bootstrap.",
        );
      }
      platformAdminId = platformAdmin.id;
      const identity = await identityClient.resolveByEmail(
        "resident.user@example.com",
      );
      if (identity === null || !identity.enabled || !identity.emailVerified) {
        throw new Error(
          "Phase 7 requires the verified resident Keycloak fixture.",
        );
      }
      const resident = await prisma.userProfile.upsert({
        create: {
          displayName: identity.displayName,
          email: identity.email,
          keycloakSubjectId: identity.subject,
          status: "ACTIVE",
        },
        update: {
          keycloakSubjectId: identity.subject,
          status: "ACTIVE",
        },
        where: { email: identity.email },
      });
      residentUserId = resident.id;
    });

    afterAll(async () => prisma.$disconnect());

    it("creates and lists a hash-only tenant invitation with durable sanitized audit", async () => {
      const context = await createActiveTenant("create");
      const residentRole = context.roles.get("Resident");
      if (residentRole === undefined) throw new Error("Resident role missing.");

      const created = await invitations.createInvitation(
        {
          email: "resident.user@example.com",
          expiresInHours: 72,
          roleId: residentRole,
        },
        context.actor,
        trace("create"),
      );

      expect(created.token).toMatch(/^[A-Za-z0-9_-]{43}$/u);
      const persisted = await prisma.invitation.findUniqueOrThrow({
        where: { id: created.invitation.id },
      });
      expect(persisted.tokenHash).toBe(hashInvitationToken(created.token));
      expect(persisted.tokenHash).not.toContain(created.token);
      const listed = await invitations.listInvitations(
        context.actor,
        trace("list"),
        { page: 1, pageSize: 20 },
      );
      expect(listed.items).toHaveLength(1);
      expect(JSON.stringify(listed)).not.toContain(created.token);
      expect(JSON.stringify(listed)).not.toContain(persisted.tokenHash);
      await expect(
        prisma.auditLog.findFirst({
          where: { action: "invitation.created", resourceId: persisted.id },
        }),
      ).resolves.toMatchObject({ tenantId: context.actor.tenantId });
    });

    it("accepts with the Keycloak-linked Core identity and creates one same-tenant membership atomically", async () => {
      const context = await createActiveTenant("accept");
      const created = await createResidentInvitation(context);

      await expect(
        invitations.getInvitation(created.token, trace("resolve")),
      ).resolves.toMatchObject({
        email: "resident.user@example.com",
        status: "pending",
        tenant: { slug: context.tenantSlug },
      });
      const accepted = await invitations.acceptInvitation(
        created.token,
        residentUserId,
        trace("accept"),
      );

      expect(accepted.membership).toMatchObject({
        status: "ACTIVE",
        tenantId: context.actor.tenantId,
        userProfileId: residentUserId,
      });
      const persisted = await prisma.userTenantMembership.findUniqueOrThrow({
        include: { roles: true },
        where: {
          userProfileId_tenantId: {
            tenantId: context.actor.tenantId,
            userProfileId: residentUserId,
          },
        },
      });
      expect(persisted.roles).toHaveLength(1);
      const events = await prisma.auditLog.findMany({
        where: {
          action: {
            in: [
              "invitation.accepted",
              "membership.created",
              "membership.roleAssigned",
            ],
          },
          actorUserProfileId: residentUserId,
          tenantId: context.actor.tenantId,
        },
      });
      expect(events).toHaveLength(3);
      expect(JSON.stringify(events)).not.toContain(created.token);
    });

    it("serializes concurrent double acceptance into one membership and one conflict", async () => {
      const context = await createActiveTenant("concurrent");
      const created = await createResidentInvitation(context);
      const results = await Promise.allSettled([
        invitations.acceptInvitation(
          created.token,
          residentUserId,
          trace("concurrent-a"),
        ),
        invitations.acceptInvitation(
          created.token,
          residentUserId,
          trace("concurrent-b"),
        ),
      ]);

      expect(
        results.filter((result) => result.status === "fulfilled"),
      ).toHaveLength(1);
      expect(
        results.filter((result) => result.status === "rejected"),
      ).toHaveLength(1);
      await expect(
        prisma.userTenantMembership.count({
          where: {
            tenantId: context.actor.tenantId,
            userProfileId: residentUserId,
          },
        }),
      ).resolves.toBe(1);
      await expect(
        prisma.invitation.findUniqueOrThrow({
          where: { id: created.invitation.id },
        }),
      ).resolves.toMatchObject({ status: "ACCEPTED" });
    });

    it("rejects expired, revoked, cancelled and consumed invitations", async () => {
      const expiredContext = await createActiveTenant("expired");
      const expired = await createResidentInvitation(expiredContext);
      await prisma.invitation.update({
        data: { expiresAt: new Date(Date.now() - 1_000) },
        where: { id: expired.invitation.id },
      });
      await expect(
        invitations.acceptInvitation(
          expired.token,
          residentUserId,
          trace("expired"),
        ),
      ).rejects.toMatchObject({ code: "INVITATION_EXPIRED" });
      await expect(
        prisma.invitation.findUniqueOrThrow({
          where: { id: expired.invitation.id },
        }),
      ).resolves.toMatchObject({ status: "EXPIRED" });

      const revokedContext = await createActiveTenant("revoked");
      const revoked = await createResidentInvitation(revokedContext);
      await invitations.revokeInvitation(
        revoked.invitation.id,
        revokedContext.actor,
        trace("revoke"),
      );
      await expect(
        invitations.acceptInvitation(
          revoked.token,
          residentUserId,
          trace("revoked"),
        ),
      ).rejects.toMatchObject({ code: "INVITATION_REVOKED" });

      const cancelledContext = await createActiveTenant("cancelled");
      const cancelled = await createResidentInvitation(cancelledContext);
      await prisma.invitation.update({
        data: { status: "CANCELLED" },
        where: { id: cancelled.invitation.id },
      });
      await expect(
        invitations.acceptInvitation(
          cancelled.token,
          residentUserId,
          trace("cancelled"),
        ),
      ).rejects.toMatchObject({ code: "INVITATION_CANCELLED" });

      const usedContext = await createActiveTenant("used");
      const used = await createResidentInvitation(usedContext);
      await invitations.acceptInvitation(
        used.token,
        residentUserId,
        trace("used-first"),
      );
      await expect(
        invitations.acceptInvitation(
          used.token,
          residentUserId,
          trace("used-second"),
        ),
      ).rejects.toMatchObject({ code: "INVITATION_ALREADY_USED" });
    });

    it("fails closed for unknown or email-incompatible Core identities", async () => {
      const unknownContext = await createActiveTenant("unknown");
      const unknown = await createResidentInvitation(unknownContext);
      await expect(
        invitations.acceptInvitation(
          unknown.token,
          randomUUID(),
          trace("unknown"),
        ),
      ).rejects.toMatchObject({ code: "IDENTITY_NOT_PROVISIONED" });

      const mismatchContext = await createActiveTenant("mismatch");
      const residentRole = mismatchContext.roles.get("Resident");
      if (residentRole === undefined) throw new Error("Resident role missing.");
      const mismatch = await invitations.createInvitation(
        { email: "different@example.com", roleId: residentRole },
        mismatchContext.actor,
        trace("mismatch-create"),
      );
      await expect(
        invitations.acceptInvitation(
          mismatch.token,
          residentUserId,
          trace("mismatch"),
        ),
      ).rejects.toMatchObject({ code: "IDENTITY_EMAIL_MISMATCH" });
    });

    it("denies untrusted actors, global roles, cross-tenant roles and duplicate invitations", async () => {
      const [left, right] = await Promise.all([
        createActiveTenant("isolation-left"),
        createActiveTenant("isolation-right"),
      ]);
      const leftResidentRole = left.roles.get("Resident");
      const rightResidentRole = right.roles.get("Resident");
      if (leftResidentRole === undefined || rightResidentRole === undefined) {
        throw new Error("Resident roles missing.");
      }
      const globalRole = await prisma.role.findFirstOrThrow({
        where: { code: "PlatformAdmin", scope: "GLOBAL" },
      });
      await expect(
        invitations.createInvitation(
          { email: "resident.user@example.com", roleId: globalRole.id },
          left.actor,
          trace("global-role"),
        ),
      ).rejects.toMatchObject({ code: "ROLE_NOT_ASSIGNABLE" });
      await expect(
        invitations.createInvitation(
          { email: "resident.user@example.com", roleId: rightResidentRole },
          left.actor,
          trace("cross-role"),
        ),
      ).rejects.toMatchObject({ code: "ROLE_NOT_ASSIGNABLE" });

      const unauthorizedProfile = await prisma.userProfile.create({
        data: {
          displayName: "Untrusted Claims Actor",
          email: `${slug("claims")}@example.test`,
          keycloakSubjectId: randomUUID(),
          status: "ACTIVE",
        },
      });
      const unauthorizedMembership = await prisma.userTenantMembership.create({
        data: {
          joinedAt: new Date(),
          status: "ACTIVE",
          tenantId: left.actor.tenantId,
          userProfileId: unauthorizedProfile.id,
        },
      });
      await prisma.membershipRole.create({
        data: {
          membershipId: unauthorizedMembership.id,
          roleId: leftResidentRole,
        },
      });
      await expect(
        invitations.createInvitation(
          { email: "resident.user@example.com", roleId: leftResidentRole },
          {
            membershipId: unauthorizedMembership.id,
            tenantId: left.actor.tenantId,
            userProfileId: unauthorizedProfile.id,
          },
          trace("claims-no-effect"),
        ),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });

      await invitations.createInvitation(
        { email: "resident.user@example.com", roleId: leftResidentRole },
        left.actor,
        trace("duplicate-first"),
      );
      await expect(
        invitations.createInvitation(
          { email: "resident.user@example.com", roleId: leftResidentRole },
          left.actor,
          trace("duplicate-second"),
        ),
      ).rejects.toMatchObject({ code: "INVITATION_ALREADY_EXISTS" });
    });

    it("blocks invitation operations when the tenant lifecycle is inactive", async () => {
      const context = await createActiveTenant("inactive");
      await tenants.suspend(
        context.actor.tenantId,
        platformAdminId,
        trace("inactive-suspend"),
        "Synthetic Phase 7 lifecycle check",
      );
      const residentRole = context.roles.get("Resident");
      if (residentRole === undefined) throw new Error("Resident role missing.");
      await expect(
        invitations.createInvitation(
          { email: "resident.user@example.com", roleId: residentRole },
          context.actor,
          trace("inactive-create"),
        ),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    });

    it("manages tenant-scoped roles and revocation while protecting the last TenantAdmin", async () => {
      const context = await createActiveTenant("membership");
      const created = await createResidentInvitation(context);
      const accepted = await invitations.acceptInvitation(
        created.token,
        residentUserId,
        trace("membership-accept"),
      );
      const treasurerRole = context.roles.get("Treasurer");
      const tenantAdminRole = context.roles.get("TenantAdmin");
      if (treasurerRole === undefined || tenantAdminRole === undefined) {
        throw new Error("Required roles missing.");
      }
      const assignment = await invitations.assignRole(
        accepted.membership.id,
        treasurerRole,
        context.actor,
        trace("role-assign"),
      );
      await expect(
        invitations.assignRole(
          accepted.membership.id,
          treasurerRole,
          context.actor,
          trace("role-duplicate"),
        ),
      ).rejects.toMatchObject({ code: "MEMBERSHIP_ROLE_ALREADY_ASSIGNED" });
      await expect(
        invitations.removeRole(
          accepted.membership.id,
          treasurerRole,
          context.actor,
          trace("role-remove"),
        ),
      ).resolves.toMatchObject({ id: assignment.id });
      await expect(
        invitations.removeRole(
          context.actor.membershipId,
          tenantAdminRole,
          context.actor,
          trace("last-admin"),
        ),
      ).rejects.toMatchObject({ code: "TENANT_ADMIN_REQUIRED" });
      await expect(
        invitations.revokeMembership(
          accepted.membership.id,
          context.actor,
          trace("membership-revoke"),
          "Synthetic access removal",
        ),
      ).resolves.toMatchObject({ status: "REVOKED" });
      await expect(
        invitations.revokeMembership(
          accepted.membership.id,
          context.actor,
          trace("membership-revoke-repeat"),
        ),
      ).resolves.toMatchObject({ status: "REVOKED" });
    });

    it("rolls back invitation and acceptance writes when durable audit fails", async () => {
      const context = await createActiveTenant("rollback");
      const residentRole = context.roles.get("Resident");
      if (residentRole === undefined) throw new Error("Resident role missing.");
      const failingWriter: AuditWriterPort = {
        recordConfirmed: async () => {
          throw new Error("Synthetic Phase 7 audit failure");
        },
        recordDenied: async () => ({ persisted: false }),
      };
      const failing = new InvitationsMembershipsService(prisma, failingWriter);
      await expect(
        failing.createInvitation(
          { email: "rollback@example.test", roleId: residentRole },
          context.actor,
          trace("rollback-create"),
        ),
      ).rejects.toThrow("Synthetic Phase 7 audit failure");
      await expect(
        prisma.invitation.count({
          where: {
            email: "rollback@example.test",
            tenantId: context.actor.tenantId,
          },
        }),
      ).resolves.toBe(0);

      const created = await createResidentInvitation(context);
      await expect(
        failing.acceptInvitation(
          created.token,
          residentUserId,
          trace("rollback-accept"),
        ),
      ).rejects.toThrow("Synthetic Phase 7 audit failure");
      await expect(
        prisma.invitation.findUniqueOrThrow({
          where: { id: created.invitation.id },
        }),
      ).resolves.toMatchObject({ acceptedAt: null, status: "PENDING" });
      await expect(
        prisma.userTenantMembership.findUnique({
          where: {
            userProfileId_tenantId: {
              tenantId: context.actor.tenantId,
              userProfileId: residentUserId,
            },
          },
        }),
      ).resolves.toBeNull();
    });
  });

  async function createActiveTenant(label: string): Promise<{
    actor: TenantActorContext;
    roles: Map<string, string>;
    tenantSlug: string;
  }> {
    const created = await tenants.create(
      {
        initialAdmin: { email: "tenant.admin@example.com" },
        name: `Phase 7 ${label}`,
        slug: slug(label),
      },
      platformAdminId,
      trace(`${label}-create-tenant`),
    );
    await tenants.activate(
      created.tenant.id,
      platformAdminId,
      trace(`${label}-activate-tenant`),
    );
    const membership = await prisma.userTenantMembership.findUniqueOrThrow({
      where: {
        userProfileId_tenantId: {
          tenantId: created.tenant.id,
          userProfileId: created.initialAdmin.userProfileId,
        },
      },
    });
    const roles = await prisma.role.findMany({
      where: { tenantId: created.tenant.id },
    });
    return {
      actor: {
        membershipId: membership.id,
        tenantId: created.tenant.id,
        userProfileId: created.initialAdmin.userProfileId,
      },
      roles: new Map(roles.map((role) => [role.code, role.id])),
      tenantSlug: created.tenant.slug,
    };
  }

  function createResidentInvitation(context: {
    actor: TenantActorContext;
    roles: Map<string, string>;
  }) {
    const residentRole = context.roles.get("Resident");
    if (residentRole === undefined) throw new Error("Resident role missing.");
    return invitations.createInvitation(
      { email: "resident.user@example.com", roleId: residentRole },
      context.actor,
      trace("resident-invite"),
    );
  }
}
