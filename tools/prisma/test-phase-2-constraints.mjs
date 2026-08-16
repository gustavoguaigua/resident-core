import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const expectPrismaError = async (operation, code) => {
  try {
    await operation();
  } catch (error) {
    if (error?.code === code) {
      return;
    }
    throw error;
  }
  throw new Error(`Expected Prisma error ${code}.`);
};

try {
  const tenant = await prisma.tenant.create({
    data: { name: "Tenant A", slug: "tenant-a" },
  });
  const otherTenant = await prisma.tenant.create({
    data: { name: "Tenant B", slug: "tenant-b" },
  });
  const user = await prisma.userProfile.create({
    data: {
      email: "phase2@example.test",
      displayName: "Phase 2 User",
      keycloakSubjectId: "sub-1",
    },
  });

  await prisma.tenantProfile.create({
    data: { tenantId: tenant.id, displayName: "Tenant A" },
  });
  await prisma.userTenantMembership.create({
    data: { tenantId: tenant.id, userProfileId: user.id },
  });

  await expectPrismaError(
    () =>
      prisma.tenant.create({ data: { name: "Duplicate", slug: tenant.slug } }),
    "P2002",
  );
  await expectPrismaError(
    () =>
      prisma.userProfile.create({
        data: {
          email: "another@example.test",
          displayName: "Duplicate subject",
          keycloakSubjectId: user.keycloakSubjectId,
        },
      }),
    "P2002",
  );
  await expectPrismaError(
    () =>
      prisma.userTenantMembership.create({
        data: { tenantId: tenant.id, userProfileId: user.id },
      }),
    "P2002",
  );
  await expectPrismaError(
    () => prisma.tenant.delete({ where: { id: tenant.id } }),
    "P2003",
  );

  const otherTenantMemberships = await prisma.userTenantMembership.count({
    where: { tenantId: otherTenant.id },
  });
  if (otherTenantMemberships !== 0) {
    throw new Error(
      "Tenant-scoped membership query crossed the tenant boundary.",
    );
  }

  process.stdout.write("Phase 2 persistence constraints are valid.\n");
} finally {
  await prisma.$disconnect();
}
