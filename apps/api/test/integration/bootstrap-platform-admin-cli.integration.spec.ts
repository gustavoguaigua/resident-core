import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const enabled = process.env.BOOTSTRAP_PHASE4_TEST === "1";
const databaseUrl = process.env.BOOTSTRAP_CLI_DATABASE_URL;

if (!enabled) {
  describe.skip("PlatformAdmin bootstrap command persistence", () => {
    it("runs only through the phase 4 gate", () => undefined);
  });
} else {
  describe("PlatformAdmin bootstrap command persistence", () => {
    if (!databaseUrl) {
      throw new Error("Missing phase 4 CLI database URL.");
    }
    const prisma = new PrismaClient({ datasourceUrl: databaseUrl });

    beforeAll(async () => prisma.$connect());
    afterAll(async () => prisma.$disconnect());

    it("is idempotent and persists no tenant-scoped state", async () => {
      expect(await prisma.userProfile.count()).toBe(1);
      expect(await prisma.userGlobalRole.count()).toBe(1);
      expect(await prisma.auditLog.count()).toBe(1);
      expect(await prisma.tenant.count()).toBe(0);
    });
  });
}
