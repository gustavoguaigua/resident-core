import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { AuditWriterPort } from "../../src/modules/audit/audit-writer.port.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import type { ResidentsActorContext } from "../../src/modules/residents-properties/residents-properties.contract.js";
import { ResidentsPropertiesService } from "../../src/modules/residents-properties/residents-properties.service.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";
import { IdempotencyService } from "../../src/platform/idempotency/idempotency.service.js";

const suite = process.env.RESIDENTS_PHASE2_SUITE;
const prisma = new PrismaService();
const audit = new PrismaAuditWriter(prisma);
const idempotency = new IdempotencyService(prisma);
const service = new ResidentsPropertiesService(prisma, idempotency, audit);
const allPermissions = [
  "propertyUnits.read",
  "propertyUnits.create",
  "propertyUnits.update",
  "propertyUnits.archive",
  "propertyUnits.read.own",
  "persons.read",
  "persons.create",
  "persons.update",
  "persons.archive",
  "persons.linkIdentity",
  "persons.read.own",
  "legalEntities.read",
  "legalEntities.create",
  "legalEntities.update",
  "legalEntities.archive",
  "propertyOwnerships.read",
  "propertyOwnerships.create",
  "propertyOwnerships.update",
  "propertyOwnerships.end",
  "residencies.read",
  "residencies.create",
  "residencies.update",
  "residencies.end",
  "residencies.read.own",
  "leases.read",
  "leases.create",
  "leases.update",
  "leases.end",
] as const;
const key = (label: string) => `${label}-${randomUUID()}`;
const trace = (label: string) => `phase2-${label}-${randomUUID()}`;

beforeAll(async () => prisma.$connect());
afterAll(async () => prisma.$disconnect());

