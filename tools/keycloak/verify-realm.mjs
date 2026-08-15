import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  adminRequest,
  fetchJson,
  findClient,
  getAdminToken,
  invariant,
  keycloakBaseUrl,
  realmName,
  repositoryIssuer,
  requiredEnvironment,
  waitForJson,
} from "./lib.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const realmPath = resolve(
  repositoryRoot,
  "infra/keycloak/realm/resident-realm.json",
);
const fixturePath = resolve(
  repositoryRoot,
  "infra/keycloak/fixtures/local-identities.json",
);
const realm = JSON.parse(readFileSync(realmPath, "utf8"));
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const expectedClients = {
  "resident-admin-web": {
    publicClient: true,
    bearerOnly: false,
    standardFlowEnabled: true,
    serviceAccountsEnabled: false,
    redirectUris: ["http://localhost:3001/auth/callback"],
    webOrigins: ["http://localhost:3001"],
    postLogout: "http://localhost:3001/",
  },
  "resident-resident-web": {
    publicClient: true,
    bearerOnly: false,
    standardFlowEnabled: true,
    serviceAccountsEnabled: false,
    redirectUris: ["http://localhost:3002/auth/callback"],
    webOrigins: ["http://localhost:3002"],
    postLogout: "http://localhost:3002/",
  },
  "resident-api": {
    publicClient: true,
    bearerOnly: true,
    standardFlowEnabled: false,
    serviceAccountsEnabled: false,
    redirectUris: [],
    webOrigins: [],
  },
  "resident-identity-admin": {
    publicClient: false,
    bearerOnly: false,
    standardFlowEnabled: false,
    serviceAccountsEnabled: true,
    redirectUris: [],
    webOrigins: [],
  },
};

const compareArray = (actual, expected, label) => {
  invariant(
    JSON.stringify([...(actual ?? [])].sort()) ===
      JSON.stringify([...expected].sort()),
    label + " does not match the contract.",
  );
};

const inspectForbiddenKeys = (value, path = "realm") => {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      inspectForbiddenKeys(entry, path + "[" + index + "]"),
    );
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    invariant(
      !["secret", "clientSecret", "users", "credentials"].includes(key),
      "Versioned realm contains forbidden key " + path + "." + key + ".",
    );
    inspectForbiddenKeys(child, path + "." + key);
  }
};

inspectForbiddenKeys(realm);
invariant(
  realm.realm === "resident" && realm.enabled,
  "Realm must be resident.",
);
invariant(
  realm.registrationAllowed === false,
  "Public registration must be off.",
);
invariant(realm.verifyEmail === true, "Email verification must be required.");
invariant(
  realm.bruteForceProtected === true,
  "Brute-force protection must be on.",
);
invariant(
  realm.defaultSignatureAlgorithm === "RS256",
  "Access token signing must use RS256.",
);
invariant(
  realm.accessTokenLifespan === 300,
  "Access token lifespan must be 300.",
);
invariant(realm.accessCodeLifespan === 60, "Code lifespan must be 60.");
invariant(realm.ssoSessionIdleTimeout === 1800, "SSO idle must be 1800.");
invariant(realm.ssoSessionMaxLifespan === 36000, "SSO max must be 36000.");
invariant(
  realm.revokeRefreshToken === true,
  "Refresh rotation must be enabled.",
);
invariant(realm.refreshTokenMaxReuse === 0, "Refresh reuse must be zero.");
invariant(
  realm.clients.length === 4,
  "Exactly four Sprint 2 clients are required.",
);

