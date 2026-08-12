import {
  Inject,
  Injectable,
  SetMetadata,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { mergeMap, type Observable } from "rxjs";

import { getOrCreateTraceId } from "../../platform/http/trace-context.js";
import {
  AUDIT_RECORDER_PORT,
  type AuditRecorderPort,
} from "./audit-recorder.port.js";

export const AUDIT_ACTION_METADATA = "resident:audit-action";

export function AuditAction(action: string): MethodDecorator {
  return SetMetadata(AUDIT_ACTION_METADATA, action);
}

@Injectable()
export class TechnicalAuditInterceptor implements NestInterceptor {
  public constructor(
    @Inject(AUDIT_RECORDER_PORT)
    private readonly recorder: AuditRecorderPort,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const action = this.reflector.getAllAndOverride<string>(
      AUDIT_ACTION_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (action === undefined) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<unknown>();

    return next.handle().pipe(
      mergeMap(async (value) => {
        await this.recorder.record({
          action,
          occurredAt: new Date().toISOString(),
          outcome: "succeeded",
          traceId: getOrCreateTraceId(request),
        });
        return value;
      }),
    );
  }
}
