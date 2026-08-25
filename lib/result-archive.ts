import type {
  LatestTournamentResults,
  TournamentResultsRecord,
} from "@/types/results";
import type { Tournament } from "@/types/tournament";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

export function buildPublishedResultsArchive(
  publishedTournaments: Tournament[],
  resultsRecords: TournamentResultsRecord[],
  insurancePotRecords: TournamentInsurancePotResultRecord[] = [],
  closeoutTotals: Array<{ tournament_id: string; total_paid_cents: number }> = [],
): LatestTournamentResults[] {
  const resultsByTournamentId = new Map(
    resultsRecords.map((result) => [result.tournament_id, result]),
  );
  const insuranceByTournamentId = new Map(
    insurancePotRecords.map((result) => [result.tournament_id, result]),
  );
  const closeoutTotalByTournamentId = new Map(
    closeoutTotals.map((closeout) => [
      closeout.tournament_id,
      Number(closeout.total_paid_cents) / 100,
    ]),
  );

  return publishedTournaments.flatMap((tournament) => {
    if (tournament.status !== "Results Published") {
      return [];
    }

    const results = resultsByTournamentId.get(tournament.id);

    if (!results) {
      return [];
    }

    const identifier = tournament.slug || tournament.id;

    const completeResultsUrl = `/results/${encodeURIComponent(identifier)}`;
    return [
      {
        tournament,
        results,
        tournamentImage: tournament.hero_image_url ?? null,
        championImage:
          results.champion_image_url ??
          "/images/results/overall-winner.jpg",
        bigBassImage:
          results.big_bass_image_url ?? "/images/results/big-bass.jpg",
        completeResultsUrl,
        insurancePotResult: insuranceByTournamentId.get(tournament.id) ?? null,
        insurancePotWinnersUrl: `${completeResultsUrl}#insurance-pot-winners`,
        totalPaidOutToAnglers: closeoutTotalByTournamentId.get(tournament.id),
        tournamentRecap: tournament.tournament_recap ?? undefined,
      },
    ];
  });
}
