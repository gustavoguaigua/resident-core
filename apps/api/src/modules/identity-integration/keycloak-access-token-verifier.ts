import {
  createPublicKey,
  verify as verifySignature,
  type JsonWebKey,
} from "node:crypto";

export type AccessTokenFailureCode =
  | "AUTHENTICATION_REQUIRED"
  | "IDENTITY_PROVIDER_UNAVAILABLE"
  | "INVALID_ACCESS_TOKEN";

export class AccessTokenVerificationError extends Error {
  public constructor(public readonly code: AccessTokenFailureCode) {
    super(code);
    this.name = "AccessTokenVerificationError";
  }
}

export interface VerifiedAccessToken {
  readonly subject: string;
}

export interface AccessTokenVerifier {
  verify(request: unknown): Promise<VerifiedAccessToken>;
}

interface KeycloakVerifierOptions {
  readonly audience: string;
  readonly authorizedParties: readonly string[];
  readonly fetchImplementation?: typeof fetch;
  readonly issuer: string;
  readonly jwksUrl: string;
  readonly now?: () => number;
}

interface JwksDocument {
  readonly keys?: readonly JsonWebKey[];
}

const MAX_TOKEN_LENGTH = 8_192;
const MAX_SUBJECT_LENGTH = 255;
const CLOCK_SKEW_SECONDS = 30;
const JWKS_TTL_MS = 5 * 60 * 1_000;
const SUBJECT = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,254}$/u;

export class KeycloakAccessTokenVerifier implements AccessTokenVerifier {
  private readonly fetchImplementation: typeof fetch;
  private readonly now: () => number;
  private cachedKeys: ReadonlyMap<string, JsonWebKey> | undefined;
  private cacheExpiresAt = 0;

  public constructor(private readonly options: KeycloakVerifierOptions) {
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.now = options.now ?? Date.now;
  }

  public async verify(request: unknown): Promise<VerifiedAccessToken> {
    const token = readBearerToken(request);
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    if (
      encodedHeader === undefined ||
      encodedPayload === undefined ||
      encodedSignature === undefined ||
      token.split(".").length !== 3
    ) {
      throw invalidToken();
    }

    const header = decodeObject(encodedHeader);
    const claims = decodeObject(encodedPayload);
    if (
      header.alg !== "RS256" ||
      typeof header.kid !== "string" ||
      header.kid.length === 0
    ) {
      throw invalidToken();
    }

    const key = await this.findKey(header.kid);
    let signatureValid: boolean;
    try {
      signatureValid = verifySignature(
        "RSA-SHA256",
        Buffer.from(`${encodedHeader}.${encodedPayload}`, "ascii"),
        createPublicKey({ format: "jwk", key }),
        Buffer.from(encodedSignature, "base64url"),
      );
    } catch {
      throw invalidToken();
    }
    if (!signatureValid) {
      throw invalidToken();
    }

    this.validateClaims(claims);
    return { subject: claims.sub as string };
  }

  private async findKey(kid: string): Promise<JsonWebKey> {
    let keys = await this.loadKeys(false);
    let key = keys.get(kid);
    if (key === undefined) {
      keys = await this.loadKeys(true);
      key = keys.get(kid);
    }
    if (key === undefined) {
      throw invalidToken();
    }
    return key;
  }

