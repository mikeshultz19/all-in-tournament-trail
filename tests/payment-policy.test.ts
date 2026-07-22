import { describe, expect, it } from "vitest";

import {
  calculateCardProcessingFeeCents,
  calculateCardTotalCents,
  formatCurrencyFromCents,
} from "@/config/payment-policy";

describe("card-processing fee policy", () => {
  it.each([
    [0, 0],
    [2_000, 60],
    [6_000, 180],
    [16_000, 480],
  ])("calculates 3 percent for %i cents", (subtotalCents, expectedFeeCents) => {
    expect(calculateCardProcessingFeeCents(subtotalCents)).toBe(expectedFeeCents);
  });

  it("rounds half-cent results to the nearest cent, with halves upward", () => {
    expect(calculateCardProcessingFeeCents(50)).toBe(2);
    expect(calculateCardProcessingFeeCents(49)).toBe(1);
  });

  it("rejects negative and non-integer amounts", () => {
    expect(() => calculateCardProcessingFeeCents(-1)).toThrow(RangeError);
    expect(() => calculateCardProcessingFeeCents(100.5)).toThrow(RangeError);
  });

  it("adds the fee to the integer-cent subtotal", () => {
    expect(calculateCardTotalCents(6_000)).toBe(6_180);
    expect(formatCurrencyFromCents(6_180)).toBe("$61.80");
  });
});
