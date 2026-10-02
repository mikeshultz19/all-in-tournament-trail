import { describe, expect, it } from "vitest";

import { launchFlightLabel } from "@/lib/launch-order";

describe("launch order flight labels", () => {
  it.each([
    [1, "Flight 1"],
    [25, "Flight 1"],
    [26, "Flight 2"],
    [50, "Flight 2"],
    [51, "Flight 3"],
    [75, "Flight 3"],
    [76, "Flight 4"],
    [200, "Flight 8"],
  ])("labels boat %s as %s", (boatNumber, expected) => {
    expect(launchFlightLabel(boatNumber)).toBe(expected);
  });
});
