import type { AoyOfficialResultInput } from "@/types/aoy-engine";
import type {
  ChampionshipParticipationRecord,
  ChampionshipQualificationResult,
} from "@/types/championship-qualification";

const VERSION = "aitt-championship-qualification-1.0" as const;
const REQUIRED_PARTICIPATIONS = 5;

export class ChampionshipQualificationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "AITT_CHAMPIONSHIP_INVALID_SEASON"
      | "AITT_CHAMPIONSHIP_DUPLICATE_PARTICIPATION",
  ) {
    super(message);
    this.name = "ChampionshipQualificationError";
  }
}

function countsAsParticipation(row: AoyOfficialResultInput): boolean {
  return (
    row.aoyEligible &&
    (row.participationStatus === "participated" ||
      row.participationStatus === "withdrew_after_start")
  );
}

function exclusionReason(
  row: AoyOfficialResultInput,
): ChampionshipParticipationRecord["exclusionReason"] {
  if (!row.aoyEligible) return "ineligible";
  if (row.participationStatus === "no_show") return "no_show";
  if (row.participationStatus === "disqualified") return "disqualified";
  return null;
}

export function calculateChampionshipQualification(
  seasonId: string,
  source: readonly AoyOfficialResultInput[],
  calculatedAt = new Date().toISOString(),
): ChampionshipQualificationResult {
  if (!seasonId) {
    throw new ChampionshipQualificationError(
      "A season is required.",
      "AITT_CHAMPIONSHIP_INVALID_SEASON",
    );
  }
  const officialRegularSeason = source
    .filter(
      (row) =>
        row.seasonId === seasonId &&
        row.tournamentResultStatus === "official" &&
        row.tournamentEventType === "regular_season" &&
        row.tournamentStatus !== "Cancelled" &&
        row.regularSeasonNumber !== null &&
        row.regularSeasonNumber >= 1 &&
        row.regularSeasonNumber <= 8,
    )
    .sort(
      (left, right) =>
        left.regularSeasonNumber! - right.regularSeasonNumber! ||
        left.competitiveRecordId.localeCompare(right.competitiveRecordId),
    );

  const seen = new Set<string>();
  for (const row of officialRegularSeason) {
    const key = `${row.tournamentId}:${row.competitiveRecordId}`;
    if (seen.has(key)) {
      throw new ChampionshipQualificationError(
        "A Competitive Record has duplicate Official Results for one tournament.",
        "AITT_CHAMPIONSHIP_DUPLICATE_PARTICIPATION",
      );
    }
    seen.add(key);
  }

  const participations = officialRegularSeason.map((row) => ({
    officialResultId: row.officialResultId,
    publicationId: row.publicationId,
    seasonId,
    tournamentId: row.tournamentId,
    regularSeasonNumber: row.regularSeasonNumber!,
    registrationId: row.registrationId,
    competitiveRecordId: row.competitiveRecordId,
    recordType: row.recordType,
    participationStatus: row.participationStatus,
    historicallyEligible: row.aoyEligible,
    countsTowardQualification: countsAsParticipation(row),
    exclusionReason: exclusionReason(row),
    calculatedAt,
  }));

  const sourceByRecord = new Map<string, AoyOfficialResultInput>();
  const participationByRecord = new Map<
    string,
    ChampionshipParticipationRecord[]
  >();
  for (const row of officialRegularSeason) {
    sourceByRecord.set(row.competitiveRecordId, row);
  }
  for (const row of participations) {
    participationByRecord.set(row.competitiveRecordId, [
      ...(participationByRecord.get(row.competitiveRecordId) ?? []),
      row,
    ]);
  }

  const qualifications = [...participationByRecord.entries()]
    .map(([competitiveRecordId, rows]) => {
      const sourceIdentity = sourceByRecord.get(competitiveRecordId)!;
      const qualifyingTournaments = rows.filter(
        (row) => row.countsTowardQualification,
      );
      const creditedNumbers = new Set(
        qualifyingTournaments.map((row) => row.regularSeasonNumber),
      );
      const qualified =
        qualifyingTournaments.length >= REQUIRED_PARTICIPATIONS;
      return {
        competitiveRecordId,
        displayName: sourceIdentity.displayName,
        recordType: sourceIdentity.recordType,
        canonicalMembers: [...sourceIdentity.canonicalMembers].sort((a, b) =>
          a.id.localeCompare(b.id),
        ),
        officialParticipations: qualifyingTournaments.length,
        qualifyingTournaments,
        nonqualifyingOfficialResults: rows.filter(
          (row) => !row.countsTowardQualification,
        ),
        remainingParticipationCount: Math.max(
          0,
          REQUIRED_PARTICIPATIONS - qualifyingTournaments.length,
        ),
        uncreditedRegularSeasonNumbers: Array.from(
          { length: 8 },
          (_, index) => index + 1,
        ).filter((number) => !creditedNumbers.has(number)),
        qualificationStatus: qualified
          ? ("qualified" as const)
          : ("not_qualified" as const),
        qualifiedAt: qualified ? calculatedAt : null,
        lastRecalculatedAt: calculatedAt,
      };
    })
    .sort((left, right) =>
      left.competitiveRecordId.localeCompare(right.competitiveRecordId),
    );

  return {
    seasonId,
    calculationVersion: VERSION,
    calculatedAt,
    participations,
    qualifications,
  };
}