for (const [clientId, expected] of Object.entries(expectedClients)) {
  const clients = realm.clients.filter(
    (client) => client.clientId === clientId,
  );
  invariant(
    clients.length === 1,
    "Missing or duplicate client " + clientId + ".",
  );
  const client = clients[0];
  for (const field of [
    "publicClient",
    "bearerOnly",
    "standardFlowEnabled",
    "serviceAccountsEnabled",
  ]) {
    invariant(
      client[field] === expected[field],
      clientId + " has invalid " + field + ".",
    );
  }
  invariant(
    client.implicitFlowEnabled === false,
    clientId + " enables implicit.",
  );
  invariant(
    client.directAccessGrantsEnabled === false,
    clientId + " enables password grant.",
  );
  compareArray(
    client.redirectUris,
    expected.redirectUris,
    clientId + " redirects",
  );
  compareArray(client.webOrigins, expected.webOrigins, clientId + " origins");
  if (clientId.endsWith("-web")) {
    invariant(
      client.attributes?.["pkce.code.challenge.method"] === "S256",
      clientId + " must require PKCE S256.",
    );
    invariant(
      client.attributes?.["post.logout.redirect.uris"] === expected.postLogout,
      clientId + " post logout URI is invalid.",
    );
    compareArray(
      client.defaultClientScopes,
      ["basic", "profile", "email", "resident-api-audience"],
      clientId + " default scopes",
    );
  }
}

const audienceScope = realm.clientScopes.filter(
  (scope) => scope.name === "resident-api-audience",
);
invariant(audienceScope.length === 1, "Audience scope must be unique.");
invariant(
  audienceScope[0].protocolMappers?.length === 1,
  "Audience scope must have one mapper.",
);
const mapper = audienceScope[0].protocolMappers[0];
invariant(
  mapper.protocolMapper === "oidc-audience-mapper" &&
    mapper.config?.["included.client.audience"] === "resident-api" &&
    mapper.config?.["access.token.claim"] === "true" &&
    mapper.config?.["id.token.claim"] === "false" &&
    mapper.config?.["userinfo.token.claim"] === "false",
  "Audience mapper violates the token contract.",
);

const fixtureEmails = fixture.identities.map((identity) => identity.email);
compareArray(
  fixtureEmails,
  [
    "platform.admin@example.com",
    "tenant.admin@example.com",
    "resident.user@example.com",
  ],
  "Synthetic identity fixture",
);
invariant(
  fixture.identities.every(
    (identity) =>
      identity.enabled &&
      identity.emailVerified &&
      identity.email.endsWith("@example.com") &&
      !("password" in identity),
  ),
  "Fixtures must be enabled, verified, synthetic and password-free.",
);

const discovery = await waitForJson(
  repositoryIssuer + "/.well-known/openid-configuration",
);
invariant(
  discovery.issuer === repositoryIssuer,
  "Discovery issuer drift detected.",
);
invariant(
  discovery.jwks_uri === repositoryIssuer + "/protocol/openid-connect/certs",
  "Discovery JWKS URI drift detected.",
);
const { body: jwks } = await fetchJson(discovery.jwks_uri);
invariant(
  Array.isArray(jwks.keys) &&
    jwks.keys.some((key) => key.kty === "RSA" && key.use === "sig"),
  "JWKS has no RSA signing key.",
);

const adminToken = await getAdminToken();
const { body: liveRealm } = await adminRequest("", {}, adminToken);
for (const field of [
  "enabled",
  "registrationAllowed",
  "loginWithEmailAllowed",
  "duplicateEmailsAllowed",
  "verifyEmail",
  "resetPasswordAllowed",
  "rememberMe",
  "bruteForceProtected",
  "accessTokenLifespan",
  "accessCodeLifespan",
  "ssoSessionIdleTimeout",
  "ssoSessionMaxLifespan",
  "revokeRefreshToken",
  "refreshTokenMaxReuse",
]) {
  invariant(
    liveRealm[field] === realm[field],
    "Live realm drift: " + field + ".",
  );
}

for (const [clientId, expected] of Object.entries(expectedClients)) {
  const client = await findClient(clientId, adminToken);
  for (const field of [
    "publicClient",
    "bearerOnly",
    "standardFlowEnabled",
    "serviceAccountsEnabled",
  ]) {
    invariant(
      client[field] === expected[field],
      "Live client drift: " + clientId + "." + field + ".",
    );
  }
  invariant(!client.implicitFlowEnabled, "Live implicit grant is enabled.");
  invariant(
    !client.directAccessGrantsEnabled,
    "Live password grant is enabled.",
  );
  compareArray(
    client.redirectUris,
    expected.redirectUris,
    clientId + " live redirects",
  );
  compareArray(
    client.webOrigins,
    expected.webOrigins,
    clientId + " live origins",
  );
  if (clientId.endsWith("-web")) {
    invariant(
      client.attributes?.["pkce.code.challenge.method"] === "S256",
      clientId + " live PKCE drift.",
    );
    invariant(
      client.attributes?.["post.logout.redirect.uris"] === expected.postLogout,
      clientId + " live post logout drift.",
    );
    compareArray(
      client.defaultClientScopes,
      ["basic", "profile", "email", "resident-api-audience"],
      clientId + " live default scopes",
    );
  }
}

