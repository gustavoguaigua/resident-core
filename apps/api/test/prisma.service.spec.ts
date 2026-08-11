import { describe, expect, it, vi } from "vitest";

import { PrismaService } from "../src/platform/database/prisma.service.js";

describe("PrismaService", () => {
  it("connects and disconnects with the NestJS lifecycle", async () => {
    const prisma = new PrismaService();
    const connect = vi.spyOn(prisma, "$connect").mockResolvedValue(undefined);
    const disconnect = vi
      .spyOn(prisma, "$disconnect")
      .mockResolvedValue(undefined);

    await prisma.onModuleInit();
    await prisma.onModuleDestroy();

    expect(connect).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("returns a boolean probe without exposing provider errors", async () => {
    const prisma = new PrismaService();
    const query = vi
      .spyOn(prisma, "$queryRaw")
      .mockRejectedValue(new Error("postgresql://resident:secret@internal/db"));

    await expect(prisma.isAvailable()).resolves.toBe(false);
    expect(query).toHaveBeenCalledOnce();
  });
});
