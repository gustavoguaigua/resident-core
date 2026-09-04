import { Inject, Injectable } from "@nestjs/common";
import type {
  Prisma,
  Lease,
  LegalEntity,
  Person,
  PrismaClient,
  PropertyOwnership,
  PropertyUnit,
  Residency,
} from "@prisma/client";

import { PrismaService } from "../../platform/database/prisma.service.js";
import {
  IdempotencyService,
  type IdempotentActor,
  type IdempotentResult,
} from "../../platform/idempotency/idempotency.service.js";
import {
  AUDIT_WRITER_PORT,
  type AuditWriterPort,
} from "../audit/audit-writer.port.js";
import type { AuditAction } from "../audit/domain-audit-event.js";
import type {
  ArchiveDto,
  CreateLeaseDto,
  CreateLegalEntityDto,
  CreateOwnershipDto,
  CreatePersonDto,
  CreatePropertyUnitDto,
  CreateResidencyDto,
  EndRelationshipDto,
  LinkUserDto,
  PageQueryDto,
  PropertyUnitQueryDto,
  RelationshipQueryDto,
  UpdateLeaseDto,
  UpdateLegalEntityDto,
  UpdateOwnershipDto,
  UpdatePersonDto,
  UpdatePropertyUnitDto,
  UpdateResidencyDto,
} from "./residents-properties.dto.js";
import {
  ResidentsPropertiesError,
  type ResidentsActorContext,
} from "./residents-properties.contract.js";

type Transaction = Prisma.TransactionClient;
type ReadClient = Pick<PrismaClient, "membershipRole" | "userTenantMembership">;
type Envelope = {
  readonly data: unknown;
  readonly meta: Readonly<Record<string, unknown>>;
};

const unitType = {
  apartment: "APARTMENT",
  commercial: "COMMERCIAL",
  house: "HOUSE",
  lot: "LOT",
  mixed: "MIXED",
  other: "OTHER",
  parking: "PARKING",
  storage: "STORAGE",
  suite: "SUITE",
} as const;
const unitStatus = {
  active: "ACTIVE",
  archived: "ARCHIVED",
  blocked: "BLOCKED",
  inactive: "INACTIVE",
  underMaintenance: "UNDER_MAINTENANCE",
} as const;
const identificationType = {
  cedula: "CEDULA",
  other: "OTHER",
  passport: "PASSPORT",
  ruc: "RUC",
} as const;
const personStatus = { active: "ACTIVE", inactive: "INACTIVE" } as const;
const ownershipType = {
  coOwner: "CO_OWNER",
  legalRepresentative: "LEGAL_REPRESENTATIVE",
  other: "OTHER",
  owner: "OWNER",
  usufructuary: "USUFRUCTUARY",
} as const;
const ownershipStatus = { active: "ACTIVE", disputed: "DISPUTED" } as const;
const residencyType = {
  authorizedOccupant: "AUTHORIZED_OCCUPANT",
  caretaker: "CARETAKER",
  familyMember: "FAMILY_MEMBER",
  other: "OTHER",
  ownerResident: "OWNER_RESIDENT",
  tenant: "TENANT",
} as const;
const residencyStatus = { active: "ACTIVE", suspended: "SUSPENDED" } as const;
const leaseStatus = {
  active: "ACTIVE",
  archived: "ARCHIVED",
  cancelled: "CANCELLED",
} as const;

