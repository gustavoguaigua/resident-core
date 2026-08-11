export function smokeSuiteName(scope: string): string {
  const normalizedScope = scope.trim();

  if (normalizedScope.length === 0) {
    throw new Error("Smoke suite scope must not be empty");
  }

  return `${normalizedScope} smoke`;
}
