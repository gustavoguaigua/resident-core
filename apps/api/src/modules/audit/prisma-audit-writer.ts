import { Inject, Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "../../platform/database/prisma.service.js";
import type {
  AuditTransaction,
  AuditWriterPort,
  DeniedAuditWriteResult,
} from "./audit-writer.port.js";
import {
  prepareAuditRecord,
  type DomainAuditEvent,
  type ValidatedAuditContext,
} from "./domain-audit-event.js";

@Injectable()
export class PrismaAuditWriter implements AuditWriterPort {
  private readonly logger = new Logger(PrismaAuditWriter.name);

  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  public async recordConfirmed(
    transaction: AuditTransaction,
    context: ValidatedAuditContext,
    event: DomainAuditEvent,
  ): Promise<void> {
    await this.insert(transaction, context, event, "SUCCESS");
  }

  public async recordDenied(
    context: ValidatedAuditContext,
    event: DomainAuditEvent,
  ): Promise<DeniedAuditWriteResult> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        await this.insert(transaction, context, event, "DENIED");
      });
      return { persisted: true };
    } catch {
      this.logger.warn(
        "Audit denial persistence failed; access remains denied.",
      );
      return { persisted: false };
    }
  }

  private async insert(
    transaction: AuditTransaction,
    context: ValidatedAuditContext,
    event: DomainAuditEvent,
    expectedOutcome: "SUCCESS" | "DENIED",
  ): Promise<void> {
    const data = prepareAuditRecord(context, event);
    if (data.outcome !== expectedOutcome) {
      throw new Error(`Audit writer expected ${expectedOutcome}.`);
    }
    await this.assertMembershipContext(transaction, data);
    await transaction.auditLog.create({ data });
  }

  private async assertMembershipContext(
    transaction: AuditTransaction,
    data: ReturnType<typeof prepareAuditRecord>,
  ): Promise<void> {
    const membershipId = data.actorMembershipId;
    if (typeof membershipId !== "string") {
      return;
    }
    if (
      typeof data.tenantId !== "string" ||
      typeof data.actorUserProfileId !== "string"
    ) {
      throw new Error("Audit membership context is incomplete.");
    }
    const membership = await transaction.userTenantMembership.findFirst({
      where: {
        id: membershipId,
        tenantId: data.tenantId,
        userProfileId: data.actorUserProfileId,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    if (membership === null) {
      throw new Error(
        "Audit actor membership is not valid for the tenant context.",
      );
    }
  }
}
