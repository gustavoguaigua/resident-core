import {
  normalizeBootstrapEmail,
  PlatformAdminBootstrapError,
  type PlatformIdentityLookupPort,
  type VerifiedPlatformIdentity,
} from "./bootstrap-contract.js";

interface KeycloakUserRepresentation {
  readonly id?: unknown;
  readonly username?: unknown;
  readonly email?: unknown;
  readonly firstName?: unknown;
  readonly lastName?: unknown;
  readonly enabled?: unknown;
  readonly emailVerified?: unknown;
}

interface KeycloakClientOptions {
  readonly baseUrl: string;
  readonly realm: string;
  readonly clientSecret: string;
  readonly fetchImplementation?: typeof fetch;
}

const SUBJECT = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,254}$/u;

export class KeycloakPlatformIdentityClient implements PlatformIdentityLookupPort {
  private readonly fetchImplementation: typeof fetch;

  public constructor(private readonly options: KeycloakClientOptions) {
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  public static fromEnvironment(): KeycloakPlatformIdentityClient {
    const baseUrl = process.env.KEYCLOAK_URL;
    const realm = process.env.KEYCLOAK_REALM;
    const clientSecret = process.env.KEYCLOAK_IDENTITY_ADMIN_CLIENT_SECRET;
    if (!baseUrl || !realm || !clientSecret) {
      throw new PlatformAdminBootstrapError("IDENTITY_PROVIDER_UNAVAILABLE");
    }
    return new KeycloakPlatformIdentityClient({
      baseUrl,
      realm,
      clientSecret,
    });
  }

  public async resolveByEmail(
    emailInput: string,
  ): Promise<VerifiedPlatformIdentity> {
    const email = normalizeBootstrapEmail(emailInput);
    try {
      const accessToken = await this.obtainAccessToken();
      const url = new URL(
        `/admin/realms/${encodeURIComponent(this.options.realm)}/users`,
        this.options.baseUrl,
      );
      url.searchParams.set("email", email);
      url.searchParams.set("exact", "true");
      url.searchParams.set("briefRepresentation", "true");
      const response = await this.fetchImplementation(url, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        throw new PlatformAdminBootstrapError("IDENTITY_PROVIDER_UNAVAILABLE");
      }
      const body: unknown = await response.json();
      if (!Array.isArray(body)) {
        throw new PlatformAdminBootstrapError("IDENTITY_PROVIDER_UNAVAILABLE");
      }
      const matches = (body as KeycloakUserRepresentation[]).filter(
        (user) =>
          typeof user.email === "string" &&
          normalizeBootstrapEmail(user.email) === email,
      );
      if (matches.length === 0) {
        throw new PlatformAdminBootstrapError("IDENTITY_NOT_PROVISIONED");
      }
      if (matches.length !== 1) {
        throw new PlatformAdminBootstrapError("IDENTITY_RESOLUTION_AMBIGUOUS");
      }
      const match = matches[0];
      if (match === undefined) {
        throw new PlatformAdminBootstrapError("IDENTITY_NOT_PROVISIONED");
      }
      return this.validateIdentity(match, email);
    } catch (error) {
      if (error instanceof PlatformAdminBootstrapError) {
        throw error;
      }
      throw new PlatformAdminBootstrapError("IDENTITY_PROVIDER_UNAVAILABLE");
    }
  }

  private async obtainAccessToken(): Promise<string> {
    const form = new URLSearchParams({
      client_id: "resident-identity-admin",
      client_secret: this.options.clientSecret,
      grant_type: "client_credentials",
    });
    const response = await this.fetchImplementation(
      new URL(
        `/realms/${encodeURIComponent(this.options.realm)}/protocol/openid-connect/token`,
        this.options.baseUrl,
      ),
      {
        body: form,
        headers: { "content-type": "application/x-www-form-urlencoded" },
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new PlatformAdminBootstrapError("IDENTITY_PROVIDER_UNAVAILABLE");
    }
    const body: unknown = await response.json();
    const accessToken =
      typeof body === "object" && body !== null && "access_token" in body
        ? (body as { access_token?: unknown }).access_token
        : undefined;
    if (typeof accessToken !== "string" || accessToken.length === 0) {
      throw new PlatformAdminBootstrapError("IDENTITY_PROVIDER_UNAVAILABLE");
    }
    return accessToken;
  }

  private validateIdentity(
    user: KeycloakUserRepresentation,
    email: string,
  ): VerifiedPlatformIdentity {
    if (user.enabled !== true || user.emailVerified !== true) {
      throw new PlatformAdminBootstrapError("IDENTITY_NOT_ELIGIBLE");
    }
    if (typeof user.id !== "string" || !SUBJECT.test(user.id)) {
      throw new PlatformAdminBootstrapError("IDENTITY_SUBJECT_INVALID");
    }
    const nameParts = [user.firstName, user.lastName].filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );
    const username =
      typeof user.username === "string" && user.username.trim().length > 0
        ? user.username.trim()
        : (email.split("@")[0] ?? "Platform Admin");
    return {
      subject: user.id,
      email,
      displayName: (nameParts.join(" ") || username).slice(0, 200),
      enabled: true,
      emailVerified: true,
    };
  }
}
