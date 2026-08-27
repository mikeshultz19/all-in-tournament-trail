import { describe, expect, it } from "vitest";

import {
  calculateCardProcessingFeeCents,
  calculateCardTotalCents,
  formatCurrencyFromCents,
} from "@/config/payment-policy";

describe("card-processing fee policy", () => {
  it.each([
    [0, 0],
    [2_000, 90],
    [6_000, 210],
    [16_000, 510],
  ])("calculates the centralized card service fee for %i cents", (subtotalCents, expectedFeeCents) => {
    expect(calculateCardProcessingFeeCents(subtotalCents)).toBe(expectedFeeCents);
  });

  it("rounds half-cent results to the nearest cent, with halves upward", () => {
    expect(calculateCardProcessingFeeCents(50)).toBe(32);
    expect(calculateCardProcessingFeeCents(49)).toBe(31);
  });

  it("rejects negative and non-integer amounts", () => {
    expect(() => calculateCardProcessingFeeCents(-1)).toThrow(RangeError);
    expect(() => calculateCardProcessingFeeCents(100.5)).toThrow(RangeError);
  });

  it("adds the fee to the integer-cent subtotal", () => {
    expect(calculateCardTotalCents(6_000)).toBe(6_210);
    expect(formatCurrencyFromCents(6_210)).toBe("$62.10");
  });

  it.each([
    [10_000, 330, 10_330],
    [24_000, 750, 24_750],
    [30_000, 930, 30_930],
    [70_000, 2_130, 72_130],
  ])("applies 3 percent plus the fixed transaction component", (subtotalCents, feeCents, totalCents) => {
    expect(calculateCardProcessingFeeCents(subtotalCents)).toBe(feeCents);
    expect(calculateCardTotalCents(subtotalCents)).toBe(totalCents);
  });
});
