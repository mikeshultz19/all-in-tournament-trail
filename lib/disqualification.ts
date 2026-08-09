export interface DisqualificationAwareResult {
  participation_status?: string | null;
}

export function isDisqualified(row: DisqualificationAwareResult): boolean {
  return row.participation_status === "disqualified";
}

export function excludeDisqualified<T extends DisqualificationAwareResult>(
  rows: readonly T[],
): T[] {
  return rows.filter((row) => !isDisqualified(row));
}