@Injectable()
export class ResidentsPropertiesService {
  public constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(IdempotencyService)
    private readonly idempotency: IdempotencyService,
    @Inject(AUDIT_WRITER_PORT) private readonly audit: AuditWriterPort,
  ) {}

  public async listPropertyUnits(
    actor: ResidentsActorContext,
    query: PropertyUnitQueryDto,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "propertyUnits.read");
    const where: Prisma.PropertyUnitWhereInput = {
      tenantId: actor.tenantId,
      ...(query.status === undefined
        ? {}
        : { status: unitStatus[query.status as keyof typeof unitStatus] }),
      ...(query.type === undefined
        ? {}
        : { type: unitType[query.type as keyof typeof unitType] }),
      ...(query.block === undefined ? {} : { block: query.block }),
      ...(query.search === undefined
        ? {}
        : {
            OR: ["code", "name", "addressReference"].map((field) => ({
              [field]: { contains: query.search, mode: "insensitive" },
            })),
          }),
    };
    return this.page(
      query,
      traceId,
      await this.prisma.propertyUnit.findMany({
        orderBy: { code: "asc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      await this.prisma.propertyUnit.count({ where }),
      serializeUnit,
    );
  }

  public async getPropertyUnit(
    actor: ResidentsActorContext,
    id: string,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "propertyUnits.read");
    const value = await this.prisma.propertyUnit.findFirst({
      where: { id, tenantId: actor.tenantId },
    });
    return envelope(serializeUnit(requireResource(value)), traceId);
  }

  public createPropertyUnit(
    actor: ResidentsActorContext,
    key: string | undefined,
    body: CreatePropertyUnitDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "propertyUnits.create",
      {},
      body,
      "propertyUnits.create",
      traceId,
      async (tx) => {
        const value = await tx.propertyUnit.create({
          data: compact({
            addressReference: body.addressReference,
            areaM2: body.areaM2,
            block: body.block,
            code: body.code,
            floor: body.floor,
            name: body.name,
            tenantId: actor.tenantId,
            type:
              body.type === undefined
                ? undefined
                : unitType[body.type as keyof typeof unitType],
          }) as Prisma.PropertyUnitUncheckedCreateInput,
        });
        await this.record(tx, actor, traceId, "propertyUnit.created", value.id);
        return created(serializeUnit(value), traceId, "PropertyUnit", value.id);
      },
    );
  }

  public updatePropertyUnit(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: UpdatePropertyUnitDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "PATCH",
      "propertyUnits.update",
      { propertyUnitId: id },
      body,
      "propertyUnits.update",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.propertyUnit.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (body.status !== undefined)
          assertTransition(
            "PropertyUnit",
            current.status,
            unitStatus[body.status as keyof typeof unitStatus],
            {
              ACTIVE: ["INACTIVE", "UNDER_MAINTENANCE", "BLOCKED"],
              BLOCKED: ["ACTIVE"],
              INACTIVE: ["ACTIVE"],
              UNDER_MAINTENANCE: ["ACTIVE"],
            },
          );
        const changedFields = Object.keys(body);
        requireChanges(changedFields);
        const value = await tx.propertyUnit.update({
          data: compact({
            ...body,
            areaM2: body.areaM2,
            status:
              body.status === undefined
                ? undefined
                : unitStatus[body.status as keyof typeof unitStatus],
            type:
              body.type === undefined
                ? undefined
                : unitType[body.type as keyof typeof unitType],
          }) as Prisma.PropertyUnitUncheckedUpdateInput,
          where: { id },
        });
        await this.record(tx, actor, traceId, "propertyUnit.updated", id, {
          changedFields,
        });
        if (body.status !== undefined && current.status !== value.status)
          await this.record(
            tx,
            actor,
            traceId,
            "propertyUnit.statusChanged",
            id,
            statusMetadata(current.status, value.status),
          );
        return ok(serializeUnit(value), traceId, "PropertyUnit", id);
      },
    );
  }

  public archivePropertyUnit(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: ArchiveDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "propertyUnits.archive",
      { propertyUnitId: id },
      body,
      "propertyUnits.archive",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.propertyUnit.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (current.status === "ARCHIVED") throw conflict();
        const value = await tx.propertyUnit.update({
          data: { archivedAt: new Date(), status: "ARCHIVED" },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "propertyUnit.archived",
          id,
          statusMetadata(current.status, value.status),
        );
        return ok(serializeUnit(value), traceId, "PropertyUnit", id);
      },
    );
  }

  public async listPersons(
    actor: ResidentsActorContext,
    query: PageQueryDto,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "persons.read");
    const where = { tenantId: actor.tenantId };
    return this.page(
      query,
      traceId,
      await this.prisma.person.findMany({
        orderBy: { displayName: "asc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      await this.prisma.person.count({ where }),
      serializePerson,
    );
  }

  public async getPerson(
    actor: ResidentsActorContext,
    id: string,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "persons.read");
    return envelope(
      serializePerson(
        requireResource(
          await this.prisma.person.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }

  public createPerson(
    actor: ResidentsActorContext,
    key: string | undefined,
    body: CreatePersonDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "persons.create",
      {},
      body,
      "persons.create",
      traceId,
      async (tx) => {
        const value = await tx.person.create({
          data: compact({
            ...body,
            identificationType:
              body.identificationType === undefined
                ? undefined
                : identificationType[
                    body.identificationType as keyof typeof identificationType
                  ],
            tenantId: actor.tenantId,
          }) as Prisma.PersonUncheckedCreateInput,
        });
        await this.record(tx, actor, traceId, "person.created", value.id);
        return created(serializePerson(value), traceId, "Person", value.id);
      },
    );
  }

  public updatePerson(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: UpdatePersonDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "PATCH",
      "persons.update",
      { personId: id },
      body,
      "persons.update",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.person.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (body.status !== undefined)
          assertTransition(
            "Person",
            current.status,
            personStatus[body.status as keyof typeof personStatus],
            { ACTIVE: ["INACTIVE"], INACTIVE: ["ACTIVE"] },
          );
        const changedFields = Object.keys(body);
        requireChanges(changedFields);
        const value = await tx.person.update({
          data: compact({
            ...body,
            identificationType:
              body.identificationType === undefined
                ? undefined
                : identificationType[
                    body.identificationType as keyof typeof identificationType
                  ],
            status:
              body.status === undefined
                ? undefined
                : personStatus[body.status as keyof typeof personStatus],
          }) as Prisma.PersonUncheckedUpdateInput,
          where: { id },
        });
        await this.record(tx, actor, traceId, "person.updated", id, {
          changedFields,
        });
        if (body.status !== undefined && current.status !== value.status)
          await this.record(
            tx,
            actor,
            traceId,
            "person.statusChanged",
            id,
            statusMetadata(current.status, value.status),
          );
        return ok(serializePerson(value), traceId, "Person", id);
      },
    );
  }

  public archivePerson(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: ArchiveDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "persons.archive",
      { personId: id },
      body,
      "persons.archive",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.person.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (current.status === "ARCHIVED") throw conflict();
        const activeRelations = await Promise.all([
          tx.propertyOwnership.count({
            where: {
              personId: id,
              status: { in: ["ACTIVE", "DISPUTED"] },
              tenantId: actor.tenantId,
            },
          }),
          tx.residency.count({
            where: {
              personId: id,
              status: { in: ["ACTIVE", "SUSPENDED"] },
              tenantId: actor.tenantId,
            },
          }),
          tx.lease.count({
            where: {
              OR: [{ ownerPersonId: id }, { tenantPersonId: id }],
              status: { in: ["ACTIVE", "DRAFT"] },
              tenantId: actor.tenantId,
            },
          }),
        ]);
        if (activeRelations.some((count) => count > 0)) throw conflict();
        const value = await tx.person.update({
          data: { archivedAt: new Date(), status: "ARCHIVED" },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "person.archived",
          id,
          statusMetadata(current.status, value.status),
        );
        return ok(serializePerson(value), traceId, "Person", id);
      },
    );
  }

  public linkUser(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: LinkUserDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "persons.linkIdentity",
      { personId: id },
      body,
      "persons.linkIdentity",
      traceId,
      async (tx) => {
        const person = requireResource(
          await tx.person.findFirst({
            where: { id, status: "ACTIVE", tenantId: actor.tenantId },
          }),
        );
        if (person.userProfileId !== null) throw conflict();
        const profile = await tx.userProfile.findFirst({
          where: {
            id: body.userProfileId,
            status: "ACTIVE",
            userType: "HUMAN",
            memberships: {
              some: {
                status: "ACTIVE",
                tenantId: actor.tenantId,
                tenant: { status: "ACTIVE" },
              },
            },
          },
        });
        if (profile === null)
          throw new ResidentsPropertiesError("RESOURCE_NOT_FOUND");
        const duplicate = await tx.person.findFirst({
          where: { tenantId: actor.tenantId, userProfileId: profile.id },
        });
        if (duplicate !== null) throw conflict();
        const value = await tx.person.update({
          data: { userProfileId: profile.id },
          where: { id },
        });
        await this.record(tx, actor, traceId, "person.identityLinked", id);
        return ok(
          {
            linkedAt: value.updatedAt.toISOString(),
            personId: id,
            userProfileId: profile.id,
          },
          traceId,
          "Person",
          id,
        );
      },
    );
  }

  public async listLegalEntities(
    actor: ResidentsActorContext,
    query: PageQueryDto,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "legalEntities.read");
    const where = { tenantId: actor.tenantId };
    return this.page(
      query,
      traceId,
      await this.prisma.legalEntity.findMany({
        orderBy: { name: "asc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      await this.prisma.legalEntity.count({ where }),
      serializeLegalEntity,
    );
  }

  public async getLegalEntity(
    actor: ResidentsActorContext,
    id: string,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "legalEntities.read");
    return envelope(
      serializeLegalEntity(
        requireResource(
          await this.prisma.legalEntity.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }

  public createLegalEntity(
    actor: ResidentsActorContext,
    key: string | undefined,
    body: CreateLegalEntityDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "legalEntities.create",
      {},
      body,
      "legalEntities.create",
      traceId,
      async (tx) => {
        const value = await tx.legalEntity.create({
          data: compact({
            ...body,
            taxIdentificationType:
              body.taxIdentificationType === undefined
                ? undefined
                : identificationType[
                    body.taxIdentificationType as keyof typeof identificationType
                  ],
            tenantId: actor.tenantId,
          }) as Prisma.LegalEntityUncheckedCreateInput,
        });
        await this.record(tx, actor, traceId, "legalEntity.created", value.id);
        return created(
          serializeLegalEntity(value),
          traceId,
          "LegalEntity",
          value.id,
        );
      },
    );
  }

  public updateLegalEntity(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: UpdateLegalEntityDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "PATCH",
      "legalEntities.update",
      { legalEntityId: id },
      body,
      "legalEntities.update",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.legalEntity.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (body.status !== undefined)
          assertTransition(
            "LegalEntity",
            current.status,
            personStatus[body.status as keyof typeof personStatus],
            { ACTIVE: ["INACTIVE"], INACTIVE: ["ACTIVE"] },
          );
        const changedFields = Object.keys(body);
        requireChanges(changedFields);
        const value = await tx.legalEntity.update({
          data: compact({
            ...body,
            status:
              body.status === undefined
                ? undefined
                : personStatus[body.status as keyof typeof personStatus],
            taxIdentificationType:
              body.taxIdentificationType === undefined
                ? undefined
                : identificationType[
                    body.taxIdentificationType as keyof typeof identificationType
                  ],
          }) as Prisma.LegalEntityUncheckedUpdateInput,
          where: { id },
        });
        await this.record(tx, actor, traceId, "legalEntity.updated", id, {
          changedFields,
        });
        if (body.status !== undefined && current.status !== value.status)
          await this.record(
            tx,
            actor,
            traceId,
            "legalEntity.statusChanged",
            id,
            statusMetadata(current.status, value.status),
          );
        return ok(serializeLegalEntity(value), traceId, "LegalEntity", id);
      },
    );
  }

  public archiveLegalEntity(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: ArchiveDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "legalEntities.archive",
      { legalEntityId: id },
      body,
      "legalEntities.archive",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.legalEntity.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (current.status === "ARCHIVED") throw conflict();
        const active = await tx.propertyOwnership.count({
          where: {
            legalEntityId: id,
            status: { in: ["ACTIVE", "DISPUTED"] },
            tenantId: actor.tenantId,
          },
        });
        if (active > 0) throw conflict();
        const value = await tx.legalEntity.update({
          data: { archivedAt: new Date(), status: "ARCHIVED" },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "legalEntity.archived",
          id,
          statusMetadata(current.status, value.status),
        );
        return ok(serializeLegalEntity(value), traceId, "LegalEntity", id);
      },
    );
  }

  public async listOwnerships(
    actor: ResidentsActorContext,
    query: RelationshipQueryDto,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "propertyOwnerships.read");
    const where: Prisma.PropertyOwnershipWhereInput = {
      tenantId: actor.tenantId,
      ...(query.propertyUnitId ? { propertyUnitId: query.propertyUnitId } : {}),
      ...(query.personId ? { personId: query.personId } : {}),
      ...(query.legalEntityId ? { legalEntityId: query.legalEntityId } : {}),
      ...(query.status ? { status: query.status.toUpperCase() as never } : {}),
    };
    return this.page(
      query,
      traceId,
      await this.prisma.propertyOwnership.findMany({
        orderBy: { createdAt: "desc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      await this.prisma.propertyOwnership.count({ where }),
      serializeOwnership,
    );
  }

  public async getOwnership(
    actor: ResidentsActorContext,
    id: string,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "propertyOwnerships.read");
    return envelope(
      serializeOwnership(
        requireResource(
          await this.prisma.propertyOwnership.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }

  public createOwnership(
    actor: ResidentsActorContext,
    key: string | undefined,
    body: CreateOwnershipDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "propertyOwnerships.create",
      {},
      body,
      "propertyOwnerships.create",
      traceId,
      async (tx) => {
        requireXor(body.personId, body.legalEntityId);
        await this.assertReferences(
          tx,
          actor.tenantId,
          body.propertyUnitId,
          body.personId,
          body.legalEntityId,
        );
        const value = await tx.propertyOwnership.create({
          data: compact({
            isPrimary: body.isPrimary,
            legalEntityId: body.legalEntityId,
            ownershipPercentage: body.ownershipPercentage,
            ownershipType:
              body.ownershipType === undefined
                ? undefined
                : ownershipType[
                    body.ownershipType as keyof typeof ownershipType
                  ],
            personId: body.personId,
            propertyUnitId: body.propertyUnitId,
            startDate: date(body.startDate),
            tenantId: actor.tenantId,
          }) as Prisma.PropertyOwnershipUncheckedCreateInput,
        });
        await this.record(
          tx,
          actor,
          traceId,
          "propertyOwnership.created",
          value.id,
        );
        return created(
          serializeOwnership(value),
          traceId,
          "PropertyOwnership",
          value.id,
        );
      },
    );
  }

  public updateOwnership(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: UpdateOwnershipDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "PATCH",
      "propertyOwnerships.update",
      { ownershipId: id },
      body,
      "propertyOwnerships.update",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.propertyOwnership.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (body.status !== undefined)
          assertTransition(
            "PropertyOwnership",
            current.status,
            ownershipStatus[body.status as keyof typeof ownershipStatus],
            { ACTIVE: ["DISPUTED"], DISPUTED: ["ACTIVE"] },
          );
        const changedFields = Object.keys(body);
        requireChanges(changedFields);
        const value = await tx.propertyOwnership.update({
          data: compact({
            ...body,
            ownershipType:
              body.ownershipType === undefined
                ? undefined
                : ownershipType[
                    body.ownershipType as keyof typeof ownershipType
                  ],
            status:
              body.status === undefined
                ? undefined
                : ownershipStatus[body.status as keyof typeof ownershipStatus],
          }) as Prisma.PropertyOwnershipUncheckedUpdateInput,
          where: { id },
        });
        await this.record(tx, actor, traceId, "propertyOwnership.updated", id, {
          changedFields,
        });
        if (body.status !== undefined && current.status !== value.status)
          await this.record(
            tx,
            actor,
            traceId,
            value.status === "DISPUTED"
              ? "propertyOwnership.disputed"
              : "propertyOwnership.resolved",
            id,
            statusMetadata(current.status, value.status),
          );
        return ok(serializeOwnership(value), traceId, "PropertyOwnership", id);
      },
    );
  }

  public endOwnership(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: EndRelationshipDto,
    traceId: string,
  ) {
    return this.endRelation(
      actor,
      id,
      key,
      body,
      traceId,
      "propertyOwnerships.end",
      "propertyOwnership.ended",
      "PropertyOwnership",
      async (tx) =>
        tx.propertyOwnership.findFirst({
          where: { id, tenantId: actor.tenantId },
        }),
      async (tx) =>
        tx.propertyOwnership.update({
          data: {
            endDate: date(body.endDate),
            isPrimary: false,
            status: "ENDED",
          },
          where: { id },
        }),
      serializeOwnership,
    );
  }

  public async listResidencies(
    actor: ResidentsActorContext,
    query: RelationshipQueryDto,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "residencies.read");
    const where: Prisma.ResidencyWhereInput = {
      tenantId: actor.tenantId,
      ...(query.propertyUnitId ? { propertyUnitId: query.propertyUnitId } : {}),
      ...(query.personId ? { personId: query.personId } : {}),
      ...(query.status ? { status: query.status.toUpperCase() as never } : {}),
    };
    return this.page(
      query,
      traceId,
      await this.prisma.residency.findMany({
        orderBy: { createdAt: "desc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      await this.prisma.residency.count({ where }),
      serializeResidency,
    );
  }
  public async getResidency(
    actor: ResidentsActorContext,
    id: string,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "residencies.read");
    return envelope(
      serializeResidency(
        requireResource(
          await this.prisma.residency.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }
  public createResidency(
    actor: ResidentsActorContext,
    key: string | undefined,
    body: CreateResidencyDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "residencies.create",
      {},
      body,
      "residencies.create",
      traceId,
      async (tx) => {
        await this.assertReferences(
          tx,
          actor.tenantId,
          body.propertyUnitId,
          body.personId,
        );
        const value = await tx.residency.create({
          data: compact({
            isPrimaryResident: body.isPrimaryResident,
            personId: body.personId,
            propertyUnitId: body.propertyUnitId,
            residencyType:
              body.residencyType === undefined
                ? undefined
                : residencyType[
                    body.residencyType as keyof typeof residencyType
                  ],
            startDate: date(body.startDate),
            tenantId: actor.tenantId,
          }) as Prisma.ResidencyUncheckedCreateInput,
        });
        await this.record(tx, actor, traceId, "residency.created", value.id);
        return created(
          serializeResidency(value),
          traceId,
          "Residency",
          value.id,
        );
      },
    );
  }
  public updateResidency(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: UpdateResidencyDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "PATCH",
      "residencies.update",
      { residencyId: id },
      body,
      "residencies.update",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.residency.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (body.status !== undefined)
          assertTransition(
            "Residency",
            current.status,
            residencyStatus[body.status as keyof typeof residencyStatus],
            { ACTIVE: ["SUSPENDED"], SUSPENDED: ["ACTIVE"] },
          );
        const changedFields = Object.keys(body);
        requireChanges(changedFields);
        const value = await tx.residency.update({
          data: compact({
            ...body,
            residencyType:
              body.residencyType === undefined
                ? undefined
                : residencyType[
                    body.residencyType as keyof typeof residencyType
                  ],
            status:
              body.status === undefined
                ? undefined
                : residencyStatus[body.status as keyof typeof residencyStatus],
          }) as Prisma.ResidencyUncheckedUpdateInput,
          where: { id },
        });
        await this.record(tx, actor, traceId, "residency.updated", id, {
          changedFields,
        });
        if (body.status !== undefined && current.status !== value.status)
          await this.record(
            tx,
            actor,
            traceId,
            value.status === "SUSPENDED"
              ? "residency.suspended"
              : "residency.reactivated",
            id,
            statusMetadata(current.status, value.status),
          );
        return ok(serializeResidency(value), traceId, "Residency", id);
      },
    );
  }
  public endResidency(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: EndRelationshipDto,
    traceId: string,
  ) {
    return this.endRelation(
      actor,
      id,
      key,
      body,
      traceId,
      "residencies.end",
      "residency.ended",
      "Residency",
      async (tx) =>
        tx.residency.findFirst({ where: { id, tenantId: actor.tenantId } }),
      async (tx) =>
        tx.residency.update({
          data: {
            endDate: date(body.endDate),
            isPrimaryResident: false,
            status: "ENDED",
          },
          where: { id },
        }),
      serializeResidency,
    );
  }

  public async listLeases(
    actor: ResidentsActorContext,
    query: PageQueryDto,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "leases.read");
    const where = { tenantId: actor.tenantId };
    return this.page(
      query,
      traceId,
      await this.prisma.lease.findMany({
        orderBy: { createdAt: "desc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      await this.prisma.lease.count({ where }),
      serializeLease,
    );
  }
  public async getLease(
    actor: ResidentsActorContext,
    id: string,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "leases.read");
    return envelope(
      serializeLease(
        requireResource(
          await this.prisma.lease.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }
  public createLease(
    actor: ResidentsActorContext,
    key: string | undefined,
    body: CreateLeaseDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "leases.create",
      {},
      body,
      "leases.create",
      traceId,
      async (tx) => {
        requireXor(body.ownerPersonId, body.ownerLegalEntityId);
        await this.assertReferences(
          tx,
          actor.tenantId,
          body.propertyUnitId,
          body.tenantPersonId,
          body.ownerLegalEntityId,
        );
        if (body.ownerPersonId !== undefined)
          await this.assertReferences(
            tx,
            actor.tenantId,
            body.propertyUnitId,
            body.ownerPersonId,
          );
        if (
          body.endDate !== undefined &&
          date(body.endDate) < date(body.startDate)
        )
          throw validation();
        const value = await tx.lease.create({
          data: compact({
            endDate:
              body.endDate === undefined ? undefined : date(body.endDate),
            ownerLegalEntityId: body.ownerLegalEntityId,
            ownerPersonId: body.ownerPersonId,
            propertyUnitId: body.propertyUnitId,
            startDate: date(body.startDate),
            tenantId: actor.tenantId,
            tenantPersonId: body.tenantPersonId,
          }) as Prisma.LeaseUncheckedCreateInput,
        });
        await this.record(tx, actor, traceId, "lease.created", value.id);
        return created(serializeLease(value), traceId, "Lease", value.id);
      },
    );
  }
  public updateLease(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: UpdateLeaseDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "PATCH",
      "leases.update",
      { leaseId: id },
      body,
      "leases.update",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.lease.findFirst({ where: { id, tenantId: actor.tenantId } }),
        );
        const next =
          body.status === undefined
            ? current.status
            : leaseStatus[body.status as keyof typeof leaseStatus];
        if (body.status !== undefined)
          assertTransition("Lease", current.status, next, {
            ACTIVE: [],
            CANCELLED: ["ARCHIVED"],
            DRAFT: ["ACTIVE", "CANCELLED"],
            ENDED: ["ARCHIVED"],
          });
        if (
          body.endDate !== undefined &&
          date(body.endDate) < current.startDate
        )
          throw validation();
        let residencyId = current.residencyId;
        if (next === "ACTIVE" && current.status === "DRAFT") {
          const residency = await tx.residency.create({
            data: {
              personId: current.tenantPersonId,
              propertyUnitId: current.propertyUnitId,
              residencyType: "TENANT",
              startDate: current.startDate,
              tenantId: actor.tenantId,
            },
          });
          residencyId = residency.id;
          await this.record(
            tx,
            actor,
            traceId,
            "residency.created",
            residency.id,
          );
        }
        const changedFields = Object.keys(body);
        requireChanges(changedFields);
        const value = await tx.lease.update({
          data: compact({
            endDate:
              body.endDate === undefined ? undefined : date(body.endDate),
            residencyId,
            status: next,
          }) as Prisma.LeaseUncheckedUpdateInput,
          where: { id },
        });
        await this.record(tx, actor, traceId, "lease.updated", id, {
          changedFields,
        });
        if (current.status !== value.status) {
          const action: AuditAction =
            value.status === "ACTIVE"
              ? "lease.activated"
              : value.status === "CANCELLED"
                ? "lease.cancelled"
                : "lease.archived";
          await this.record(
            tx,
            actor,
            traceId,
            action,
            id,
            statusMetadata(current.status, value.status),
          );
        }
        return ok(serializeLease(value), traceId, "Lease", id);
      },
    );
  }
  public endLease(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: EndRelationshipDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "leases.end",
      { leaseId: id },
      body,
      "leases.end",
      traceId,
      async (tx) => {
        const current = requireResource(
          await tx.lease.findFirst({ where: { id, tenantId: actor.tenantId } }),
        );
        if (current.status !== "ACTIVE") throw conflict();
        const endDate = date(body.endDate);
        if (endDate < current.startDate) throw validation();
        if (current.residencyId !== null) {
          const residency = await tx.residency.findFirst({
            where: { id: current.residencyId, tenantId: actor.tenantId },
          });
          if (
            residency !== null &&
            ["ACTIVE", "SUSPENDED"].includes(residency.status)
          ) {
            await tx.residency.update({
              data: { endDate, isPrimaryResident: false, status: "ENDED" },
              where: { id: residency.id },
            });
            await this.record(
              tx,
              actor,
              traceId,
              "residency.ended",
              residency.id,
              statusMetadata(residency.status, "ENDED"),
            );
          }
        }
        const value = await tx.lease.update({
          data: { endDate, status: "ENDED" },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "lease.ended",
          id,
          statusMetadata(current.status, value.status),
        );
        return ok(serializeLease(value), traceId, "Lease", id);
      },
    );
  }

  public async getOwnPerson(actor: ResidentsActorContext, traceId: string) {
    await this.assertPermission(this.prisma, actor, "persons.read.own");
    return envelope(
      serializePerson(await this.requireOwnPerson(this.prisma, actor)),
      traceId,
    );
  }
  public async getOwnPropertyUnits(
    actor: ResidentsActorContext,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "propertyUnits.read.own");
    const person = await this.requireOwnPerson(this.prisma, actor);
    const values = await this.prisma.propertyUnit.findMany({
      orderBy: { code: "asc" },
      where: {
        status: { not: "ARCHIVED" },
        tenantId: actor.tenantId,
        OR: [
          { ownerships: { some: { personId: person.id, status: "ACTIVE" } } },
          { residencies: { some: { personId: person.id, status: "ACTIVE" } } },
        ],
      },
    });
    return envelope(values.map(serializeUnit), traceId);
  }
  public async getOwnResidencies(
    actor: ResidentsActorContext,
    traceId: string,
  ) {
    await this.assertPermission(this.prisma, actor, "residencies.read.own");
    const person = await this.requireOwnPerson(this.prisma, actor);
    const values = await this.prisma.residency.findMany({
      orderBy: { startDate: "desc" },
      where: {
        personId: person.id,
        status: "ACTIVE",
        tenantId: actor.tenantId,
      },
    });
    return envelope(values.map(serializeResidency), traceId);
  }

  private async mutate(
    actor: ResidentsActorContext,
    key: string | undefined,
    method: "PATCH" | "POST",
    operationType: string,
    path: Readonly<Record<string, string>>,
    body: unknown,
    permission: string,
    traceId: string,
    mutation: (transaction: Transaction) => Promise<{
      httpStatus: number;
      responseBody: Envelope;
      resourceType?: string;
      resourceId?: string;
    }>,
  ): Promise<IdempotentResult<Envelope>> {
    return this.idempotency.execute(
      {
        actor: actor as IdempotentActor,
        body,
        key,
        method,
        operationType,
        path,
      },
      (tx) => this.assertPermission(tx, actor, permission),
      mutation,
    );
  }
  private async endRelation<
    T extends { id: string; startDate: Date; status: string },
  >(
    actor: ResidentsActorContext,
    id: string,
    key: string | undefined,
    body: EndRelationshipDto,
    traceId: string,
    permission: string,
    action: AuditAction,
    resourceType: string,
    find: (tx: Transaction) => Promise<T | null>,
    update: (tx: Transaction) => Promise<T>,
    serialize: (value: T) => unknown,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      permission,
      { id },
      body,
      permission,
      traceId,
      async (tx) => {
        const current = requireResource(await find(tx));
        if (!["ACTIVE", "DISPUTED", "SUSPENDED"].includes(current.status))
          throw conflict();
        if (date(body.endDate) < current.startDate) throw validation();
        const value = await update(tx);
        await this.record(
          tx,
          actor,
          traceId,
          action,
          id,
          statusMetadata(current.status, "ENDED"),
        );
        return ok(serialize(value), traceId, resourceType, id);
      },
    );
  }
  private async record(
    tx: Transaction,
    actor: ResidentsActorContext,
    traceId: string,
    action: AuditAction,
    resourceId: string,
    metadata?: Readonly<Record<string, unknown>>,
  ) {
    await this.audit.recordConfirmed(
      tx,
      {
        actor: {
          membershipId: actor.membershipId,
          type: "USER",
          userProfileId: actor.userProfileId,
        },
        tenantId: actor.tenantId,
        traceId,
      },
      {
        action,
        ...(metadata === undefined ? {} : { metadata }),
        occurredAt: new Date(),
        resourceId,
      },
    );
  }
  private async assertPermission(
    client: ReadClient,
    actor: ResidentsActorContext,
    permission: string,
  ) {
    const membership = await client.userTenantMembership.findFirst({
      where: {
        id: actor.membershipId,
        status: "ACTIVE",
        tenant: { id: actor.tenantId, status: "ACTIVE" },
        tenantId: actor.tenantId,
        userProfile: { id: actor.userProfileId, status: "ACTIVE" },
        userProfileId: actor.userProfileId,
      },
    });
    if (membership === null)
      throw new ResidentsPropertiesError("ACCESS_DENIED");
    const assignment = await client.membershipRole.findFirst({
      where: {
        membershipId: actor.membershipId,
        removedAt: null,
        role: {
          scope: "TENANT",
          tenantId: actor.tenantId,
          permissions: { some: { permission: { code: permission } } },
        },
      },
    });
    if (assignment === null)
      throw new ResidentsPropertiesError("ACCESS_DENIED");
  }
  private async assertReferences(
    tx: Transaction,
    tenantId: string,
    propertyUnitId: string,
    personId?: string,
    legalEntityId?: string,
  ) {
    const [unit, person, entity] = await Promise.all([
      tx.propertyUnit.findFirst({ where: { id: propertyUnitId, tenantId } }),
      personId === undefined
        ? Promise.resolve({ id: "none" })
        : tx.person.findFirst({ where: { id: personId, tenantId } }),
      legalEntityId === undefined
        ? Promise.resolve({ id: "none" })
        : tx.legalEntity.findFirst({ where: { id: legalEntityId, tenantId } }),
    ]);
    if (unit === null || person === null || entity === null)
      throw new ResidentsPropertiesError("CROSS_TENANT_REFERENCE");
  }
  private async requireOwnPerson(
    client: PrismaService,
    actor: ResidentsActorContext,
  ) {
    const person = await client.person.findFirst({
      where: {
        status: "ACTIVE",
        tenantId: actor.tenantId,
        userProfileId: actor.userProfileId,
      },
    });
    if (person === null) throw new ResidentsPropertiesError("ACCESS_DENIED");
    return person;
  }
  private page<T>(
    query: PageQueryDto,
    traceId: string,
    values: readonly T[],
    total: number,
    serialize: (value: T) => unknown,
  ) {
    return {
      data: values.map(serialize),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
        traceId,
      },
    };
  }
}

