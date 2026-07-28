import { describe, expect, it } from "vitest";

import {
  calculateResultPayouts,
  getTeamPayouts,
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

  it("excludes the standard tournament and Big Bass payouts", () => {
    const totals = calculateResultPayouts({
      total_payout: 9000,
      big_bass_payout: 1200,
    });

    expect(totals.standardTournament).toBe(9000);
    expect(totals.bigBass).toBe(1200);
    expect(totals.totalPaidOutToAnglers).toBe(0);
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
});
