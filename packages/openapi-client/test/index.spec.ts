import { describe, expect, it } from "vitest";

import {
  createResidentCoreClient,
  OPENAPI_CLIENT_STATUS,
  type components,
  type operations,
} from "../src/index.js";

describe("generated OpenAPI client", () => {
  it("exposes the generated contract through a transport-only client", () => {
    const client = createResidentCoreClient({
      baseUrl: "https://example.invalid",
    });
    expect(OPENAPI_CLIENT_STATUS).toBe("generated");
    expect(client.GET).toBeTypeOf("function");
  });

  it("exports useful generated discovery and financial types", () => {
    const profile: components["schemas"]["CurrentUserDataDto"] = {
      displayName: "Tenant admin",
      status: "active",
      userProfileId: "00000000-0000-4000-8000-000000000001",
    };
    type ChargeResponse =
      operations["ChargesController_get"]["responses"][200]["content"]["application/json"];
    const chargeAmount: ChargeResponse["data"]["effectiveAmount"] = "100.00";
    expect(profile.displayName).toBe("Tenant admin");
    expect(chargeAmount).toBe("100.00");
  });
});