  private async loadKeys(
    forceRefresh: boolean,
  ): Promise<ReadonlyMap<string, JsonWebKey>> {
    const now = this.now();
    if (
      !forceRefresh &&
      this.cachedKeys !== undefined &&
      now < this.cacheExpiresAt
    ) {
      return this.cachedKeys;
    }
    try {
      const response = await this.fetchImplementation(this.options.jwksUrl, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(5_000),
      });
      if (!response.ok) {
        throw new Error("JWKS request failed");
      }
      const document = (await response.json()) as JwksDocument;
      if (!Array.isArray(document.keys)) {
        throw new Error("JWKS payload is invalid");
      }
      const keys = new Map<string, JsonWebKey>();
      for (const key of document.keys) {
        if (
          key.kty === "RSA" &&
          typeof key.kid === "string" &&
          key.kid.length > 0 &&
          (key.use === undefined || key.use === "sig")
        ) {
          keys.set(key.kid, key);
        }
      }
      if (keys.size === 0) {
        throw new Error("JWKS has no signing keys");
      }
      this.cachedKeys = keys;
      this.cacheExpiresAt = now + JWKS_TTL_MS;
      return keys;
    } catch (error) {
      if (
        !forceRefresh &&
        this.cachedKeys !== undefined &&
        now < this.cacheExpiresAt
      ) {
        return this.cachedKeys;
      }
      if (error instanceof AccessTokenVerificationError) {
        throw error;
      }
      throw new AccessTokenVerificationError("IDENTITY_PROVIDER_UNAVAILABLE");
    }
  }

  private validateClaims(claims: Readonly<Record<string, unknown>>): void {
    const nowSeconds = Math.floor(this.now() / 1_000);
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (
      claims.iss !== this.options.issuer ||
      !audiences.includes(this.options.audience) ||
      typeof claims.azp !== "string" ||
      !this.options.authorizedParties.includes(claims.azp) ||
      claims.typ !== "Bearer" ||
      typeof claims.sub !== "string" ||
      claims.sub.length > MAX_SUBJECT_LENGTH ||
      !SUBJECT.test(claims.sub) ||
      typeof claims.email !== "string" ||
      claims.email.length === 0 ||
      claims.email.length > 320 ||
      claims.email_verified !== true ||
      typeof claims.exp !== "number" ||
      claims.exp <= nowSeconds - CLOCK_SKEW_SECONDS ||
      typeof claims.iat !== "number" ||
      claims.iat > nowSeconds + CLOCK_SKEW_SECONDS ||
      (claims.nbf !== undefined &&
        (typeof claims.nbf !== "number" ||
          claims.nbf > nowSeconds + CLOCK_SKEW_SECONDS))
    ) {
      throw invalidToken();
    }
  }
}

export class EnvironmentKeycloakAccessTokenVerifier implements AccessTokenVerifier {
  private verifier: KeycloakAccessTokenVerifier | undefined;

  public verify(request: unknown): Promise<VerifiedAccessToken> {
    this.verifier ??= this.createVerifier();
    return this.verifier.verify(request);
  }

  private createVerifier(): KeycloakAccessTokenVerifier {
    const issuer = process.env.KEYCLOAK_ISSUER;
    const jwksUrl = process.env.KEYCLOAK_JWKS_URL;
    const audience = process.env.KEYCLOAK_API_AUDIENCE;
    if (!issuer || !jwksUrl || !audience) {
      throw new AccessTokenVerificationError("IDENTITY_PROVIDER_UNAVAILABLE");
    }
    return new KeycloakAccessTokenVerifier({
      audience,
      authorizedParties: [
        process.env.KEYCLOAK_ADMIN_WEB_CLIENT_ID ?? "resident-admin-web",
        process.env.KEYCLOAK_RESIDENT_WEB_CLIENT_ID ?? "resident-resident-web",
      ],
      issuer,
      jwksUrl,
    });
  }
}

function readBearerToken(request: unknown): string {
  if (
    typeof request !== "object" ||
    request === null ||
    !("headers" in request)
  ) {
    throw new AccessTokenVerificationError("AUTHENTICATION_REQUIRED");
  }
  const headers = (request as { headers?: unknown }).headers;
  if (typeof headers !== "object" || headers === null) {
    throw new AccessTokenVerificationError("AUTHENTICATION_REQUIRED");
  }
  const authorization = (headers as Record<string, unknown>).authorization;
  if (typeof authorization !== "string") {
    throw new AccessTokenVerificationError("AUTHENTICATION_REQUIRED");
  }
  const match =
    /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/u.exec(
      authorization,
    );
  if (match?.[1] === undefined || match[1].length > MAX_TOKEN_LENGTH) {
    throw invalidToken();
  }
  return match[1];
}

function decodeObject(segment: string): Readonly<Record<string, unknown>> {
  try {
    const value: unknown = JSON.parse(
      Buffer.from(segment, "base64url").toString("utf8"),
    );
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error("JWT segment must be an object");
    }
    return value as Readonly<Record<string, unknown>>;
  } catch {
    throw invalidToken();
  }
}

function invalidToken(): AccessTokenVerificationError {
  return new AccessTokenVerificationError("INVALID_ACCESS_TOKEN");
}
