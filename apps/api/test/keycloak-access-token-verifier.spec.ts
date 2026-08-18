import { generateKeyPairSync, sign } from "node:crypto";

import { describe, expect, it } from "vitest";

import { KeycloakAccessTokenVerifier } from "../src/modules/identity-integration/keycloak-access-token-verifier.js";
import type { AccessTokenVerificationError } from "../src/modules/identity-integration/keycloak-access-token-verifier.js";

const NOW = 1_786_982_400_000;
const ISSUER = "https://identity.example.test/realms/resident";
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2_048,
});
const publicJwk = publicKey.export({ format: "jwk" });
const KID = "phase5-test-key";

const verifier = new KeycloakAccessTokenVerifier({
  audience: "resident-api",
  authorizedParties: ["resident-admin-web", "resident-resident-web"],
  fetchImplementation: async () =>
    new Response(
      JSON.stringify({ keys: [{ ...publicJwk, kid: KID, use: "sig" }] }),
      {
        headers: { "content-type": "application/json" },
        status: 200,
      },
    ),
  issuer: ISSUER,
  jwksUrl: "https://identity.example.test/realms/resident/certs",
  now: () => NOW,
});

describe("Keycloak access token verifier", () => {
  it("accepts the canonical RS256 contract and returns only the stable subject", async () => {
    const result = await verifier.verify(requestFor(token()));

    expect(result).toEqual({ subject: "keycloak-subject-phase5" });
    expect(result).not.toHaveProperty("realm_access");
    expect(result).not.toHaveProperty("tenantId");
  });

  it.each([
    ["issuer", { iss: "https://attacker.invalid/realms/resident" }],
    ["audience", { aud: "different-api" }],
    ["authorized party", { azp: "unapproved-client" }],
    ["expiration", { exp: NOW / 1_000 - 60 }],
    ["verified email", { email_verified: false }],
    ["subject", { sub: "" }],
  ])("rejects an invalid %s", async (_label, overrides) => {
    await expect(
      verifier.verify(requestFor(token(overrides))),
    ).rejects.toMatchObject({
      code: "INVALID_ACCESS_TOKEN",
    } satisfies Partial<AccessTokenVerificationError>);
  });

  it("does not accept a Keycloak role or tenant claim as authority", async () => {
    const result = await verifier.verify(
      requestFor(
        token({
          realm_access: { roles: ["PlatformAdmin"] },
          tenantId: "00000000-0000-4000-8000-000000000999",
        }),
      ),
    );

    expect(result).toEqual({ subject: "keycloak-subject-phase5" });
  });
});

function requestFor(accessToken: string): object {
  return { headers: { authorization: `Bearer ${accessToken}` } };
}

function token(overrides: Readonly<Record<string, unknown>> = {}): string {
  const header = encode({ alg: "RS256", kid: KID, typ: "JWT" });
  const payload = encode({
    aud: ["account", "resident-api"],
    azp: "resident-admin-web",
    email: "phase5.user@example.test",
    email_verified: true,
    exp: NOW / 1_000 + 300,
    iat: NOW / 1_000,
    iss: ISSUER,
    sub: "keycloak-subject-phase5",
    typ: "Bearer",
    ...overrides,
  });
  const signingInput = `${header}.${payload}`;
  const signature = sign("RSA-SHA256", Buffer.from(signingInput), privateKey);
  return `${signingInput}.${signature.toString("base64url")}`;
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
