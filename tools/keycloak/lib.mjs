import { setTimeout as delay } from "node:timers/promises";

export const repositoryIssuer =
  process.env.KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/resident";
export const realmName = process.env.KEYCLOAK_REALM ?? "resident";
export const keycloakBaseUrl =
  process.env.KEYCLOAK_URL ?? "http://localhost:8080";

export const invariant = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const requiredEnvironment = (name) => {
  const value = process.env[name];
  invariant(value, "Required environment variable is missing: " + name + ".");
  return value;
};

export const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!response.ok) {
    throw new Error(
      "Keycloak request failed (" +
        response.status +
        ") for " +
        url +
        ": " +
        (typeof body === "string" ? body.slice(0, 200) : JSON.stringify(body)),
    );
  }
  return { body, headers: response.headers, status: response.status };
};

export const waitForJson = async (url, attempts = 60) => {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return (await fetchJson(url)).body;
    } catch (error) {
      lastError = error;
      await delay(2_000);
    }
  }
  throw lastError;
};

export const getAdminToken = async () => {
  const username = requiredEnvironment("KEYCLOAK_ADMIN_USER");
  const password = requiredEnvironment("KEYCLOAK_ADMIN_PASSWORD");
  const form = new URLSearchParams({
    client_id: "admin-cli",
    grant_type: "password",
    username,
    password,
  });
  const { body } = await fetchJson(
    keycloakBaseUrl + "/realms/master/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
    },
  );
  invariant(body?.access_token, "Keycloak admin token was not returned.");
  return body.access_token;
};

export const adminRequest = async (path, options = {}, token) =>
  fetchJson(keycloakBaseUrl + "/admin/realms/" + realmName + path, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers,
      authorization: "Bearer " + token,
    },
  });

export const findClient = async (clientId, token) => {
  const { body } = await adminRequest(
    "/clients?clientId=" + encodeURIComponent(clientId),
    {},
    token,
  );
  const matches = body.filter((client) => client.clientId === clientId);
  invariant(
    matches.length === 1,
    "Expected exactly one client " + clientId + ".",
  );
  return matches[0];
};
