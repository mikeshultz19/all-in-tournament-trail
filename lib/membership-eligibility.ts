import type {
  Membership,
  TournamentEventType,
} from "@/types/aoy";

export function isMembershipEligibleForTournament(
  membership: Membership | null,
  seasonId: string,
  tournamentNumber: number | null,
  firstEligibleTournamentNumber: number | null,
  eventType: TournamentEventType = "regular_season",
): boolean {
  const validFirstNumber =
    firstEligibleTournamentNumber !== null &&
    firstEligibleTournamentNumber >= 1 &&
    firstEligibleTournamentNumber <= 8;
  const validEventNumber =
    tournamentNumber !== null &&
    tournamentNumber >= 1 &&
    tournamentNumber <= 8;

  return Boolean(
    membership &&
      membership.status === "active" &&
      membership.season_id === seasonId &&
      membership.first_eligible_tournament_id &&
      validFirstNumber &&
      (eventType === "championship" ||
        (validEventNumber &&
          firstEligibleTournamentNumber! <= tournamentNumber!)),
  );
}
