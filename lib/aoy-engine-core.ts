import type {
  AoyCalculationResult,
  AoyOfficialResultInput,
  AoyStanding,
  AoyTournamentPerformance,
} from "@/types/aoy-engine";

export class AoyCalculationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "AITT_AOY_INVALID_SEASON"
      | "AITT_AOY_DUPLICATE_PERFORMANCE"
      | "AITT_AOY_OFFICIAL_PLACEMENT_TIE_UNRESOLVED"
      | "AITT_AOY_UNRANKED_WEIGHTED_RESULT"
      | "AITT_AOY_POINT_SCHEDULE_UNDEFINED",
  ) {
    super(message);
    this.name = "AoyCalculationError";
  }
}

const VERSION = "aitt-aoy-1.0" as const;

function isParticipation(status: AoyOfficialResultInput["participationStatus"]) {
  return status === "participated" || status === "withdrew_after_start";
}

function groupBy<T>(
  values: readonly T[],
  keyFor: (value: T) => string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const value of values) {
    const key = keyFor(value);
    groups.set(key, [...(groups.get(key) ?? []), value]);
  }
  return groups;
}

function compareRecentFinish(
  left: AoyTournamentPerformance[],
  right: AoyTournamentPerformance[],
): number | null {
  const leftByNumber = new Map(
    left.filter((item) => item.aoyPlacement !== null)
      .map((item) => [item.regularSeasonNumber, item.aoyPlacement!]),
  );
  const rightByNumber = new Map(
    right.filter((item) => item.aoyPlacement !== null)
      .map((item) => [item.regularSeasonNumber, item.aoyPlacement!]),
  );

  for (let number = 8; number >= 1; number -= 1) {
    const leftPlace = leftByNumber.get(number);
    const rightPlace = rightByNumber.get(number);
    if (leftPlace === undefined && rightPlace === undefined) continue;
    // The Constitution does not define how absence compares with a finish.
    if (leftPlace === undefined || rightPlace === undefined) return null;
    if (leftPlace !== rightPlace) return leftPlace - rightPlace;
  }
  return 0;
}

