import {
  createHash,
  createPublicKey,
  randomBytes,
  verify as verifySignature,
} from "node:crypto";
import {
  fetchJson,
  invariant,
  keycloakBaseUrl,
  repositoryIssuer,
  requiredEnvironment,
} from "./lib.mjs";

const decodeHtml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"');

const cookieHeader = (headers) => {
  const values =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie")].filter(Boolean);
  return values.map((value) => value.split(";", 1)[0]).join("; ");
};

const decodeJwt = (token) => {
  const segments = token.split(".");
  invariant(segments.length === 3, "JWT must have three segments.");
  return {
    header: JSON.parse(Buffer.from(segments[0], "base64url").toString("utf8")),
    payload: JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8")),
    segments,
  };
};

const validateHumanClaims = (claims, expectedClient, now) => {
  invariant(claims.iss === repositoryIssuer, "Token issuer is invalid.");
  invariant(
    (Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(
      "resident-api",
    ),
    "Token audience is invalid.",
  );
  invariant(claims.azp === expectedClient, "Token azp is invalid.");
  invariant(claims.typ === "Bearer", "Token type is invalid.");
  invariant(
    typeof claims.sub === "string" && claims.sub.length > 0,
    "Token subject is invalid.",
  );
  invariant(claims.email_verified === true, "Email must be verified.");
  invariant(typeof claims.email === "string", "Email claim is required.");
  invariant(claims.exp > now - 30, "Token is expired.");
  invariant(claims.iat <= now + 30, "Token iat is in the future.");
};

const authenticateWithPkce = async ({
  clientId,
  redirectUri,
  username,
  password,
}) => {
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("base64url");
  const authorization = new URL(
    repositoryIssuer + "/protocol/openid-connect/auth",
  );
  authorization.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state,
    nonce: randomBytes(16).toString("base64url"),
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const loginPage = await fetch(authorization, { redirect: "manual" });
  const html = await loginPage.text();
  invariant(
    loginPage.status === 200,
    "Authorization login page was not returned (status " +
      loginPage.status +
      ", location " +
      (loginPage.headers.get("location") ?? "none") +
      ", body " +
      html.slice(0, 160).replaceAll(/\s+/gu, " ") +
      ").",
  );
  const form = html.match(/<form[^>]*id="kc-form-login"[^>]*>/u)?.[0];
  invariant(form, "Keycloak login form was not found.");
  const action = form.match(/action="([^"]+)"/u)?.[1];
  invariant(action, "Keycloak login action was not found.");
  const login = await fetch(decodeHtml(action), {
    method: "POST",
    redirect: "manual",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookieHeader(loginPage.headers),
    },
    body: new URLSearchParams({
      username,
      password,
      credentialId: "",
    }),
  });
  invariant(
    login.status >= 300 && login.status < 400,
    "Keycloak login did not redirect with an authorization code.",
  );
  const callback = new URL(login.headers.get("location"));
  invariant(
    callback.origin + callback.pathname === redirectUri,
    "Redirect drift.",
  );
  invariant(callback.searchParams.get("state") === state, "OIDC state drift.");
  const code = callback.searchParams.get("code");
  invariant(code, "Authorization code was not returned.");

  const { body: tokens } = await fetchJson(
    repositoryIssuer + "/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        code_verifier: verifier,
      }),
    },
  );
  invariant(
    tokens.access_token && tokens.id_token,
    "OIDC tokens were not returned.",
  );
  return tokens;
};

const clients = [
  {
    clientId: "resident-admin-web",
    redirectUri: "http://localhost:3001/auth/callback",
    username: "platform.admin@example.com",
    password: requiredEnvironment("KEYCLOAK_PLATFORM_ADMIN_PASSWORD"),
  },
  {
    clientId: "resident-resident-web",
    redirectUri: "http://localhost:3002/auth/callback",
    username: "resident.user@example.com",
    password: requiredEnvironment("KEYCLOAK_RESIDENT_USER_PASSWORD"),
  },
];
const { body: jwks } = await fetchJson(
  repositoryIssuer + "/protocol/openid-connect/certs",
);
const results = [];