const { body: liveScopes } = await adminRequest(
  "/client-scopes",
  {},
  adminToken,
);
const liveAudienceScopes = liveScopes.filter(
  (scope) => scope.name === "resident-api-audience",
);
invariant(
  liveAudienceScopes.length === 1,
  "Live audience scope is not unique.",
);
const { body: liveAudienceMappers } = await adminRequest(
  "/client-scopes/" + liveAudienceScopes[0].id + "/protocol-mappers/models",
  {},
  adminToken,
);
invariant(
  liveAudienceMappers.length === 1 &&
    liveAudienceMappers[0].protocolMapper === "oidc-audience-mapper" &&
    liveAudienceMappers[0].config?.["included.client.audience"] ===
      "resident-api" &&
    liveAudienceMappers[0].config?.["access.token.claim"] === "true" &&
    liveAudienceMappers[0].config?.["id.token.claim"] === "false" &&
    liveAudienceMappers[0].config?.["userinfo.token.claim"] === "false",
  "Live audience mapper drift detected.",
);

const technicalClient = await findClient("resident-identity-admin", adminToken);
const realmManagement = await findClient("realm-management", adminToken);
const { body: serviceAccount } = await adminRequest(
  "/clients/" + technicalClient.id + "/service-account-user",
  {},
  adminToken,
);
const { body: assignedRoles } = await adminRequest(
  "/users/" +
    serviceAccount.id +
    "/role-mappings/clients/" +
    realmManagement.id,
  {},
  adminToken,
);
compareArray(
  assignedRoles.map((role) => role.name),
  ["query-users", "view-users"],
  "Technical client realm-management roles",
);

for (const identity of fixture.identities) {
  const { body: candidates } = await adminRequest(
    "/users?email=" + encodeURIComponent(identity.email) + "&exact=true",
    {},
    adminToken,
  );
  const matches = candidates.filter(
    (candidate) =>
      candidate.email?.toLowerCase() === identity.email.toLowerCase(),
  );
  invariant(
    matches.length === 1,
    "Live identity is missing: " + identity.email + ".",
  );
  invariant(
    matches[0].enabled && matches[0].emailVerified,
    "Live identity is not enabled and verified: " + identity.email + ".",
  );
}

const technicalSecret = requiredEnvironment(
  "KEYCLOAK_IDENTITY_ADMIN_CLIENT_SECRET",
);
const technicalForm = new URLSearchParams({
  grant_type: "client_credentials",
  client_id: "resident-identity-admin",
  client_secret: technicalSecret,
});
const { body: technicalToken } = await fetchJson(
  keycloakBaseUrl + "/realms/" + realmName + "/protocol/openid-connect/token",
  {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: technicalForm,
  },
);
invariant(
  technicalToken?.access_token,
  "Technical client credentials flow failed.",
);
const technicalClaims = JSON.parse(
  Buffer.from(technicalToken.access_token.split(".")[1], "base64url").toString(
    "utf8",
  ),
);
invariant(
  !(
    Array.isArray(technicalClaims.aud)
      ? technicalClaims.aud
      : [technicalClaims.aud]
  ).includes("resident-api"),
  "Technical token received the human resident-api audience.",
);

process.stdout.write(
  JSON.stringify({
    realm: realmName,
    issuer: discovery.issuer,
    jwks: "verified",
    clients: Object.keys(expectedClients),
    identities: fixture.identities.length,
    technicalClient: "least-privilege-verified",
    status: "PASS",
  }) + "\n",
);
