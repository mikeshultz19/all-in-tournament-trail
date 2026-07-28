import type { AdminMemberListRow } from "@/types/aoy";

export function filterMemberRows(
  members: readonly AdminMemberListRow[],
  query: string,
): AdminMemberListRow[] {
  const normalizedQuery = query.trim().replace(/\s+/g, " ").toLowerCase();

  if (!normalizedQuery) {
    return [...members];
  }

  return members.filter((member) =>
    [
      member.first_name,
      member.last_name,
      member.display_name,
      member.email ?? "",
      member.phone ?? "",
    ].some((value) => value.toLowerCase().includes(normalizedQuery)),
  );
}

export function formatMemberDate(value: string): string {
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value,
  );

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
