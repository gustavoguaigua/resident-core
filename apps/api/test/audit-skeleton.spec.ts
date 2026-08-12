import "reflect-metadata";

import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { lastValueFrom, of } from "rxjs";
import { describe, expect, it, vi } from "vitest";

import type { AuditRecorderPort } from "../src/modules/audit/audit-recorder.port.js";
import {
  AUDIT_ACTION_METADATA,
  TechnicalAuditInterceptor,
} from "../src/modules/audit/technical-audit.interceptor.js";
import { UnavailableAuditRecorder } from "../src/modules/audit/unavailable-audit-recorder.js";

describe("non-persistent audit skeleton", () => {
  it("explicitly reports that persistence is not configured", async () => {
    const recorder = new UnavailableAuditRecorder();

    await expect(
      recorder.record({
        action: "platform.example",
        occurredAt: new Date(0).toISOString(),
        outcome: "succeeded",
        traceId: "synthetic-trace-id",
      }),
    ).resolves.toEqual({ status: "notConfigured" });
  });

  it("does not record when an audit action was not declared", async () => {
    const recorder: AuditRecorderPort = { record: vi.fn() };
    const interceptor = new TechnicalAuditInterceptor(
      recorder,
      new Reflector(),
    );

    await expect(
      lastValueFrom(
        interceptor.intercept(createContext(false), createHandler("result")),
      ),
    ).resolves.toBe("result");
    expect(recorder.record).not.toHaveBeenCalled();
  });

  it("forwards a declared technical event without claiming durability", async () => {
    const recorder = new UnavailableAuditRecorder();
    const record = vi.spyOn(recorder, "record");
    const interceptor = new TechnicalAuditInterceptor(
      recorder,
      new Reflector(),
    );

    await expect(
      lastValueFrom(
        interceptor.intercept(createContext(true), createHandler("result")),
      ),
    ).resolves.toBe("result");
    expect(record).toHaveBeenCalledWith({
      action: "platform.example",
      occurredAt: expect.any(String),
      outcome: "succeeded",
      traceId: expect.any(String),
    });
  });
});

function createContext(withAuditAction: boolean): ExecutionContext {
  const handler = (): void => undefined;
  class TestController {}

  if (withAuditAction) {
    Reflect.defineMetadata(AUDIT_ACTION_METADATA, "platform.example", handler);
  }

  return {
    getClass: () => TestController,
    getHandler: () => handler,
    switchToHttp: () => ({ getRequest: () => ({}) }),
  } as unknown as ExecutionContext;
}

function createHandler(value: unknown): CallHandler {
  return { handle: () => of(value) };
}
