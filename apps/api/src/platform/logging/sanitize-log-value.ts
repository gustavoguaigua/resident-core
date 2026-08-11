const REDACTED = "[REDACTED]";

const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|password|passwd|secret|token|api[_-]?key|access[_-]?key|database[_-]?url|connection[_-]?string/i;

const SENSITIVE_ASSIGNMENT_PATTERN =
  /((?:authorization|cookie|password|passwd|secret|token|api[_-]?key|access[_-]?key|database[_-]?url|connection[_-]?string)\s*[=:]\s*)([^\s,;]+)/gi;

export function sanitizeLogValue(value: unknown): unknown {
  return sanitizeValue(value, new WeakSet<object>(), 0);
}

function sanitizeValue(
  value: unknown,
  seen: WeakSet<object>,
  depth: number,
): unknown {
  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (
    value === null ||
    value === undefined ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeString(value.message),
    };
  }

  if (typeof value !== "object") {
    return String(value);
  }

  if (depth >= 6 || seen.has(value)) {
    return "[TRUNCATED]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED
        : sanitizeValue(nestedValue, seen, depth + 1),
    ]),
  );
}

function sanitizeString(value: string): string {
  return value
    .replace(/(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi, `$1${REDACTED}`)
    .replace(
      /([a-z][a-z0-9+.-]*:\/\/)([^/\s:@]+):([^@\s/]+)@/gi,
      `$1${REDACTED}@`,
    )
    .replace(SENSITIVE_ASSIGNMENT_PATTERN, `$1${REDACTED}`);
}
