import { describe, expect, it } from "vitest";

import { calculateAoyStandings } from "@/lib/aoy-engine-core";
import type { AoyOfficialResultInput } from "@/types/aoy-engine";

const SEASON = "00000000-0000-4000-8000-000000000001";

function result(
  overrides: Partial<AoyOfficialResultInput> = {},
): AoyOfficialResultInput {
  const number = overrides.regularSeasonNumber ?? 1;
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
    officialPlacement: overrides.officialPlacement ?? 1,
    officialWeight: overrides.officialWeight ?? 10,
    officialPenalty: 0,
    participationStatus: "participated",
    aoyEligible: true,
    sourceUpdatedAt: "2026-07-29T12:00:00.000Z",
    ...overrides,
  };
}

describe("constitutional AOY engine", () => {
  it("uses only official numbered regular-season results", () => {
    const calculated = calculateAoyStandings(SEASON, [
      result(),
      result({
        officialResultId: "working",
        tournamentId: "working-event",
        tournamentResultStatus: "under_review",
      }),
      result({
        officialResultId: "championship",
        tournamentId: "championship-event",
        tournamentEventType: "championship",
        regularSeasonNumber: null,
      }),
      result({
        officialResultId: "cancelled",
        tournamentId: "cancelled-event",
        tournamentStatus: "Cancelled",
      }),
    ]);
    expect(calculated.performances).toHaveLength(1);
  });

  it("reranks eligible records and applies 200, 199, decreasing points", () => {
    const calculated = calculateAoyStandings(SEASON, [
      result({
        competitiveRecordId: "nonmember",
        officialPlacement: 1,
        aoyEligible: false,
      }),
      result({ competitiveRecordId: "team-a", officialPlacement: 2 }),
      result({ competitiveRecordId: "solo-a", recordType: "solo", officialPlacement: 3 }),
    ]);
    expect(
      Object.fromEntries(
        calculated.performances.map((row) => [
          row.competitiveRecordId,
          [row.aoyPlacement, row.points],
        ]),
      ),
    ).toEqual({
      nonmember: [null, 0],
      "team-a": [1, 200],
      "solo-a": [2, 199],
    });
  });

  it("keeps Team and Solo Competitive Records independent", () => {
    const calculated = calculateAoyStandings(SEASON, [
      result({ competitiveRecordId: "team", recordType: "team" }),
      result({
        competitiveRecordId: "solo",
        recordType: "solo",
        officialPlacement: 2,
      }),
    ]);
    expect(calculated.standings.map((row) => row.competitiveRecordId)).toEqual([
      "team",
      "solo",
    ]);
  });

  it("does not change credit when Team member display order is reversed", () => {
    const input = result();
    const reversed = {
      ...input,
      canonicalMembers: [...input.canonicalMembers].reverse(),
    };
    expect(calculateAoyStandings(SEASON, [input]).standings[0]).toMatchObject({
      competitiveRecordId: "record-a",
      totalCountedPoints: 200,
    });
    expect(calculateAoyStandings(SEASON, [reversed]).standings[0]).toMatchObject({
      competitiveRecordId: "record-a",
      totalCountedPoints: 200,
    });
  });

  it("uses the best five and visibly drops sixth through eighth", () => {
    const rows = Array.from({ length: 8 }, (_, index) =>
      result({
        regularSeasonNumber: index + 1,
        tournamentId: `event-${index + 1}`,
        officialResultId: `result-${index + 1}`,
      }),
    );
    const standing = calculateAoyStandings(SEASON, rows).standings[0];
    expect(standing.countedPerformances).toHaveLength(5);
    expect(standing.droppedPerformances).toHaveLength(3);
    expect(standing.totalCountedPoints).toBe(1000);
  });

  it("keeps fewer than five performances valid", () => {
    const standing = calculateAoyStandings(SEASON, [
      result(),
      result({
        regularSeasonNumber: 2,
        tournamentId: "event-2",
        officialResultId: "result-2",
      }),
    ]).standings[0];
    expect(standing.countedTournamentCount).toBe(2);
  });

  it("handles zero weight, withdrawals, no-shows, and DQs constitutionally", () => {
    const calculated = calculateAoyStandings(SEASON, [
      result({ competitiveRecordId: "zero", officialWeight: 0 }),
      result({
        competitiveRecordId: "withdrawal",
        officialWeight: 0,
        officialPlacement: null,
        participationStatus: "withdrew_after_start",
      }),
      result({
        competitiveRecordId: "noshow",
        officialWeight: 0,
        officialPlacement: null,
        participationStatus: "no_show",
      }),
      result({
        competitiveRecordId: "dq",
        officialWeight: 20,
        officialPlacement: null,
        participationStatus: "disqualified",
      }),
    ]);
    expect(
      Object.fromEntries(
        calculated.performances.map((row) => [
          row.competitiveRecordId,
          row.points,
        ]),
      ),
    ).toEqual({ zero: 10, withdrawal: 10, noshow: 0, dq: 0 });
  });

  it("is deterministic and date-independent", () => {
    const rows = [
      result({ regularSeasonNumber: 3, tournamentId: "postponed-3" }),
      result({
        regularSeasonNumber: 8,
        tournamentId: "event-8",
        officialResultId: "event-8-result",
      }),
    ];
    expect(calculateAoyStandings(SEASON, rows, "fixed")).toEqual(
      calculateAoyStandings(SEASON, [...rows].reverse(), "fixed"),
    );
  });

  it("includes a shortened tournament when its results are official", () => {
    const calculated = calculateAoyStandings(SEASON, [
      result({ tournamentStatus: "Shortened" }),
    ]);
    expect(calculated.performances).toHaveLength(1);
    expect(calculated.performances[0].points).toBe(200);
  });

  it("reflects corrected Official Result facts on recalculation", () => {
    const before = calculateAoyStandings(SEASON, [
      result({ competitiveRecordId: "a", officialPlacement: 1 }),
      result({ competitiveRecordId: "b", officialPlacement: 2 }),
    ]);
    const after = calculateAoyStandings(SEASON, [
      result({ competitiveRecordId: "a", officialPlacement: 2 }),
      result({ competitiveRecordId: "b", officialPlacement: 1 }),
    ]);
    expect(before.standings[0].competitiveRecordId).toBe("a");
    expect(after.standings[0].competitiveRecordId).toBe("b");
  });

  it("rejects duplicate record/tournament performances", () => {
    expect(() =>
      calculateAoyStandings(SEASON, [
        result(),
        result({ officialResultId: "duplicate" }),
      ]),
    ).toThrowError(
      expect.objectContaining({
        code: "AITT_AOY_DUPLICATE_PERFORMANCE",
      }),
    );
  });

  it("does not invent tournament-point treatment for official placement ties", () => {
    expect(() =>
      calculateAoyStandings(SEASON, [
        result({ competitiveRecordId: "a", officialPlacement: 1 }),
        result({ competitiveRecordId: "b", officialPlacement: 1 }),
      ]),
    ).toThrowError(
      expect.objectContaining({
        code: "AITT_AOY_OFFICIAL_PLACEMENT_TIE_UNRESOLVED",
      }),
    );
  });

  it("applies wins, Top 10s, season weight, then recent AOY finish", () => {
    const calculated = calculateAoyStandings(SEASON, [
      result({ competitiveRecordId: "a", officialPlacement: 1 }),
      result({ competitiveRecordId: "b", officialPlacement: 2 }),
      result({
        competitiveRecordId: "a",
        regularSeasonNumber: 2,
        tournamentId: "event-2",
        officialResultId: "a-2",
        officialPlacement: 2,
      }),
      result({
        competitiveRecordId: "b",
        regularSeasonNumber: 2,
        tournamentId: "event-2",
        officialResultId: "b-2",
        officialPlacement: 1,
      }),
    ]);
    expect(calculated.standings[0].competitiveRecordId).toBe("b");
    expect(calculated.standings[0].tie.resolvedBy).toBe("recent_aoy_finish");
  });

  it("surfaces an unresolved season tie instead of guessing", () => {
    const standings = calculateAoyStandings(SEASON, [
      result({ competitiveRecordId: "a", officialPlacement: 1 }),
      result({
        competitiveRecordId: "b",
        tournamentId: "other-event",
        officialResultId: "b-result",
        officialPlacement: 1,
      }),
    ]).standings;
    expect(standings[0].rank).toBe(1);
    expect(standings[1].rank).toBe(1);
    expect(standings[0].tie.status).toBe("unresolved");
  });

  it("retains registration and publication ownership on every performance", () => {
    const performance = calculateAoyStandings(SEASON, [result()])
      .performances[0];
    expect(performance).toMatchObject({
      registrationId: "registration-1-record-a",
      publicationId: "publication-1",
      competitiveRecordId: "record-a",
    });
  });
});

describe("AOY projection security", () => {
  it("keeps rebuild writes service-role only", async () => {
    const fs = await import("node:fs");
    const migration = fs.readFileSync(
      "supabase/migrations/202607290008_add_aoy_engine.sql",
      "utf8",
    );
    const actions = fs.readFileSync(
      "app/admin/results/aoy-actions.ts",
      "utf8",
    );
    expect(migration).toContain("replace_aoy_projection");
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("source_fingerprint = p_source_fingerprint");
    expect(migration).toContain("if found then");
    expect(migration).toContain("return v_run_id");
    expect(actions.match(/requireAdminUser\(\)/g)).toHaveLength(3);
  });
});