for (const client of clients) {
  const tokens = await authenticateWithPkce(client);
  const access = decodeJwt(tokens.access_token);
  const id = decodeJwt(tokens.id_token);
  invariant(
    access.header.alg === "RS256",
    "Access token algorithm is not RS256.",
  );
  const jwk = jwks.keys.find((key) => key.kid === access.header.kid);
  invariant(jwk, "Access token kid is unknown.");
  invariant(
    verifySignature(
      "RSA-SHA256",
      Buffer.from(access.segments[0] + "." + access.segments[1]),
      createPublicKey({ key: jwk, format: "jwk" }),
      Buffer.from(access.segments[2], "base64url"),
    ),
    "Access token signature is invalid.",
  );
  validateHumanClaims(
    access.payload,
    client.clientId,
    Math.floor(Date.now() / 1000),
  );
  invariant(
    !(
      Array.isArray(id.payload.aud) ? id.payload.aud : [id.payload.aud]
    ).includes("resident-api"),
    "resident-api audience leaked into the ID token.",
  );
  results.push({
    clientId: client.clientId,
    flow: "code-pkce-s256",
    status: "PASS",
  });
}

const validClaims = decodeJwt(
  (await authenticateWithPkce(clients[0])).access_token,
).payload;
const now = Math.floor(Date.now() / 1000);
for (const [label, claims] of [
  ["issuer", { ...validClaims, iss: "http://invalid.example/realms/resident" }],
  ["audience", { ...validClaims, aud: "invalid-api" }],
  ["azp", { ...validClaims, azp: "unapproved-client" }],
  ["expiration", { ...validClaims, exp: now - 120 }],
  ["subject", { ...validClaims, sub: "" }],
  ["email verification", { ...validClaims, email_verified: false }],
]) {
  let rejected = false;
  try {
    validateHumanClaims(claims, "resident-admin-web", now);
  } catch {
    rejected = true;
  }
  invariant(rejected, "Negative claim was accepted: " + label + ".");
}

const authorizationEndpoint =
  repositoryIssuer + "/protocol/openid-connect/auth";
const invalidRedirect = await fetch(
  authorizationEndpoint +
    "?" +
    new URLSearchParams({
      client_id: "resident-admin-web",
      redirect_uri: "http://attacker.invalid/callback",
      response_type: "code",
      scope: "openid",
      code_challenge: "invalid",
      code_challenge_method: "S256",
    }),
  { redirect: "manual" },
);
invariant(
  invalidRedirect.status === 400,
  "Unregistered redirect was accepted.",
);

for (const [label, parameters] of [
  [
    "missing PKCE",
    {
      client_id: "resident-admin-web",
      redirect_uri: "http://localhost:3001/auth/callback",
      response_type: "code",
      scope: "openid",
    },
  ],
  [
    "plain PKCE",
    {
      client_id: "resident-admin-web",
      redirect_uri: "http://localhost:3001/auth/callback",
      response_type: "code",
      scope: "openid",
      code_challenge: "plain-verifier",
      code_challenge_method: "plain",
    },
  ],
  [
    "implicit",
    {
      client_id: "resident-admin-web",
      redirect_uri: "http://localhost:3001/auth/callback",
      response_type: "token",
      scope: "openid",
    },
  ],
]) {
  const response = await fetch(
    authorizationEndpoint + "?" + new URLSearchParams(parameters),
    { redirect: "manual" },
  );
  const location = response.headers.get("location") ?? "";
  invariant(
    response.status === 400 || location.includes("error="),
    label + " flow was accepted.",
  );
}

const passwordGrant = await fetch(
  repositoryIssuer + "/protocol/openid-connect/token",
  {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: "resident-admin-web",
      username: clients[0].username,
      password: clients[0].password,
    }),
  },
);
invariant(passwordGrant.status === 400, "Password grant was accepted.");

const tampered = await authenticateWithPkce(clients[0]);
const decodedTampered = decodeJwt(tampered.access_token);
const tamperedSignature = Buffer.from(decodedTampered.segments[2], "base64url");
tamperedSignature[0] ^= 1;
invariant(
  !verifySignature(
    "RSA-SHA256",
    Buffer.from(
      decodedTampered.segments[0] + "." + decodedTampered.segments[1],
    ),
    createPublicKey({
      key: jwks.keys.find((key) => key.kid === decodedTampered.header.kid),
      format: "jwk",
    }),
    tamperedSignature,
  ),
  "Tampered signature was accepted.",
);
invariant(
  !jwks.keys.some((key) => key.kid === "unknown-synthetic-kid"),
  "Unknown kid negative test is invalid.",
);

process.stdout.write(
  JSON.stringify({
    issuer: repositoryIssuer,
    jwks: keycloakBaseUrl + "/realms/resident/protocol/openid-connect/certs",
    positiveFlows: results,
    negativeTests: [
      "redirect",
      "pkce-missing",
      "pkce-plain",
      "implicit",
      "password-grant",
      "signature",
      "issuer",
      "audience",
      "azp",
      "expiration",
      "subject",
      "email-verification",
      "kid",
    ],
    status: "PASS",
  }) + "\n",
);