export function calculateAoyStandings(
  seasonId: string,
  source: readonly AoyOfficialResultInput[],
  calculatedAt = new Date().toISOString(),
): AoyCalculationResult {
  if (!seasonId) {
    throw new AoyCalculationError(
      "A season is required.",
      "AITT_AOY_INVALID_SEASON",
    );
  }

  const eligibleSource = source.filter(
    (row) =>
      row.seasonId === seasonId &&
      row.tournamentResultStatus === "official" &&
      row.tournamentEventType === "regular_season" &&
      row.tournamentStatus !== "Cancelled" &&
      row.regularSeasonNumber !== null &&
      row.regularSeasonNumber >= 1 &&
      row.regularSeasonNumber <= 8,
  );
  const keys = new Set<string>();
  for (const row of eligibleSource) {
    const key = `${row.tournamentId}:${row.competitiveRecordId}`;
    if (keys.has(key)) {
      throw new AoyCalculationError(
        "A Competitive Record has more than one Official Result in a tournament.",
        "AITT_AOY_DUPLICATE_PERFORMANCE",
      );
    }
    keys.add(key);
  }

  const aoyPlaces = new Map<string, number>();
  const byTournament = groupBy(
    eligibleSource.filter(
      (row) =>
        row.aoyEligible &&
        isParticipation(row.participationStatus) &&
        row.officialPlacement !== null,
    ),
    (row) => row.tournamentId,
  );

  for (const rows of byTournament.values()) {
    const sorted = [...rows].sort(
      (left, right) => left.officialPlacement! - right.officialPlacement!,
    );
    for (let index = 1; index < sorted.length; index += 1) {
      if (sorted[index - 1].officialPlacement === sorted[index].officialPlacement) {
        throw new AoyCalculationError(
          "The Competition Rules do not define AOY points for tied Official placements.",
          "AITT_AOY_OFFICIAL_PLACEMENT_TIE_UNRESOLVED",
        );
      }
    }
    sorted.forEach((row, index) => {
      const position = index + 1;
      if (position > 201) {
        throw new AoyCalculationError(
          "The published AOY schedule does not define negative point awards.",
          "AITT_AOY_POINT_SCHEDULE_UNDEFINED",
        );
      }
      aoyPlaces.set(row.officialResultId, position);
    });
  }

  const performances: AoyTournamentPerformance[] = eligibleSource.map((row) => {
    const participated = isParticipation(row.participationStatus);
    const aoyPlacement = aoyPlaces.get(row.officialResultId) ?? null;
    if (
      row.aoyEligible &&
      participated &&
      row.officialWeight > 0 &&
      aoyPlacement === null
    ) {
      throw new AoyCalculationError(
        "An eligible positive-weight result has no AOY placement.",
        "AITT_AOY_UNRANKED_WEIGHTED_RESULT",
      );
    }
    const points =
      !row.aoyEligible ||
      row.participationStatus === "no_show" ||
      row.participationStatus === "disqualified"
        ? 0
        : row.officialWeight === 0
          ? 10
          : 201 - aoyPlacement!;

    return {
      officialResultId: row.officialResultId,
      publicationId: row.publicationId,
      seasonId,
      tournamentId: row.tournamentId,
      regularSeasonNumber: row.regularSeasonNumber!,
      registrationId: row.registrationId,
      competitiveRecordId: row.competitiveRecordId,
      recordType: row.recordType,
      officialPlacement: row.officialPlacement,
      aoyPlacement,
      officialWeight: row.officialWeight,
      officialPenalty: row.officialPenalty,
      points,
      participationStatus: row.participationStatus,
      eligible: row.aoyEligible,
      counted: false,
      calculatedAt,
    };
  });

  const sourceByRecord = groupBy(
    eligibleSource,
    (row) => row.competitiveRecordId,
  );
  const performanceByRecord = groupBy(
    performances.filter((row) => row.eligible),
    (row) => row.competitiveRecordId,
  );

  for (const rows of performanceByRecord.values()) {
    [...rows]
      .sort(
        (left, right) =>
          right.points - left.points ||
          left.regularSeasonNumber - right.regularSeasonNumber,
      )
      .slice(0, 5)
      .forEach((row) => {
        row.counted = true;
      });
  }

  const provisional = [...performanceByRecord.entries()].map(
    ([competitiveRecordId, rows]): AoyStanding => {
      const identity = sourceByRecord.get(competitiveRecordId)![0];
      const counted = rows.filter((row) => row.counted);
      const participations = rows.filter((row) =>
        isParticipation(row.participationStatus),
      );
      return {
        rank: 0,
        competitiveRecordId,
        displayName: identity.displayName,
        recordType: identity.recordType,
        canonicalMembers: identity.canonicalMembers,
        totalCountedPoints: counted.reduce((sum, row) => sum + row.points, 0),
        countedTournamentCount: counted.length,
        officialParticipationCount: participations.length,
        wins: rows.filter((row) => row.aoyPlacement === 1).length,
        topTens: rows.filter(
          (row) => row.aoyPlacement !== null && row.aoyPlacement <= 10,
        ).length,
        totalOfficialSeasonWeight: rows.reduce(
          (sum, row) =>
            sum +
            (isParticipation(row.participationStatus)
              ? row.officialWeight
              : 0),
          0,
        ),
        countedPerformances: counted.sort(
          (a, b) => a.regularSeasonNumber - b.regularSeasonNumber,
        ),
        droppedPerformances: rows
          .filter((row) => !row.counted)
          .sort((a, b) => a.regularSeasonNumber - b.regularSeasonNumber),
        tie: {
          status: "resolved",
          resolvedBy: "points",
          tiedWithCompetitiveRecordIds: [],
          reason: null,
        },
        lastRecalculatedAt: calculatedAt,
      };
    },
  );

  const comparator = (left: AoyStanding, right: AoyStanding) => {
    const comparisons: Array<[number, AoyStanding["tie"]["resolvedBy"]]> = [
      [right.totalCountedPoints - left.totalCountedPoints, "points"],
      [right.wins - left.wins, "wins"],
      [right.topTens - left.topTens, "top_tens"],
      [
        right.totalOfficialSeasonWeight - left.totalOfficialSeasonWeight,
        "season_weight",
      ],
    ];
    for (const [difference] of comparisons) {
      if (difference !== 0) return difference;
    }
    const recent = compareRecentFinish(
      [...left.countedPerformances, ...left.droppedPerformances],
      [...right.countedPerformances, ...right.droppedPerformances],
    );
    return recent ?? 0;
  };
  provisional.sort(
    (left, right) =>
      comparator(left, right) ||
      left.competitiveRecordId.localeCompare(right.competitiveRecordId),
  );

  for (let index = 0; index < provisional.length; index += 1) {
    const row = provisional[index];
    const tied = provisional.filter((other) => {
      if (other.competitiveRecordId === row.competitiveRecordId) return false;
      return comparator(row, other) === 0;
    });
    row.rank =
      index > 0 && comparator(provisional[index - 1], row) === 0
        ? provisional[index - 1].rank
        : index + 1;
    if (tied.length) {
      row.tie = {
        status: "unresolved",
        resolvedBy: null,
        tiedWithCompetitiveRecordIds: tied.map(
          (item) => item.competitiveRecordId,
        ),
        reason:
          "All constitutional tie breakers are equal or a recent-finish comparison lacks a finish for one tied record.",
      };
    } else {
      const peer = provisional[index + 1] ?? provisional[index - 1];
      const resolvedBy =
        !peer || row.totalCountedPoints !== peer.totalCountedPoints
          ? "points"
          : row.wins !== peer.wins
            ? "wins"
            : row.topTens !== peer.topTens
              ? "top_tens"
              : row.totalOfficialSeasonWeight !==
                  peer.totalOfficialSeasonWeight
                ? "season_weight"
                : "recent_aoy_finish";
      row.tie.resolvedBy = resolvedBy;
    }
  }

  return {
    seasonId,
    calculationVersion: VERSION,
    calculatedAt,
    performances: performances.sort(
      (left, right) =>
        left.regularSeasonNumber - right.regularSeasonNumber ||
        left.competitiveRecordId.localeCompare(right.competitiveRecordId),
    ),
    standings: provisional,
  };
}
