import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaService } from "../../src/platform/database/prisma.service.js";

describe("PrismaService PostgreSQL integration", () => {
  const prisma = new PrismaService();

  beforeAll(async () => {
    await prisma.onModuleInit();
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it("executes the technical connectivity probe against PostgreSQL", async () => {
    await expect(prisma.isAvailable()).resolves.toBe(true);
  });
});
