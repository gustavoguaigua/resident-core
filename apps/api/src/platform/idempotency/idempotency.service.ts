import { createHash } from "node:crypto";

import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../database/prisma.service.js";

const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/u;
const MAX_SERIALIZATION_ATTEMPTS = 3;
const RETENTION_MS = 24 * 60 * 60 * 1000;

export type IdempotencyTransaction = Prisma.TransactionClient;

export class IdempotencyError extends Error {
  public constructor(
    public readonly code:
      | "IDEMPOTENCY_KEY_REQUIRED"
      | "IDEMPOTENCY_KEY_CONFLICT"
      | "IDEMPOTENCY_OPERATION_IN_PROGRESS",
  ) {
    super(code);
  }
}

export interface IdempotentActor {
  readonly tenantId: string;
  readonly membershipId: string;
  readonly userProfileId: string;
}

export interface IdempotentRequest {
  readonly actor: IdempotentActor;
  readonly key: string | readonly string[] | undefined;
  readonly method: "PATCH" | "POST";
  readonly operationType: string;
  readonly path: Readonly<Record<string, string>>;
  readonly body: unknown;
}

export interface IdempotentResult<T> {
  readonly httpStatus: number;
  readonly responseBody: T;
  readonly replayed: boolean;
}

export interface MutationResult<T> {
  readonly httpStatus: number;
  readonly responseBody: T;
  readonly resourceType?: string;
  readonly resourceId?: string;
}

@Injectable()
export class IdempotencyService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  public async execute<T>(
    request: IdempotentRequest,
    authorize: (transaction: IdempotencyTransaction) => Promise<void>,
    mutate: (transaction: IdempotencyTransaction) => Promise<MutationResult<T>>,
  ): Promise<IdempotentResult<T>> {
    const key = requireKey(request.key);
    const keyHash = sha256(key);
    const requestHash = sha256(
      canonicalJson({
        body: request.body,
        method: request.method,
        operationType: request.operationType,
        path: request.path,
      }),
    );

    for (let attempt = 1; attempt <= MAX_SERIALIZATION_ATTEMPTS; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (transaction) => {
            await authorize(transaction);
            const lockKey = [
              request.actor.tenantId,
              request.operationType,
              keyHash,
            ].join(":");
            const lockRows = await transaction.$queryRaw<
              readonly { locked: boolean }[]
            >`SELECT pg_try_advisory_xact_lock(hashtextextended(${lockKey}, 0)) AS locked`;
            if (lockRows[0]?.locked !== true) {
              throw new IdempotencyError("IDEMPOTENCY_OPERATION_IN_PROGRESS");
            }

            const now = new Date();
            await transaction.idempotencyOperation.deleteMany({
              where: {
                expiresAt: { lte: now },
                status: "COMPLETED",
                tenantId: request.actor.tenantId,
              },
            });
            const existing = await transaction.idempotencyOperation.findUnique({
              where: {
                tenantId_operationType_keyHash: {
                  keyHash,
                  operationType: request.operationType,
                  tenantId: request.actor.tenantId,
                },
              },
            });
            if (existing !== null) {
              if (existing.status === "IN_PROGRESS") {
                throw new IdempotencyError("IDEMPOTENCY_OPERATION_IN_PROGRESS");
              }
              if (
                existing.actorUserProfileId !== request.actor.userProfileId ||
                existing.requestHash !== requestHash
              ) {
                throw new IdempotencyError("IDEMPOTENCY_KEY_CONFLICT");
              }
              if (
                existing.httpStatus === null ||
                existing.responseBody === null
              ) {
                throw new IdempotencyError("IDEMPOTENCY_KEY_CONFLICT");
              }
              return {
                httpStatus: existing.httpStatus,
                responseBody: existing.responseBody as T,
                replayed: true,
              };
            }

            const operation = await transaction.idempotencyOperation.create({
              data: {
                actorUserProfileId: request.actor.userProfileId,
                keyHash,
                operationType: request.operationType,
                requestHash,
                tenantId: request.actor.tenantId,
              },
            });
            const result = await mutate(transaction);
            const completedAt = new Date();
            await transaction.idempotencyOperation.update({
              data: compact({
                completedAt,
                expiresAt: new Date(completedAt.getTime() + RETENTION_MS),
                httpStatus: result.httpStatus,
                resourceId: result.resourceId,
                resourceType: result.resourceType,
                responseBody: toJson(result.responseBody),
                status: "COMPLETED",
              }) as Prisma.IdempotencyOperationUncheckedUpdateInput,
              where: { id: operation.id },
            });
            return { ...result, replayed: false };
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 10_000,
            timeout: 20_000,
          },
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < MAX_SERIALIZATION_ATTEMPTS
        ) {
          continue;
        }
        throw error;
      }
    }
    throw new IdempotencyError("IDEMPOTENCY_OPERATION_IN_PROGRESS");
  }
}

function requireKey(value: string | readonly string[] | undefined): string {
  if (typeof value !== "string" || !KEY_PATTERN.test(value)) {
    throw new IdempotencyError("IDEMPOTENCY_KEY_REQUIRED");
  }
  return value;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value));
}

function normalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value !== "object" || value === null) return value;
  if ("toFixed" in value && typeof value.toFixed === "function") {
    return String(value);
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, nested]) => nested !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, normalize(nested)]),
  );
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function compact<T extends Readonly<Record<string, unknown>>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, nested]) => nested !== undefined),
  );
}