describe
  .skipIf(suite !== "functional")
  .sequential("Sprint 3 Phase 2 residents API", () => {
    it("executes the six resource lifecycles with tenant-scoped reads and durable Audit", async () => {
      const actor = await createActor(allPermissions);
      const unitInput = {
        areaM2: "120.50",
        code: `UNIT-${randomUUID()}`,
        name: "Synthetic Unit",
        type: "house",
      } as const;
      const unitResult = await service.createPropertyUnit(
        actor,
        key("unit"),
        unitInput,
        trace("unit"),
      );
      const unit = unitResult.responseBody.data as { id: string };
      await expect(
        service.getPropertyUnit(actor, unit.id, trace("get-unit")),
      ).resolves.toMatchObject({ data: { id: unit.id } });
      await expect(
        service.listPropertyUnits(
          actor,
          { page: 1, pageSize: 20 },
          trace("list-unit"),
        ),
      ).resolves.toMatchObject({ meta: { total: 1 } });
      await service.updatePropertyUnit(
        actor,
        unit.id,
        key("update-unit"),
        { status: "inactive" },
        trace("update-unit"),
      );
      await service.updatePropertyUnit(
        actor,
        unit.id,
        key("reactivate-unit"),
        { status: "active" },
        trace("reactivate-unit"),
      );

      const ownerResult = await service.createPerson(
        actor,
        key("owner"),
        { displayName: "Synthetic Owner" },
        trace("owner"),
      );
      const owner = ownerResult.responseBody.data as { id: string };
      const tenantResult = await service.createPerson(
        actor,
        key("tenant"),
        { displayName: "Synthetic Tenant" },
        trace("tenant"),
      );
      const tenantPerson = tenantResult.responseBody.data as { id: string };
      const residentResult = await service.createPerson(
        actor,
        key("resident"),
        { displayName: "Synthetic Resident" },
        trace("resident"),
      );
      const resident = residentResult.responseBody.data as { id: string };
      await service.updatePerson(
        actor,
        resident.id,
        key("update-person"),
        { displayName: "Synthetic Resident Updated" },
        trace("update-person"),
      );
      await expect(
        service.listPersons(
          actor,
          { page: 1, pageSize: 20 },
          trace("list-person"),
        ),
      ).resolves.toMatchObject({ meta: { total: 3 } });

      const entityResult = await service.createLegalEntity(
        actor,
        key("entity"),
        { name: "Synthetic Entity" },
        trace("entity"),
      );
      const entity = entityResult.responseBody.data as { id: string };
      await service.updateLegalEntity(
        actor,
        entity.id,
        key("update-entity"),
        { name: "Synthetic Entity Updated" },
        trace("update-entity"),
      );
      await expect(
        service.listLegalEntities(
          actor,
          { page: 1, pageSize: 20 },
          trace("list-entity"),
        ),
      ).resolves.toMatchObject({ meta: { total: 1 } });

      const ownershipResult = await service.createOwnership(
        actor,
        key("ownership"),
        {
          isPrimary: true,
          ownershipPercentage: "100.00",
          personId: owner.id,
          propertyUnitId: unit.id,
          startDate: "2026-09-01",
        },
        trace("ownership"),
      );
      const ownership = ownershipResult.responseBody.data as { id: string };
      await service.updateOwnership(
        actor,
        ownership.id,
        key("dispute"),
        { status: "disputed" },
        trace("dispute"),
      );
      await service.updateOwnership(
        actor,
        ownership.id,
        key("resolve"),
        { status: "active" },
        trace("resolve"),
      );
      await expect(
        service.getOwnership(actor, ownership.id, trace("get-ownership")),
      ).resolves.toMatchObject({ data: { id: ownership.id } });

      const residencyResult = await service.createResidency(
        actor,
        key("residency"),
        {
          isPrimaryResident: true,
          personId: resident.id,
          propertyUnitId: unit.id,
          residencyType: "familyMember",
          startDate: "2026-09-01",
        },
        trace("residency"),
      );
      const residency = residencyResult.responseBody.data as { id: string };
      await service.updateResidency(
        actor,
        residency.id,
        key("suspend"),
        { status: "suspended" },
        trace("suspend"),
      );
      await service.updateResidency(
        actor,
        residency.id,
        key("reactivate"),
        { status: "active" },
        trace("reactivate"),
      );

      const leaseResult = await service.createLease(
        actor,
        key("lease"),
        {
          ownerPersonId: owner.id,
          propertyUnitId: unit.id,
          startDate: "2026-09-01",
          tenantPersonId: tenantPerson.id,
        },
        trace("lease"),
      );
      const lease = leaseResult.responseBody.data as { id: string };
      await service.updateLease(
        actor,
        lease.id,
        key("activate-lease"),
        { status: "active" },
        trace("activate-lease"),
      );
      await service.endLease(
        actor,
        lease.id,
        key("end-lease"),
        { endDate: "2026-12-31", reason: "Synthetic completion" },
        trace("end-lease"),
      );
      await service.endResidency(
        actor,
        residency.id,
        key("end-residency"),
        { endDate: "2026-12-31", reason: "Synthetic move" },
        trace("end-residency"),
      );
      await service.endOwnership(
        actor,
        ownership.id,
        key("end-ownership"),
        { endDate: "2026-12-31", reason: "Synthetic transfer" },
        trace("end-ownership"),
      );
      await service.archiveLegalEntity(
        actor,
        entity.id,
        key("archive-entity"),
        { reason: "Synthetic archive" },
        trace("archive-entity"),
      );
      await service.archivePropertyUnit(
        actor,
        unit.id,
        key("archive-unit"),
        { reason: "Synthetic archive" },
        trace("archive-unit"),
      );

      expect(
        await prisma.auditLog.count({ where: { tenantId: actor.tenantId } }),
      ).toBeGreaterThanOrEqual(20);
    });

    it("enforces replay, conflict, actor isolation, expiry and raw-key privacy", async () => {
      const actor = await createActor(allPermissions);
      const otherActor = await createActor(allPermissions, actor.tenantId);
      const rawKey = key("replay-secret");
      const body = { code: `REPLAY-${randomUUID()}` };
      const first = await service.createPropertyUnit(
        actor,
        rawKey,
        body,
        trace("first"),
      );
      const replay = await service.createPropertyUnit(
        actor,
        rawKey,
        body,
        trace("ignored-replay-trace"),
      );
      expect(replay.replayed).toBe(true);
      expect(replay.responseBody).toEqual(first.responseBody);
      await expect(
        service.createPropertyUnit(
          actor,
          rawKey,
          { code: `DIFFERENT-${randomUUID()}` },
          trace("conflict"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });
      await expect(
        service.createPropertyUnit(
          otherActor,
          rawKey,
          body,
          trace("actor-conflict"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });
      await expect(
        service.createPropertyUnit(
          actor,
          undefined,
          { code: "MISSING-KEY" },
          trace("missing"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REQUIRED" });
      expect(
        await prisma.propertyUnit.count({
          where: { code: body.code, tenantId: actor.tenantId },
        }),
      ).toBe(1);
      expect(
        await prisma.auditLog.count({
          where: { action: "propertyUnit.created", tenantId: actor.tenantId },
        }),
      ).toBe(1);
      const ledger = await prisma.idempotencyOperation.findFirstOrThrow({
        where: { tenantId: actor.tenantId },
      });
      expect(ledger.keyHash).not.toContain(rawKey);
      expect(JSON.stringify(ledger)).not.toContain(rawKey);

      const tenantB = await createActor(allPermissions);
      await expect(
        service.createPropertyUnit(
          tenantB,
          rawKey,
          { code: body.code },
          trace("tenant-b"),
        ),
      ).resolves.toMatchObject({ replayed: false });

      await prisma.idempotencyOperation.updateMany({
        data: { expiresAt: new Date(0) },
        where: { operationType: "persons.create", tenantId: actor.tenantId },
      });
      const expiringKey = key("expiry");
      await service.createPerson(
        actor,
        expiringKey,
        { displayName: "Expiry Person" },
        trace("expiry-1"),
      );
      await prisma.idempotencyOperation.updateMany({
        data: { expiresAt: new Date(0) },
        where: {
          keyHash: { not: "" },
          operationType: "persons.create",
          tenantId: actor.tenantId,
        },
      });
      await expect(
        service.createPerson(
          actor,
          expiringKey,
          { displayName: "Expiry Person" },
          trace("expiry-2"),
        ),
      ).resolves.toMatchObject({ replayed: false });
    });

    it("rolls back domain and ledger when Audit fails and rejects concurrent execution", async () => {
      const actor = await createActor(allPermissions);
      const failingAudit: AuditWriterPort = {
        recordConfirmed: async () => {
          throw new Error("Synthetic audit failure");
        },
        recordDenied: async () => ({ persisted: false }),
      };
      const failing = new ResidentsPropertiesService(
        prisma,
        idempotency,
        failingAudit,
      );
      const code = `ROLLBACK-${randomUUID()}`;
      await expect(
        failing.createPropertyUnit(
          actor,
          key("rollback"),
          { code },
          trace("rollback"),
        ),
      ).rejects.toThrow("Synthetic audit failure");
      expect(
        await prisma.propertyUnit.count({
          where: { code, tenantId: actor.tenantId },
        }),
      ).toBe(0);

      const concurrentKey = key("concurrent");
      let release: (() => void) | undefined;
      const hold = new Promise<void>((resolveHold) => {
        release = resolveHold;
      });
      const first = idempotency.execute(
        {
          actor,
          body: { value: 1 },
          key: concurrentKey,
          method: "POST",
          operationType: "phase2.concurrent.test",
          path: {},
        },
        async () => undefined,
        async () => {
          await hold;
          return {
            httpStatus: 200,
            responseBody: {
              data: { ok: true },
              meta: { traceId: trace("concurrent") },
            },
          };
        },
      );
      await new Promise((resolveWait) => setTimeout(resolveWait, 100));
      await expect(
        idempotency.execute(
          {
            actor,
            body: { value: 1 },
            key: concurrentKey,
            method: "POST",
            operationType: "phase2.concurrent.test",
            path: {},
          },
          async () => undefined,
          async () => ({
            httpStatus: 200,
            responseBody: { data: { ok: true }, meta: {} },
          }),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_OPERATION_IN_PROGRESS" });
      release?.();
      await expect(first).resolves.toMatchObject({ replayed: false });
    });
  });

describe
  .skipIf(suite !== "authorization")
  .sequential("Sprint 3 Phase 2 authorization", () => {
    it("fails closed for missing permission and inactive identity, membership or tenant", async () => {
      const noPermission = await createActor([]);
      await expect(
        service.listPersons(
          noPermission,
          { page: 1, pageSize: 20 },
          trace("no-permission"),
        ),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
      for (const state of ["membership", "tenant", "identity"] as const) {
        const actor = await createActor(["persons.read"]);
        if (state === "membership")
          await prisma.userTenantMembership.update({
            data: { status: "SUSPENDED" },
            where: { id: actor.membershipId },
          });
        if (state === "tenant")
          await prisma.tenant.update({
            data: { status: "SUSPENDED" },
            where: { id: actor.tenantId },
          });
        if (state === "identity")
          await prisma.userProfile.update({
            data: { status: "DISABLED" },
            where: { id: actor.userProfileId },
          });
        await expect(
          service.listPersons(actor, { page: 1, pageSize: 20 }, trace(state)),
        ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
      }
    });

    it("rejects cross-tenant references without revealing the foreign resource", async () => {
      const left = await createActor(allPermissions);
      const right = await createActor(allPermissions);
      const unit = await prisma.propertyUnit.create({
        data: { code: `RIGHT-${randomUUID()}`, tenantId: right.tenantId },
      });
      const person = await prisma.person.create({
        data: { displayName: "Left Person", tenantId: left.tenantId },
      });
      await expect(
        service.createOwnership(
          left,
          key("cross"),
          {
            personId: person.id,
            propertyUnitId: unit.id,
            startDate: "2026-09-01",
          },
          trace("cross"),
        ),
      ).rejects.toMatchObject({ code: "CROSS_TENANT_REFERENCE" });
    });

    it("resolves .own only through active tenant-scoped Person relationships", async () => {
      const actor = await createActor([
        "persons.read.own",
        "propertyUnits.read.own",
        "residencies.read.own",
      ]);
      const person = await prisma.person.create({
        data: {
          displayName: "Own Person",
          status: "ACTIVE",
          tenantId: actor.tenantId,
          userProfileId: actor.userProfileId,
        },
      });
      const owned = await prisma.propertyUnit.create({
        data: { code: `OWN-${randomUUID()}`, tenantId: actor.tenantId },
      });
      const resident = await prisma.propertyUnit.create({
        data: { code: `RES-${randomUUID()}`, tenantId: actor.tenantId },
      });
      const denied = await prisma.propertyUnit.create({
        data: { code: `DENIED-${randomUUID()}`, tenantId: actor.tenantId },
      });
      await prisma.propertyOwnership.create({
        data: {
          personId: person.id,
          propertyUnitId: owned.id,
          startDate: new Date("2026-09-01"),
          status: "ACTIVE",
          tenantId: actor.tenantId,
        },
      });
      const residency = await prisma.residency.create({
        data: {
          personId: person.id,
          propertyUnitId: resident.id,
          startDate: new Date("2026-09-01"),
          status: "ACTIVE",
          tenantId: actor.tenantId,
        },
      });
      await prisma.propertyOwnership.create({
        data: {
          personId: person.id,
          propertyUnitId: denied.id,
          startDate: new Date("2026-09-01"),
          status: "DISPUTED",
          tenantId: actor.tenantId,
        },
      });
      await expect(
        service.getOwnPerson(actor, trace("own-person")),
      ).resolves.toMatchObject({ data: { id: person.id } });
      const units = await service.getOwnPropertyUnits(
        actor,
        trace("own-units"),
      );
      expect(
        (units.data as { id: string }[]).map(({ id }) => id).sort(),
      ).toEqual([owned.id, resident.id].sort());
      await expect(
        service.getOwnResidencies(actor, trace("own-residencies")),
      ).resolves.toMatchObject({ data: [{ id: residency.id }] });
      await prisma.residency.update({
        data: { endDate: new Date("2026-09-02"), status: "ENDED" },
        where: { id: residency.id },
      });
      await expect(
        service.getOwnResidencies(actor, trace("ended-residency")),
      ).resolves.toMatchObject({ data: [] });
    });

    it("validates link-user type, status, active membership, tenant and uniqueness", async () => {
      const actor = await createActor(allPermissions);
      const person = await prisma.person.create({
        data: { displayName: "Link Target", tenantId: actor.tenantId },
      });
      const valid = await createProfile(
        "ACTIVE",
        "HUMAN",
        actor.tenantId,
        "ACTIVE",
      );
      await expect(
        service.linkUser(
          actor,
          person.id,
          key("valid-link"),
          { userProfileId: valid.id },
          trace("valid-link"),
        ),
      ).resolves.toMatchObject({
        responseBody: { data: { userProfileId: valid.id } },
      });
      const duplicatePerson = await prisma.person.create({
        data: { displayName: "Duplicate Link", tenantId: actor.tenantId },
      });
      await expect(
        service.linkUser(
          actor,
          duplicatePerson.id,
          key("duplicate-link"),
          { userProfileId: valid.id },
          trace("duplicate-link"),
        ),
      ).rejects.toMatchObject({ code: "RESOURCE_STATE_CONFLICT" });
      for (const candidate of [
        await createProfile(
          "ACTIVE",
          "SERVICE_ACCOUNT",
          actor.tenantId,
          "ACTIVE",
        ),
        await createProfile("DISABLED", "HUMAN", actor.tenantId, "ACTIVE"),
        await createProfile("ACTIVE", "HUMAN", actor.tenantId, "SUSPENDED"),
        await createProfile(
          "ACTIVE",
          "HUMAN",
          (await createActor([])).tenantId,
          "ACTIVE",
        ),
      ]) {
        const target = await prisma.person.create({
          data: {
            displayName: `Invalid ${candidate.id}`,
            tenantId: actor.tenantId,
          },
        });
        await expect(
          service.linkUser(
            actor,
            target.id,
            key("invalid-link"),
            { userProfileId: candidate.id },
            trace("invalid-link"),
          ),
        ).rejects.toMatchObject({ code: "RESOURCE_NOT_FOUND" });
      }
    });
  });

async function createActor(
  permissionCodes: readonly string[],
  tenantId?: string,
): Promise<ResidentsActorContext> {
  const user = await prisma.userProfile.create({
    data: {
      displayName: "Phase 2 Actor",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status: "ACTIVE",
      userType: "HUMAN",
    },
  });
  const tenant =
    tenantId === undefined
      ? await prisma.tenant.create({
          data: {
            name: "Phase 2 Tenant",
            slug: `phase2-${randomUUID()}`,
            status: "ACTIVE",
          },
        })
      : await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  const membership = await prisma.userTenantMembership.create({
    data: {
      joinedAt: new Date(),
      status: "ACTIVE",
      tenantId: tenant.id,
      userProfileId: user.id,
    },
  });
  const role = await prisma.role.create({
    data: {
      code: `Phase2-${randomUUID()}`,
      name: "Phase 2 Role",
      scope: "TENANT",
      tenantId: tenant.id,
    },
  });
  for (const code of permissionCodes) {
    const permission = await prisma.permission.findUniqueOrThrow({
      where: { code },
    });
    await prisma.rolePermission.create({
      data: { permissionId: permission.id, roleId: role.id },
    });
  }
  await prisma.membershipRole.create({
    data: { membershipId: membership.id, roleId: role.id },
  });
  return {
    membershipId: membership.id,
    tenantId: tenant.id,
    userProfileId: user.id,
  };
}

async function createProfile(
  status: "ACTIVE" | "DISABLED",
  userType: "HUMAN" | "SERVICE_ACCOUNT",
  tenantId: string,
  membershipStatus: "ACTIVE" | "SUSPENDED",
) {
  const profile = await prisma.userProfile.create({
    data: {
      displayName: "Link Candidate",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status,
      userType,
    },
  });
  await prisma.userTenantMembership.create({
    data: { status: membershipStatus, tenantId, userProfileId: profile.id },
  });
  return profile;
}
