import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  adminRequest,
  findClient,
  getAdminToken,
  invariant,
  repositoryIssuer,
  requiredEnvironment,
  waitForJson,
} from "./lib.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const fixture = JSON.parse(
  readFileSync(
    resolve(repositoryRoot, "infra/keycloak/fixtures/local-identities.json"),
    "utf8",
  ),
);
const passwords = {
  platformAdmin: requiredEnvironment("KEYCLOAK_PLATFORM_ADMIN_PASSWORD"),
  tenantAdmin: requiredEnvironment("KEYCLOAK_TENANT_ADMIN_PASSWORD"),
  residentUser: requiredEnvironment("KEYCLOAK_RESIDENT_USER_PASSWORD"),
};

await waitForJson(repositoryIssuer + "/.well-known/openid-configuration");
const adminToken = await getAdminToken();
const results = [];

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
    matches.length <= 1,
    "Identity " + identity.email + " is not unique in Keycloak.",
  );

  let user = matches[0];
  let status = "verified";
  if (!user) {
    const created = await adminRequest(
      "/users",
      {
        method: "POST",
        body: JSON.stringify({
          username: identity.username,
          email: identity.email,
          enabled: identity.enabled,
          emailVerified: identity.emailVerified,
          firstName: identity.firstName,
          lastName: identity.lastName,
        }),
      },
      adminToken,
    );
    const location = created.headers.get("location");
    invariant(
      location,
      "Keycloak did not return an ID for " + identity.email + ".",
    );
    user = { id: location.slice(location.lastIndexOf("/") + 1), ...identity };
    status = "created";
  } else {
    invariant(
      user.username === identity.username &&
        user.enabled === identity.enabled &&
        user.emailVerified === identity.emailVerified,
      "Existing identity " + identity.email + " violates fixture invariants.",
    );
  }

  await adminRequest(
    "/users/" + user.id + "/reset-password",
    {
      method: "PUT",
      body: JSON.stringify({
        type: "password",
        value: passwords[identity.key],
        temporary: false,
      }),
    },
    adminToken,
  );
  results.push({ id: user.id, key: identity.key, status });
}

const technicalClient = await findClient("resident-identity-admin", adminToken);
const technicalSecret = requiredEnvironment(
  "KEYCLOAK_IDENTITY_ADMIN_CLIENT_SECRET",
);
await adminRequest(
  "/clients/" + technicalClient.id,
  {
    method: "PUT",
    body: JSON.stringify({ ...technicalClient, secret: technicalSecret }),
  },
  adminToken,
);

const { body: serviceAccount } = await adminRequest(
  "/clients/" + technicalClient.id + "/service-account-user",
  {},
  adminToken,
);
const realmManagement = await findClient("realm-management", adminToken);
const allowedRoles = [];
for (const roleName of ["query-users", "view-users"]) {
  const { body: role } = await adminRequest(
    "/clients/" + realmManagement.id + "/roles/" + roleName,
    {},
    adminToken,
  );
  allowedRoles.push(role);
}
await adminRequest(
  "/users/" +
    serviceAccount.id +
    "/role-mappings/clients/" +
    realmManagement.id,
  { method: "POST", body: JSON.stringify(allowedRoles) },
  adminToken,
);

process.stdout.write(
  JSON.stringify({
    realm: "resident",
    identities: results,
    technicalClient: {
      id: technicalClient.id,
      serviceAccountId: serviceAccount.id,
      roles: allowedRoles.map((role) => role.name),
      status: "configured",
    },
  }) + "\n",
);
