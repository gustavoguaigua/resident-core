import { Injectable } from "@nestjs/common";

import {
  IdentityResolutionError,
  type AuthenticatedPrincipal,
  type IdentityResolverPort,
} from "@resident/auth";

import { getOrCreateTraceId } from "../../platform/http/trace-context.js";
import type { PrismaService } from "../../platform/database/prisma.service.js";
import type { AuditWriterPort } from "../audit/audit-writer.port.js";
import {
  AccessTokenVerificationError,
  type AccessTokenVerifier,
} from "./keycloak-access-token-verifier.js";

@Injectable()
export class PrismaIdentityResolver implements IdentityResolverPort {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly auditWriter: AuditWriterPort,
    private readonly tokenVerifier: AccessTokenVerifier,
  ) {}

  public async resolve(
    request: unknown,
  ): Promise<AuthenticatedPrincipal | null> {
    let subject: string;
    try {
      subject = (await this.tokenVerifier.verify(request)).subject;
    } catch (error) {
      const code =
        error instanceof AccessTokenVerificationError
          ? error.code
          : "INVALID_ACCESS_TOKEN";
      await this.auditDenial(request, code);
      throw new IdentityResolutionError(code);
    }

    const profile = await this.prisma.userProfile.findUnique({
      select: { id: true, status: true },
      where: { keycloakSubjectId: subject },
    });
    if (profile === null) {
      await this.auditDenial(request, "IDENTITY_NOT_PROVISIONED");
      throw new IdentityResolutionError("IDENTITY_NOT_PROVISIONED");
    }
    if (profile.status !== "ACTIVE") {
      await this.auditDenial(request, "USER_DISABLED", profile.id);
      throw new IdentityResolutionError("USER_DISABLED");
    }

    return { subject, userProfileId: profile.id };
  }

  private async auditDenial(
    request: unknown,
    reasonCode: string,
    userProfileId?: string,
  ): Promise<void> {
    await this.auditWriter.recordDenied(
      {
        actor:
          userProfileId === undefined
            ? { type: "ANONYMOUS" }
            : { type: "USER", userProfileId },
        traceId: getOrCreateTraceId(request),
      },
      {
        action: "authentication.denied",
        occurredAt: new Date(),
        reasonCode,
      },
    );
  }
}
