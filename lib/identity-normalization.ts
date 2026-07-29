const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeSafeSpacing(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*([,'’/-])\s*/g, "$1");
}

export function normalizeAnglerDisplayName(value: string): string {
  return normalizeSafeSpacing(value);
}

export function normalizeAnglerName(value: string): string {
  return normalizeSafeSpacing(value).toLowerCase();
}

export function createCanonicalTeamKey(
  anglerIds: readonly string[],
): string {
  const normalizedIds = anglerIds.map((id) => id.trim().toLowerCase());
  const uniqueIds = [...new Set(normalizedIds)];

  if (
    uniqueIds.length !== normalizedIds.length ||
    uniqueIds.length < 1 ||
    uniqueIds.length > 2 ||
    uniqueIds.some((id) => !UUID_PATTERN.test(id))
  ) {
    throw new Error("A team requires one or two distinct angler UUIDs.");
  }

  return uniqueIds.sort().join(":");
}

export type CompetitiveRecordType = "team" | "solo";

export function createCanonicalCompetitiveRecordKey(
  recordType: CompetitiveRecordType,
  anglerIds: readonly string[],
): string {
  const expectedCount = recordType === "team" ? 2 : 1;

  if (anglerIds.length !== expectedCount) {
    throw new Error(
      `${recordType === "team" ? "Team" : "Solo"} Competitive Records require exactly ${expectedCount} stable angler${expectedCount === 1 ? "" : "s"}.`,
    );
  }

  return createCanonicalTeamKey(anglerIds);
}
