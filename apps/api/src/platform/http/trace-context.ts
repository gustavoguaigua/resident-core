import { randomUUID } from "node:crypto";

const traceIdentifiers = new WeakMap<object, string>();

export const TRACE_ID_HEADER = "x-trace-id";

interface HeaderResponse {
  setHeader(name: string, value: string): void;
}

export function traceContextMiddleware(
  request: object,
  response: HeaderResponse,
  next: () => void,
): void {
  const traceId = randomUUID();

  traceIdentifiers.set(request, traceId);
  response.setHeader(TRACE_ID_HEADER, traceId);
  next();
}

export function getOrCreateTraceId(request: unknown): string {
  if (typeof request !== "object" || request === null) {
    return randomUUID();
  }

  const existingTraceId = traceIdentifiers.get(request);

  if (existingTraceId !== undefined) {
    return existingTraceId;
  }

  const traceId = randomUUID();
  traceIdentifiers.set(request, traceId);

  return traceId;
}
