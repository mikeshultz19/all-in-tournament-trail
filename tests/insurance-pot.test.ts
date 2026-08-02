import { describe, expect, it } from "vitest";
import {
  getInsurancePotPlaces,
  expectedInsurancePotCents,
  selectInsurancePotWinners,
  splitInsurancePotCents,
  validateInsurancePotResult,
} from "@/lib/insurance-pot";

describe("Insurance Pot calculations", () => {
  it.each([[0, 0], [1, 1], [4, 1], [9, 1], [10, 2], [14, 2], [15, 3], [20, 4], [25, 5]])(
    "%i entries pay %i places", (entries, places) => {
      expect(getInsurancePotPlaces(entries)).toBe(places);
    },
  );

  it("splits equally and assigns cent remainders deterministically", () => {
    expect(splitInsurancePotCents(20_00, 2)).toEqual([1000, 1000]);
    expect(splitInsurancePotCents(10_00, 3)).toEqual([334, 333, 333]);
    expect(splitInsurancePotCents(10_00, 3).reduce((sum, value) => sum + value, 0)).toBe(1000);
  });

  it("validates the expected pot at $20 per eligible entry", () => {
    expect(expectedInsurancePotCents(0)).toBe(0);
    expect(expectedInsurancePotCents(14)).toBe(28000);
  });

  it("skips nonparticipants and regular-payout recipients", () => {
    expect(selectInsurancePotWinners([
      { entryId: "a", entryName: "Paid", finishingPosition: 4, enteredInsurancePot: true, receivedTournamentEntryPayout: true },
      { entryId: "b", entryName: "Skipped", finishingPosition: 5, enteredInsurancePot: false, receivedTournamentEntryPayout: false },
      { entryId: "c", entryName: "Winner", finishingPosition: 6, enteredInsurancePot: true, receivedTournamentEntryPayout: false },
    ], 1)[0]?.entryName).toBe("Winner");
  });

  it("blocks missing, duplicate, and incorrectly assigned winners", () => {
    const base = { entryCount: 10, totalPotCents: 20000, placesPaid: 2, published: false };
    expect(validateInsurancePotResult({ ...base, winners: [] })).not.toHaveLength(0);
    expect(validateInsurancePotResult({ ...base, winners: [
      { entryName: "Same", amountCents: 10000 }, { entryName: "same", amountCents: 10000 },
    ] }).join(" ")).toMatch(/duplicate/i);
    expect(validateInsurancePotResult({ ...base, winners: [
      { entryName: "One", amountCents: 10000 }, { entryName: "Two", amountCents: 9999 },
    ] }).join(" ")).toMatch(/equal the total/i);
  });
});