function envelope(data: unknown, traceId: string): Envelope {
  return { data, meta: { traceId } };
}
function created(
  data: unknown,
  traceId: string,
  resourceType: string,
  resourceId: string,
) {
  return {
    httpStatus: 201,
    resourceId,
    resourceType,
    responseBody: envelope(data, traceId),
  };
}
function ok(
  data: unknown,
  traceId: string,
  resourceType: string,
  resourceId: string,
) {
  return {
    httpStatus: 200,
    resourceId,
    resourceType,
    responseBody: envelope(data, traceId),
  };
}
function offset(query: PageQueryDto) {
  return (query.page - 1) * query.pageSize;
}
function date(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime())) throw validation();
  return parsed;
}
function requireResource<T>(value: T | null): T {
  if (value === null) throw new ResidentsPropertiesError("RESOURCE_NOT_FOUND");
  return value;
}
function requireXor(left: string | undefined, right: string | undefined) {
  if ((left === undefined) === (right === undefined)) throw validation();
}
function requireChanges(fields: readonly string[]) {
  if (fields.length === 0) throw validation();
}
function validation() {
  return new ResidentsPropertiesError("VALIDATION_ERROR");
}
function conflict() {
  return new ResidentsPropertiesError("RESOURCE_STATE_CONFLICT");
}
function assertTransition(
  resource: string,
  current: string,
  next: string,
  allowed: Readonly<Record<string, readonly string[]>>,
) {
  if (current === next || !allowed[current]?.includes(next))
    throw new ResidentsPropertiesError("RESOURCE_STATE_CONFLICT");
}
function statusMetadata(previousStatus: string, newStatus: string) {
  return {
    newStatus: toContractEnum(newStatus),
    previousStatus: toContractEnum(previousStatus),
  };
}
function toContractEnum(value: string) {
  const [head, ...tail] = value.toLowerCase().split("_");
  return (
    head + tail.map((part) => part[0]?.toUpperCase() + part.slice(1)).join("")
  );
}
function mask(value: string | null) {
  if (value === null) return null;
  const tail = value.slice(-4);
  return `${"*".repeat(Math.max(0, value.length - 4))}${tail}`;
}
function base(value: {
  id: string;
  tenantId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    createdAt: value.createdAt.toISOString(),
    id: value.id,
    status: toContractEnum(value.status),
    tenantId: value.tenantId,
    updatedAt: value.updatedAt.toISOString(),
  };
}
function serializeUnit(value: PropertyUnit) {
  return {
    ...base(value),
    addressReference: value.addressReference,
    areaM2: value.areaM2?.toFixed(2) ?? null,
    archivedAt: value.archivedAt?.toISOString() ?? null,
    block: value.block,
    code: value.code,
    floor: value.floor,
    name: value.name,
    type: toContractEnum(value.type),
  };
}
function serializePerson(value: Person) {
  return {
    ...base(value),
    archivedAt: value.archivedAt?.toISOString() ?? null,
    displayName: value.displayName,
    email: value.email,
    firstName: value.firstName,
    identificationNumber: mask(value.identificationNumber),
    identificationType:
      value.identificationType === null
        ? null
        : toContractEnum(value.identificationType),
    lastName: value.lastName,
    phone: value.phone,
    userProfileId: value.userProfileId,
    whatsapp: value.whatsapp,
  };
}
function serializeLegalEntity(value: LegalEntity) {
  return {
    ...base(value),
    address: value.address,
    archivedAt: value.archivedAt?.toISOString() ?? null,
    email: value.email,
    name: value.name,
    phone: value.phone,
    taxIdentificationNumber: mask(value.taxIdentificationNumber),
    taxIdentificationType:
      value.taxIdentificationType === null
        ? null
        : toContractEnum(value.taxIdentificationType),
  };
}
function serializeOwnership(value: PropertyOwnership) {
  return {
    ...base(value),
    endDate: value.endDate?.toISOString().slice(0, 10) ?? null,
    isPrimary: value.isPrimary,
    legalEntityId: value.legalEntityId,
    ownershipPercentage: value.ownershipPercentage?.toFixed(2) ?? null,
    ownershipType: toContractEnum(value.ownershipType),
    personId: value.personId,
    propertyUnitId: value.propertyUnitId,
    startDate: value.startDate.toISOString().slice(0, 10),
  };
}
function serializeResidency(value: Residency) {
  return {
    ...base(value),
    endDate: value.endDate?.toISOString().slice(0, 10) ?? null,
    isPrimaryResident: value.isPrimaryResident,
    personId: value.personId,
    propertyUnitId: value.propertyUnitId,
    residencyType: toContractEnum(value.residencyType),
    startDate: value.startDate.toISOString().slice(0, 10),
  };
}
function serializeLease(value: Lease) {
  return {
    ...base(value),
    endDate: value.endDate?.toISOString().slice(0, 10) ?? null,
    ownerLegalEntityId: value.ownerLegalEntityId,
    ownerPersonId: value.ownerPersonId,
    propertyUnitId: value.propertyUnitId,
    residencyId: value.residencyId,
    startDate: value.startDate.toISOString().slice(0, 10),
    tenantPersonId: value.tenantPersonId,
  };
}
function compact<T extends Readonly<Record<string, unknown>>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, nested]) => nested !== undefined),
  );
}
