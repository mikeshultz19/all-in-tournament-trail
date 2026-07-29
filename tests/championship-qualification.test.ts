import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  calculateChampionshipQualification,
} from "@/lib/championship-qualification-core";
import type { AoyOfficialResultInput } from "@/types/aoy-engine";

const SEASON = "00000000-0000-4000-8000-000000000001";

function result(
  number: number,
  overrides: Partial<AoyOfficialResultInput> = {},
): AoyOfficialResultInput {
  const record = overrides.competitiveRecordId ?? "record-a";
  return {
    officialResultId: `official-${number}-${record}`,
    publicationId: `publication-${number}`,
    seasonId: SEASON,
    tournamentId: `tournament-${number}`,
    regularSeasonNumber: number,
    tournamentResultStatus: "official",
    tournamentEventType: "regular_season",
    tournamentStatus: "Results Published",
    registrationId: `registration-${number}-${record}`,
    competitiveRecordId: record,
    recordType: "team",
    displayName: record,
    canonicalMembers: [
      { id: `${record}-1`, displayName: "One" },
      { id: `${record}-2`, displayName: "Two" },
    ],
    officialPlacement: 1,
    officialWeight: 10,
    officialPenalty: 0,
    participationStatus: "participated",
    aoyEligible: true,
    sourceUpdatedAt: "2026-07-29T12:00:00.000Z",
    ...overrides,
  };
}

describe("constitutional Championship qualification", () => {
  it("qualifies after five Official regular-season participations", () => {
    const qualification = calculateChampionshipQualification(
      SEASON,
      Array.from({ length: 5 }, (_, index) => result(index + 1)),
      "fixed",
    ).qualifications[0];
    expect(qualification).toMatchObject({
      officialParticipations: 5,
      remainingParticipationCount: 0,
      qualificationStatus: "qualified",
      qualifiedAt: "fixed",
    });
  });

  it("does not qualify with four participations", () => {
    const qualification = calculateChampionshipQualification(
      SEASON,
      Array.from({ length: 4 }, (_, index) => result(index + 1)),
    ).qualifications[0];
    expect(qualification).toMatchObject({
      officialParticipations: 4,
      remainingParticipationCount: 1,
      qualificationStatus: "not_qualified",
      qualifiedAt: null,
    });
  });

  it("excludes Working Results, Championship, and cancelled events", () => {
    const calculated = calculateChampionshipQualification(SEASON, [
      result(1),
      result(2, { tournamentResultStatus: "under_review" }),
      result(3, { tournamentEventType: "championship" }),
      result(4, { tournamentStatus: "Cancelled" }),
    ]);
    expect(calculated.participations).toHaveLength(1);
  });

  it("counts withdrawals and shortened Official tournaments", () => {
    const calculated = calculateChampionshipQualification(SEASON, [
      result(3, {
        participationStatus: "withdrew_after_start",
        tournamentStatus: "Shortened",
      }),
    ]);
    expect(calculated.participations[0].countsTowardQualification).toBe(true);
  });

  it("does not count no-shows, DQs, or historically ineligible records", () => {
    const calculated = calculateChampionshipQualification(SEASON, [
      result(1, { participationStatus: "no_show" }),
      result(2, { participationStatus: "disqualified" }),
      result(3, { aoyEligible: false }),
    ]);
    expect(calculated.qualifications[0].officialParticipations).toBe(0);
    expect(
      calculated.participations.map((row) => row.exclusionReason),
    ).toEqual(["no_show", "disqualified", "ineligible"]);
  });

  it("uses immutable tournament sequence for postponed events", () => {
    const calculated = calculateChampionshipQualification(SEASON, [
      result(3, {
        tournamentId: "postponed-number-3",
        sourceUpdatedAt: "2027-12-31T00:00:00.000Z",
      }),
      result(8, {
        sourceUpdatedAt: "2026-01-01T00:00:00.000Z",
      }),
    ]);
    expect(
      calculated.participations.map((row) => row.regularSeasonNumber),
    ).toEqual([3, 8]);
  });

  it("keeps Team and Solo Competitive Records separate", () => {
    const calculated = calculateChampionshipQualification(SEASON, [
      result(1, { competitiveRecordId: "team", recordType: "team" }),
      result(1, {
        competitiveRecordId: "solo",
        recordType: "solo",
        registrationId: "solo-registration",
      }),
    ]);
    expect(
      calculated.qualifications.map((row) => [
        row.competitiveRecordId,
        row.recordType,
      ]),
    ).toEqual([
      ["solo", "solo"],
      ["team", "team"],
    ]);
  });

  it("rejects duplicate record participation in one tournament", () => {
    expect(() =>
      calculateChampionshipQualification(SEASON, [
        result(1),
        result(1, { officialResultId: "duplicate" }),
      ]),
    ).toThrowError(
      expect.objectContaining({
        code: "AITT_CHAMPIONSHIP_DUPLICATE_PARTICIPATION",
      }),
    );
  });

  it("is deterministic and reflects corrected Official participation", () => {
    const source = Array.from({ length: 5 }, (_, index) => result(index + 1));
    expect(
      calculateChampionshipQualification(SEASON, source, "fixed"),
    ).toEqual(
      calculateChampionshipQualification(
        SEASON,
        [...source].reverse(),
        "fixed",
      ),
    );
    const corrected = source.map((row, index) =>
      index === 0 ? { ...row, participationStatus: "disqualified" as const } : row,
    );
    expect(
      calculateChampionshipQualification(SEASON, corrected)
        .qualifications[0].qualificationStatus,
    ).toBe("not_qualified");
  });
});

describe("Championship projection security and idempotency", () => {
  const migration = readFileSync(
    "supabase/migrations/202607290009_add_championship_qualification_engine.sql",
    "utf8",
  );
  const actions = readFileSync(
    "app/admin/results/championship-actions.ts",
    "utf8",
  );
  const correctionActions = readFileSync(
    "app/admin/results/correction-actions.ts",
    "utf8",
  );

  it("reuses an identical calculation run", () => {
    expect(migration).toContain("source_fingerprint = p_source_fingerprint");
    expect(migration).toContain("if found then");
    expect(migration).toContain("return v_run_id");
  });

  it("protects recalculation and validates Official sources", () => {
    expect(migration).toContain("tournament.result_status <> 'official'");
    expect(migration).toContain("tournament.event_type <> 'regular_season'");
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("to service_role");
    expect(actions.match(/requireAdminUser\(\)/g)).toHaveLength(2);
  });

  it("rebuilds qualification after protected Official Results corrections", () => {
    expect(correctionActions).toContain(
      "rebuildChampionshipQualificationForOfficialResult",
    );
    expect(
      correctionActions.match(
        /rebuildChampionshipQualificationForOfficialResult\(/g,
      ),
    ).toHaveLength(2);
    expect(correctionActions.match(/requireAdminUser\(\)/g)).toHaveLength(4);
  });
});
