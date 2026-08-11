export const RUNTIME_ENVIRONMENTS = [
  "development",
  "test",
  "production",
] as const;

export const APPLICATION_ENVIRONMENTS = [
  "local",
  "development",
  "staging",
  "production",
] as const;

export const DEFAULT_LOCAL_CORS_ORIGINS = [
  "http://localhost:3001",
  "http://localhost:3002",
] as const;

export type RuntimeEnvironment = (typeof RUNTIME_ENVIRONMENTS)[number];
export type ApplicationEnvironmentName =
  (typeof APPLICATION_ENVIRONMENTS)[number];

export interface ApplicationEnvironment {
  readonly NODE_ENV: RuntimeEnvironment;
  readonly APP_ENV: ApplicationEnvironmentName;
  readonly API_PORT: number;
  readonly DATABASE_URL: string;
  readonly CORS_ALLOWED_ORIGINS: readonly string[];
  readonly RATE_LIMIT_TTL_MS: number;
  readonly RATE_LIMIT_LIMIT: number;
}

export function isRuntimeEnvironment(
  value: string,
): value is RuntimeEnvironment {
  return RUNTIME_ENVIRONMENTS.some((environment) => environment === value);
}

export function isApplicationEnvironmentName(
  value: string,
): value is ApplicationEnvironmentName {
  return APPLICATION_ENVIRONMENTS.some((environment) => environment === value);
}

export function parseApplicationEnvironment(
  source: Readonly<Record<string, unknown>>,
): ApplicationEnvironment {
  const nodeEnvironment = readString(source, "NODE_ENV", "development");
  const applicationEnvironment = readString(source, "APP_ENV", "local");

  if (!isRuntimeEnvironment(nodeEnvironment)) {
    throw configurationError(
      "NODE_ENV",
      `expected one of ${RUNTIME_ENVIRONMENTS.join(", ")}`,
    );
  }

  if (!isApplicationEnvironmentName(applicationEnvironment)) {
    throw configurationError(
      "APP_ENV",
      `expected one of ${APPLICATION_ENVIRONMENTS.join(", ")}`,
    );
  }

  const configuredOrigins = parseOrigins(
    readString(source, "CORS_ALLOWED_ORIGINS", ""),
  );
  const corsAllowedOrigins =
    configuredOrigins.length > 0
      ? configuredOrigins
      : applicationEnvironment === "local"
        ? [...DEFAULT_LOCAL_CORS_ORIGINS]
        : [];

  if (applicationEnvironment !== "local" && corsAllowedOrigins.length === 0) {
    throw configurationError(
      "CORS_ALLOWED_ORIGINS",
      "at least one explicit origin is required outside local",
    );
  }

  return {
    NODE_ENV: nodeEnvironment,
    APP_ENV: applicationEnvironment,
    API_PORT: readInteger(source, "API_PORT", 3000, 1, 65_535),
    DATABASE_URL: readDatabaseUrl(source),
    CORS_ALLOWED_ORIGINS: corsAllowedOrigins,
    RATE_LIMIT_TTL_MS: readInteger(
      source,
      "RATE_LIMIT_TTL_MS",
      60_000,
      1_000,
      3_600_000,
    ),
    RATE_LIMIT_LIMIT: readInteger(source, "RATE_LIMIT_LIMIT", 100, 1, 10_000),
  };
}

function readDatabaseUrl(source: Readonly<Record<string, unknown>>): string {
  const value = readRequiredString(source, "DATABASE_URL");
  let databaseUrl: URL;

  try {
    databaseUrl = new URL(value);
  } catch {
    throw configurationError(
      "DATABASE_URL",
      "expected an absolute PostgreSQL connection URL",
    );
  }

  if (!["postgresql:", "postgres:"].includes(databaseUrl.protocol)) {
    throw configurationError(
      "DATABASE_URL",
      "expected a PostgreSQL connection URL",
    );
  }

  return value;
}

function readRequiredString(
  source: Readonly<Record<string, unknown>>,
  key: string,
): string {
  const value = source[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw configurationError(key, "a non-empty value is required");
  }

  return value.trim();
}

export function validateApplicationEnvironment(
  source: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...source,
    ...parseApplicationEnvironment(source),
  };
}

function readString(
  source: Readonly<Record<string, unknown>>,
  key: string,
  defaultValue: string,
): string {
  const value = source[key];

  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value !== "string") {
    throw configurationError(key, "expected a string");
  }

  return value.trim();
}

function readInteger(
  source: Readonly<Record<string, unknown>>,
  key: string,
  defaultValue: number,
  minimum: number,
  maximum: number,
): number {
  const rawValue = source[key];

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return defaultValue;
  }

  const value =
    typeof rawValue === "number" ? rawValue : Number(String(rawValue).trim());

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw configurationError(
      key,
      `expected an integer between ${minimum} and ${maximum}`,
    );
  }

  return value;
}

function parseOrigins(value: string): string[] {
  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return [...new Set(origins.map(validateOrigin))];
}

function validateOrigin(origin: string): string {
  let parsedOrigin: URL;

  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw configurationError(
      "CORS_ALLOWED_ORIGINS",
      "every entry must be an absolute HTTP(S) origin",
    );
  }

  if (
    !["http:", "https:"].includes(parsedOrigin.protocol) ||
    parsedOrigin.username.length > 0 ||
    parsedOrigin.password.length > 0 ||
    parsedOrigin.origin !== origin ||
    parsedOrigin.pathname !== "/" ||
    parsedOrigin.search.length > 0 ||
    parsedOrigin.hash.length > 0
  ) {
    throw configurationError(
      "CORS_ALLOWED_ORIGINS",
      "every entry must be an absolute HTTP(S) origin without credentials or paths",
    );
  }

  return parsedOrigin.origin;
}

function configurationError(key: string, requirement: string): Error {
  return new Error(`Invalid configuration for ${key}: ${requirement}`);
}
