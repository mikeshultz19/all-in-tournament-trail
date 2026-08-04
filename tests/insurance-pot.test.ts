import { describe, expect, it } from "vitest";
import {
  getInsurancePotPlaces,
  INSURANCE_POT_ENTRY_FEE_CENTS,
  isInsurancePotWinnerDraftComplete,
  expectedInsurancePotCents,
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
    expect(INSURANCE_POT_ENTRY_FEE_CENTS).toBe(2000);
    expect(expectedInsurancePotCents(0)).toBe(0);
    expect(expectedInsurancePotCents(1)).toBe(2000);
    expect(expectedInsurancePotCents(5)).toBe(10000);
    expect(expectedInsurancePotCents(20)).toBe(40000);
    expect(expectedInsurancePotCents(21)).toBe(42000);
    expect(getInsurancePotPlaces(21)).toBe(4);
    expect(splitInsurancePotCents(expectedInsurancePotCents(21), getInsurancePotPlaces(21))).toEqual([10500, 10500, 10500, 10500]);
    expect(expectedInsurancePotCents(37)).toBe(74000);
  });

  it("requires every saved winner and accepts an explicitly saved zero-entry pot", () => {
    expect(isInsurancePotWinnerDraftComplete({ entryCount: 0, totalPotCents: 0, placesPaid: 0, winners: [], published: false })).toBe(true);
    expect(isInsurancePotWinnerDraftComplete({ entryCount: 10, totalPotCents: 20000, placesPaid: 2, winners: [{ entryName: "Smith / Jones", finishingPosition: 8, amountCents: 10000 }], published: false })).toBe(false);
    expect(isInsurancePotWinnerDraftComplete({ entryCount: 10, totalPotCents: 20000, placesPaid: 2, winners: [{ entryName: "Smith / Jones", finishingPosition: 8, amountCents: 10000 }, { entryName: "Brown / Davis", finishingPosition: 10, amountCents: 10000 }], published: false })).toBe(true);
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

  it("rejects a winner without a team name", () => {
    const errors = validateInsurancePotResult({ entryCount: 1, totalPotCents: 2000, placesPaid: 1, published: false, winners: [{ entryName: "", finishingPosition: 4, amountCents: 2000 }] });
    expect(errors.join(" ")).toMatch(/entry name/i);
  });
});
