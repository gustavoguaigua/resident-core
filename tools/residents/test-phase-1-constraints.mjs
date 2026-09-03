import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const expectPrismaError = async (operation, expectedCodes) => {
  try {
    await operation();
  } catch (error) {
    if (expectedCodes.includes(error?.code)) {
      return;
    }
    throw error;
  }
  throw new Error("Expected Prisma error: " + expectedCodes.join(" or ") + ".");
};

const expectConstraintError = async (operation) => {
  try {
    await operation();
  } catch (error) {
    if (error?.code === "P2004" || error?.message?.includes('code: "23514"')) {
      return;
    }
    throw error;
  }
  throw new Error("Expected PostgreSQL check constraint error 23514.");
};

try {
  const tenantA = await prisma.tenant.create({
    data: { name: "Residents Tenant A", slug: "residents-tenant-a" },
  });
  const tenantB = await prisma.tenant.create({
    data: { name: "Residents Tenant B", slug: "residents-tenant-b" },
  });
  const user = await prisma.userProfile.create({
    data: {
      email: "resident@example.test",
      displayName: "Resident User",
      keycloakSubjectId: "resident-subject",
      status: "ACTIVE",
      userType: "HUMAN",
    },
  });
  await prisma.userTenantMembership.createMany({
    data: [
      { tenantId: tenantA.id, userProfileId: user.id, status: "ACTIVE" },
      { tenantId: tenantB.id, userProfileId: user.id, status: "ACTIVE" },
    ],
  });

  const personA = await prisma.person.create({
    data: {
      tenantId: tenantA.id,
      userProfileId: user.id,
      displayName: "Person A",
      identificationType: "CEDULA",
      identificationNumber: "synthetic-001",
    },
  });
  await prisma.person.create({
    data: {
      tenantId: tenantB.id,
      userProfileId: user.id,
      displayName: "Person B",
      identificationType: "CEDULA",
      identificationNumber: "synthetic-001",
    },
  });
  const tenantPersonA = await prisma.person.create({
    data: { tenantId: tenantA.id, displayName: "Tenant Person A" },
  });
  const personB = await prisma.person.create({
    data: { tenantId: tenantB.id, displayName: "Cross Tenant Person" },
  });

  await expectPrismaError(
    () =>
      prisma.person.create({
        data: {
          tenantId: tenantA.id,
          userProfileId: user.id,
          displayName: "Duplicate User Link",
        },
      }),
    ["P2002"],
  );
  await expectPrismaError(
    () =>
      prisma.person.create({
        data: {
          tenantId: tenantA.id,
          userProfileId: "00000000-0000-4000-8000-000000000099",
          displayName: "Unknown User Profile",
        },
      }),
    ["P2003"],
  );
  await expectPrismaError(
    () =>
      prisma.person.create({
        data: {
          tenantId: tenantA.id,
          displayName: "Duplicate Identification",
          identificationType: "CEDULA",
          identificationNumber: "synthetic-001",
        },
      }),
    ["P2002"],
  );
  await expectConstraintError(() =>
    prisma.person.create({
      data: {
        tenantId: tenantA.id,
        displayName: "Incomplete Identification",
        identificationType: "PASSPORT",
      },
    }),
  );

  const legalEntityA = await prisma.legalEntity.create({
    data: {
      tenantId: tenantA.id,
      name: "Legal Entity A",
      taxIdentificationType: "RUC",
      taxIdentificationNumber: "synthetic-ruc-001",
    },
  });
  const unitA = await prisma.propertyUnit.create({
    data: { tenantId: tenantA.id, code: "A-001", areaM2: "100.00" },
  });
  await prisma.propertyUnit.create({
    data: { tenantId: tenantB.id, code: "A-001", areaM2: "100.00" },
  });

  await expectPrismaError(
    () =>
      prisma.propertyUnit.create({
        data: { tenantId: tenantA.id, code: "A-001" },
      }),
    ["P2002"],
  );
  await expectConstraintError(() =>
    prisma.propertyUnit.create({
      data: { tenantId: tenantA.id, code: "INVALID-AREA", areaM2: "0" },
    }),
  );
  await expectPrismaError(
    () =>
      prisma.propertyOwnership.create({
        data: {
          tenantId: tenantA.id,
          propertyUnitId: unitA.id,
          personId: personB.id,
          startDate: new Date("2026-01-01"),
        },
      }),
    ["P2003"],
  );
  await expectConstraintError(() =>
    prisma.propertyOwnership.create({
      data: {
        tenantId: tenantA.id,
        propertyUnitId: unitA.id,
        personId: personA.id,
        legalEntityId: legalEntityA.id,
        startDate: new Date("2026-01-01"),
      },
    }),
  );

  await prisma.propertyOwnership.create({
    data: {
      tenantId: tenantA.id,
      propertyUnitId: unitA.id,
      personId: personA.id,
      ownershipPercentage: "60.00",
      isPrimary: true,
      startDate: new Date("2026-01-01"),
    },
  });
  await prisma.propertyOwnership.create({
    data: {
      tenantId: tenantA.id,
      propertyUnitId: unitA.id,
      legalEntityId: legalEntityA.id,
      ownershipPercentage: "40.00",
      startDate: new Date("2026-01-01"),
    },
  });
  await expectConstraintError(() =>
    prisma.propertyOwnership.create({
      data: {
        tenantId: tenantA.id,
        propertyUnitId: unitA.id,
        personId: tenantPersonA.id,
        ownershipPercentage: "1.00",
        startDate: new Date("2026-01-01"),
      },
    }),
  );
  await expectPrismaError(
    () =>
      prisma.propertyOwnership.create({
        data: {
          tenantId: tenantA.id,
          propertyUnitId: unitA.id,
          personId: tenantPersonA.id,
          isPrimary: true,
          startDate: new Date("2026-01-01"),
        },
      }),
    ["P2002"],
  );

  await prisma.residency.create({
    data: {
      tenantId: tenantA.id,
      propertyUnitId: unitA.id,
      personId: personA.id,
      residencyType: "OWNER_RESIDENT",
      isPrimaryResident: true,
      startDate: new Date("2026-01-01"),
    },
  });
  await expectPrismaError(
    () =>
      prisma.residency.create({
        data: {
          tenantId: tenantA.id,
          propertyUnitId: unitA.id,
          personId: personB.id,
          startDate: new Date("2026-01-01"),
        },
      }),
    ["P2003"],
  );
  await expectPrismaError(
    () =>
      prisma.residency.create({
        data: {
          tenantId: tenantA.id,
          propertyUnitId: unitA.id,
          personId: tenantPersonA.id,
          isPrimaryResident: true,
          startDate: new Date("2026-01-01"),
        },
      }),
    ["P2002"],
  );

  await prisma.lease.create({
    data: {
      tenantId: tenantA.id,
      propertyUnitId: unitA.id,
      ownerPersonId: personA.id,
      tenantPersonId: tenantPersonA.id,
      startDate: new Date("2026-02-01"),
    },
  });
  await expectConstraintError(() =>
    prisma.lease.create({
      data: {
        tenantId: tenantA.id,
        propertyUnitId: unitA.id,
        ownerPersonId: personA.id,
        tenantPersonId: tenantPersonA.id,
        status: "ACTIVE",
        startDate: new Date("2026-02-01"),
      },
    }),
  );
  const tenantResidency = await prisma.residency.create({
    data: {
      tenantId: tenantA.id,
      propertyUnitId: unitA.id,
      personId: tenantPersonA.id,
      residencyType: "TENANT",
      startDate: new Date("2026-02-01"),
    },
  });
  await prisma.lease.create({
    data: {
      tenantId: tenantA.id,
      propertyUnitId: unitA.id,
      ownerLegalEntityId: legalEntityA.id,
      tenantPersonId: tenantPersonA.id,
      residencyId: tenantResidency.id,
      status: "ACTIVE",
      startDate: new Date("2026-02-01"),
    },
  });

  const tenantAUnits = await prisma.propertyUnit.count({
    where: { tenantId: tenantA.id },
  });
  const tenantBUnits = await prisma.propertyUnit.count({
    where: { tenantId: tenantB.id },
  });
  if (tenantAUnits !== 1 || tenantBUnits !== 1) {
    throw new Error("Tenant-scoped property unit queries crossed a boundary.");
  }

  await expectPrismaError(
    () => prisma.person.delete({ where: { id: personA.id } }),
    ["P2003"],
  );

  process.stdout.write(
    "Residents and properties persistence constraints are valid.\n",
  );
} finally {
  await prisma.$disconnect();
}
