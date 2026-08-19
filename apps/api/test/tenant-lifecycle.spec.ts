import { describe, expect, it, vi } from "vitest";

import type { AuditWriterPort } from "../src/modules/audit/audit-writer.port.js";
import { TenantOnboardingAccess } from "../src/modules/identity-integration/tenant-onboarding-access.js";
import type { TenantInitialAdminIdentityPort } from "../src/modules/tenants/tenant-lifecycle.contract.js";
import { TenantLifecycleService } from "../src/modules/tenants/tenant-lifecycle.service.js";

const eligibleIdentity = {
  displayName: "Synthetic Tenant Admin",
  email: "tenant.admin@example.com",
  emailVerified: true,
  enabled: true,
  subject: "2cb7e6ff-b522-4cd5-80d3-e8848dc3c324",
};

function createService(identity = eligibleIdentity) {
  const transaction = vi.fn();
  const identityLookup: TenantInitialAdminIdentityPort = {
    resolveByEmail: vi.fn().mockResolvedValue(identity),
  };
  const auditWriter: AuditWriterPort = {
    recordConfirmed: vi.fn(),
    recordDenied: vi.fn(),
  };
  return {
    identityLookup,
    service: new TenantLifecycleService(
      { $transaction: transaction } as never,
      identityLookup,
      new TenantOnboardingAccess(),
      auditWriter,
    ),
    transaction,
  };
}

describe("Tenant lifecycle contract", () => {
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
    "fails before the Core transaction for an ineligible initial identity",
    async (identity, code) => {
      const { service, transaction } = createService(identity);
      await expect(
        service.create(
          {
            initialAdmin: { email: eligibleIdentity.email },
            name: "Synthetic Tenant",
          },
          "505359ad-970d-4fb5-bf9a-c44910cecd52",
          "phase6-unit",
        ),
      ).rejects.toMatchObject({ code });
      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it("rejects reserved slugs before identity or persistence", async () => {
    const { identityLookup, service, transaction } = createService();
    await expect(
      service.create(
        {
          initialAdmin: { email: eligibleIdentity.email },
          name: "API",
          slug: "api",
        },
        "505359ad-970d-4fb5-bf9a-c44910cecd52",
        "phase6-unit",
      ),
    ).rejects.toMatchObject({ code: "TENANT_INVALID_INPUT" });
    expect(identityLookup.resolveByEmail).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });
});
