import type { Membership } from "@/types/aoy";

function datePart(value: string): string | null {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

export function isMembershipEligibleOnDate(
  membership: Membership | null,
  seasonId: string,
  tournamentDate: string,
): boolean {
  const eventDate = datePart(tournamentDate);

  return Boolean(
    membership &&
      membership.status === "active" &&
      membership.season_id === seasonId &&
      eventDate &&
      membership.effective_date <= eventDate,
  );
}
