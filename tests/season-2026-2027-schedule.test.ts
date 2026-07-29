import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { tournaments } from "@/data/tournaments";
import { calculateAoyStandings } from "@/lib/aoy-engine-core";
import { calculateChampionshipQualification } from "@/lib/championship-qualification-core";
import { getTournamentDisplay } from "@/lib/tournament-display";
import type { AoyOfficialResultInput } from "@/types/aoy-engine";

const migration = readFileSync(
  "supabase/migrations/202607290010_set_2026_2027_official_schedule.sql",
  "utf8",
);
const numberingMigration = readFileSync(
  "supabase/migrations/202607290002_add_immutable_regular_season_number.sql",
  "utf8",
);
const seasonId = "00000000-0000-4000-8000-000000000001";

const approvedRegularSeason = [
  [1, "Eagle Mountain", "2026-11-01"],
  [2, "Squaw Creek", "2026-11-22"],
  [3, "Ray Hubbard", "2026-12-13"],
  [4, "Granbury", "2027-01-17"],
  [5, "Squaw Creek", "2027-02-14"],
  [6, "Ray Roberts", "2027-03-14"],
  [7, "Tawakoni", "2027-04-25"],
  [8, "Lewisville", "2027-05-16"],
] as const;

function officialResult(
  regularSeasonNumber: number | null,
  overrides: Partial<AoyOfficialResultInput> = {},
): AoyOfficialResultInput {
  return {
    officialResultId: `official-${regularSeasonNumber ?? "championship"}`,
    publicationId: `publication-${regularSeasonNumber ?? "championship"}`,
    seasonId,
    tournamentId: `tournament-${regularSeasonNumber ?? "championship"}`,
    regularSeasonNumber,
    tournamentResultStatus: "official",
    tournamentEventType:
      regularSeasonNumber === null ? "championship" : "regular_season",
    tournamentStatus: "Results Published",
    registrationId: `registration-${regularSeasonNumber ?? "championship"}`,
    competitiveRecordId: "record-a",
    recordType: "solo",
    displayName: "Sample Angler",
    canonicalMembers: [{ id: "angler-a", displayName: "Sample Angler" }],
    officialPlacement: 1,
    officialWeight: 10,
    officialPenalty: 0,
    participationStatus: "participated",
    aoyEligible: true,
    sourceUpdatedAt: "2027-06-14T00:00:00.000Z",
    ...overrides,
  };
}

describe("official 2026–2027 season schedule", () => {
  it("contains exactly the approved eight numbered regular-season events", () => {
    const regularSeason = tournaments.filter(
      (tournament) => tournament.eventType === "regular_season",
    );

    expect(regularSeason).toHaveLength(8);
    expect(
      regularSeason.map((tournament) => [
        tournament.regularSeasonNumber,
        tournament.lake,
        tournament.date,
      ]),
    ).toEqual(approvedRegularSeason);
  });

  it("represents the unnumbered two-day Championship with a TBD lake", () => {
    const championships = tournaments.filter(
      (tournament) => tournament.eventType === "championship",
    );

    expect(championships).toHaveLength(1);
    expect(championships[0]).toMatchObject({
      regularSeasonNumber: null,
      lake: "TBD",
      date: "2027-06-12",
      endDate: "2027-06-13",
    });
    expect(getTournamentDisplay(championships[0]).date).toBe(
      "Jun 12, 2027 – Jun 13, 2027",
    );
  });

  it("keeps the database range at 1–8 and rejects number 9", () => {
    expect(numberingMigration).toContain(
      "regular_season_number between 1 and 8",
    );
    expect(numberingMigration).not.toContain(
      "regular_season_number between 1 and 9",
    );
    expect(migration).toContain("'championship'");
    expect(migration).toContain("regular_season_number = null");
  });

  it("records the approved season and Championship date boundaries", () => {
    expect(migration).toContain("date '2026-11-01'");
    expect(migration).toContain("date '2027-05-16'");
    expect(migration).toContain("date '2027-06-12'");
    expect(migration).toContain("date '2027-06-13'");
  });

  it("uses best five of eight for AOY and excludes the Championship", () => {
    const source = [
      ...Array.from({ length: 8 }, (_, index) =>
        officialResult(index + 1, {
          officialResultId: `official-${index + 1}`,
          tournamentId: `tournament-${index + 1}`,
          registrationId: `registration-${index + 1}`,
          officialPlacement: index + 1,
        }),
      ),
      officialResult(null),
    ];
    const calculated = calculateAoyStandings(seasonId, source);

    expect(calculated.performances).toHaveLength(8);
    expect(calculated.standings[0].countedPerformances).toHaveLength(5);
    expect(calculated.standings[0].droppedPerformances).toHaveLength(3);
  });

  it("qualifies at five of eight and excludes the Championship", () => {
    const calculated = calculateChampionshipQualification(seasonId, [
      ...Array.from({ length: 5 }, (_, index) =>
        officialResult(index + 1, {
          officialResultId: `official-${index + 1}`,
          tournamentId: `tournament-${index + 1}`,
          registrationId: `registration-${index + 1}`,
        }),
      ),
      officialResult(null),
    ]);

    expect(calculated.participations).toHaveLength(5);
    expect(calculated.qualifications[0].qualificationStatus).toBe("qualified");
  });
});
