import { describe, expect, it } from "vitest";

import {
  calculateResultPayouts,
  getInsurancePotWinnersForEntry,
  getTeamPayouts,
  paginateResultEntries,
} from "@/lib/result-payouts";
import type { ResultEntry } from "@/types/results";

describe("Results payout semantics", () => {
  it("includes Bronze, Silver, Gold, and Insurance exactly once", () => {
    const totals = calculateResultPayouts({
      total_payout: 6250,
      bronze_payout: 900,
      silver_payout: 1050,
      gold_payout: 1650,
      insurance_pot_payout: 1250,
      big_bass_payout: 650,
    });

    expect(totals.totalPaidOutToAnglers).toBe(4850);
  });

  it("excludes standard tournament and Big Bass payouts from the public total", () => {
    const totals = calculateResultPayouts({
      total_payout: 9000,
      big_bass_payout: 1200,
    });

    expect(totals.standardTournament).toBe(9000);
    expect(totals.bigBass).toBe(1200);
    expect(totals.totalPaidOutToAnglers).toBe(0);
  });

  it("uses published Insurance winner awards instead of a legacy summary value", () => {
    const totals = calculateResultPayouts(
      {
        total_payout: 900,
        bronze_payout: 200,
        silver_payout: 100,
        gold_payout: 200,
        insurance_pot_payout: 120,
        big_bass_payout: 250,
      },
      {
        id: "insurance-1",
        tournament_id: "tournament-1",
        entry_count: 6,
        total_pot_cents: 12000,
        places_paid: 1,
        calculated_payouts: [12000],
        winners: [{ entryName: "Lena Porter", finishingPosition: 6, amountCents: 12000 }],
        published: true,
        published_at: "2026-08-25T00:00:00Z",
        created_at: "2026-08-25T00:00:00Z",
        updated_at: "2026-08-25T00:00:00Z",
      },
    );

    expect(totals.insurance).toBe(120);
    expect(totals.totalPaidOutToAnglers).toBe(620);
  });

  it("treats missing and malformed optional payout fields as zero", () => {
    const totals = calculateResultPayouts({
      bronze_payout: undefined,
      silver_payout: null,
      gold_payout: Number.NaN,
      insurance_pot_payout: -10,
    });

    expect(totals.totalPaidOutToAnglers).toBe(0);
  });

  it("normalizes team names and does not double count payouts", () => {
    const entries: ResultEntry[] = [
      {
        kind: "final",
        place: 1,
        team: "Smith / Jones",
        weight: 20,
        baseWinnings: 2500,
      },
      {
        kind: "sidePot",
        place: 1,
        team: "  SMITH   / JONES ",
        weight: 20,
        sidePot: "gold",
        sidePotPayout: 900,
      },
    ];

    expect(
      getTeamPayouts(entries, "smith / jones", "Smith / Jones", 650),
    ).toEqual({
      standardTournament: 2500,
      bronze: 0,
      silver: 0,
      gold: 900,
      bigBass: 650,
      totalWon: 4050,
    });
  });

  it("matches each published Insurance winner to only its standings row", () => {
    const result = {
      id: "insurance-1",
      tournament_id: "tournament-1",
      entry_count: 10,
      total_pot_cents: 24000,
      places_paid: 2,
      calculated_payouts: [12000, 12000],
      winners: [
        { entryName: "Lena Porter", finishingPosition: 6, amountCents: 12000 },
        { entryName: "Team Two", finishingPosition: 8, amountCents: 12000 },
      ],
      published: true,
      published_at: "2026-08-25T00:00:00Z",
      created_at: "2026-08-25T00:00:00Z",
      updated_at: "2026-08-25T00:00:00Z",
    };

    expect(
      getInsurancePotWinnersForEntry(
        { kind: "final", place: 6, team: " lena   porter ", weight: 17.54 },
        result,
      ),
    ).toHaveLength(1);
    expect(
      getInsurancePotWinnersForEntry(
        { kind: "final", place: 7, team: "Other Team", weight: 16 },
        result,
      ),
    ).toEqual([]);
    expect(
      getInsurancePotWinnersForEntry(
        { kind: "final", place: 8, team: "Team Two", weight: 15 },
        result,
      ),
    ).toHaveLength(1);
  });

  it("paginates standings in 25-place slices without changing places", () => {
    const entries = Array.from({ length: 61 }, (_, index) => ({
      kind: "final" as const,
      place: index + 1,
      team: `Team ${index + 1}`,
      weight: 61 - index,
    }));

    expect(paginateResultEntries(entries, 1).entries.map((entry) => entry.place)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
    expect(paginateResultEntries(entries, 2).entries.map((entry) => entry.place)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 26),
    );
    expect(paginateResultEntries(entries, 3).entries.map((entry) => entry.place)).toEqual(
      Array.from({ length: 11 }, (_, index) => index + 51),
    );
    expect(paginateResultEntries(entries, 99)).toMatchObject({ page: 3, totalPages: 3 });
    expect(paginateResultEntries(entries.slice(0, 25), 1)).toMatchObject({ totalPages: 1 });
  });
});
