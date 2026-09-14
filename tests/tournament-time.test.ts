import { describe, expect, it } from "vitest";

import {
  isValidTournamentTime,
  tournamentDateTimeToUtc,
} from "@/lib/tournament-time";

describe("tournament time validation", () => {
  it.each(["00:00", "05:00", "12:00", "23:59"])(
    "accepts canonical time %s",
    (input) => {
      expect(isValidTournamentTime(input)).toBe(true);
    },
  );

  it.each(["", "tomorrow", "5am", "5:00", "5:00am", "5:00 AM", "25:00", "12:60"])(
    "rejects noncanonical or invalid input %s",
    (input) => {
      expect(isValidTournamentTime(input)).toBe(false);
    },
  );

  it("requires callers to trim before validating", () => {
    expect(isValidTournamentTime(" 05:00 ")).toBe(false);
  });

  it("keeps the date/time parser strict", () => {
    expect(tournamentDateTimeToUtc("2026-11-01", "05:00")).toBeInstanceOf(Date);
    expect(() => tournamentDateTimeToUtc("2026-11-01", "5:00am")).toThrow(
      "Invalid tournament time: 5:00am",
    );
  });
});
