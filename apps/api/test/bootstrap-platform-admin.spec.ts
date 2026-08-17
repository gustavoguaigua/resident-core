import { describe, expect, it, vi } from "vitest";

import type { AuditWriterPort } from "../src/modules/audit/audit-writer.port.js";
import {
  parseBootstrapArguments,
  type PlatformAdminBootstrapError,
  type PlatformIdentityLookupPort,
  type VerifiedPlatformIdentity,
} from "../src/modules/platform-admin-bootstrap/bootstrap-contract.js";
import { BootstrapFirstPlatformAdmin } from "../src/modules/platform-admin-bootstrap/bootstrap-first-platform-admin.js";

const eligibleIdentity = {
  displayName: "Synthetic Platform Admin",
  email: "platform.admin@example.com",
  emailVerified: true,
  enabled: true,
  subject: "7f508711-059f-4bd1-b33d-3d64a5996db9",
} satisfies VerifiedPlatformIdentity;

const createUseCase = (identity: VerifiedPlatformIdentity) => {
  const transaction = vi.fn();
  const prisma = { $transaction: transaction };
  const identityLookup: PlatformIdentityLookupPort = {
    resolveByEmail: vi.fn().mockResolvedValue(identity),
  };
  const auditWriter: AuditWriterPort = {
    recordConfirmed: vi.fn(),
    recordDenied: vi.fn(),
  };
  return {
    transaction,
    useCase: new BootstrapFirstPlatformAdmin(
      prisma as never,
      identityLookup,
      auditWriter,
    ),
  };
};

describe("PlatformAdmin bootstrap contract", () => {
  it("accepts only the canonical email argument and normalizes it", () => {
    expect(
      parseBootstrapArguments(["--email", " Platform.Admin@Example.COM "]),
    ).toEqual({ email: "platform.admin@example.com" });

    for (const arguments_ of [
      ["--subject", eligibleIdentity.subject],
      ["--role", "PlatformAdmin"],
      ["--email", "invalid"],
      ["--email", eligibleIdentity.email, "--role", "PlatformAdmin"],
    ]) {
      expect(() => parseBootstrapArguments(arguments_)).toThrowError(
        expect.objectContaining({ code: "BOOTSTRAP_INVALID_INPUT" }),
      );
    }
  });

  it.each([
    [{ ...eligibleIdentity, enabled: false }, "IDENTITY_NOT_ELIGIBLE"],
    [{ ...eligibleIdentity, emailVerified: false }, "IDENTITY_NOT_ELIGIBLE"],
    [
      { ...eligibleIdentity, subject: "invalid subject" },
      "IDENTITY_SUBJECT_INVALID",
    ],
    [
      { ...eligibleIdentity, email: "other@example.com" },
      "IDENTITY_NOT_ELIGIBLE",
    ],
  ] as const)(
    "fails before opening Core transaction for an invalid identity",
    async (identity, code) => {
      const { transaction, useCase } = createUseCase(identity);
      await expect(useCase.execute(eligibleIdentity.email)).rejects.toEqual(
        expect.objectContaining<Partial<PlatformAdminBootstrapError>>({ code }),
      );
      expect(transaction).not.toHaveBeenCalled();
    },
  );
});
