import { describe, expect, it } from "vitest";

import { tournaments, type Tournament } from "@/data/tournaments";
import { getSafeLight } from "@/lib/safe-light";
import {
  getNextRelevantTournament,
  getRegistrationAvailability,
  TOURNAMENT_STATUS_LABELS,
} from "@/lib/tournament-operations";
import { tournamentDateTimeToUtc } from "@/lib/tournament-time";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

function tournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    ...tournaments[0],
    date: "2026-11-01",
    registrationStatus: "open",
    tournamentStatus: "scheduled",
    rescheduledDate: null,
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: "06:30",
    ...overrides,
  };
}

describe("estimated safe light", () => {
  it("is calculated sunrise minus 30 minutes", () => {
    const result = getSafeLight("2026-11-01");
    expect(result.officialSunrise.getTime() - result.calculatedSafeLight.getTime()).toBe(30 * 60 * 1000);
    expect(result.safeLight.getTime()).toBe(result.calculatedSafeLight.getTime());
  });

  it("uses Central Standard Time for a winter date", () => {
    const standardTime = tournamentDateTimeToUtc("2026-01-15", "12:00");
    expect(standardTime.getUTCHours()).toBe(18);
  });

  it("uses Central Daylight Time for a summer date", () => {
    const daylightTime = tournamentDateTimeToUtc("2026-07-15", "12:00");
    expect(daylightTime.getUTCHours()).toBe(17);
  });

  it("gives a valid manual override precedence", () => {
    const overridden = getSafeLight("2026-11-01", "07:15", "Fog delay");
    expect(overridden.isOverridden).toBe(true);
    expect(overridden.safeLight.toISOString()).toBe(tournamentDateTimeToUtc("2026-11-01", "07:15").toISOString());
  });

  it("retains calculated sunrise and safe light during an override", () => {
    const baseline = getSafeLight("2026-11-01");
    const overridden = getSafeLight("2026-11-01", "07:15", "Fog delay");
    expect(overridden.calculatedSafeLight.toISOString()).toBe(baseline.calculatedSafeLight.toISOString());
    expect(overridden.officialSunrise.toISOString()).toBe(baseline.officialSunrise.toISOString());
  });
});

describe("tournament status and registration", () => {
  it("maps every machine status to its public label", () => {
    expect(TOURNAMENT_STATUS_LABELS).toEqual({
      scheduled: "Scheduled",
      weather_watch: "Weather Watch",
      delayed: "Delayed",
      postponed: "Postponed",
      cancelled: "Cancelled",
      rescheduled: "Rescheduled",
    });
  });

  it.each(["cancelled", "postponed"] as const)("disables submission for %s tournaments", (tournamentStatus) => {
    const availability = getRegistrationAvailability(tournament({ tournamentStatus }), new Date("2026-07-21T12:00:00Z"));
    expect(availability.canSubmit).toBe(false);
  });

  it.each(["scheduled", "weather_watch"] as const)("preserves normal registration windows for %s tournaments", (tournamentStatus) => {
    const availability = getRegistrationAvailability(tournament({ tournamentStatus }), new Date("2026-07-21T12:00:00Z"));
    expect(availability.period).toBe("early_online");
    expect(availability.canSubmit).toBe(true);
  });

  it("closes website registration after the early deadline and directs morning registration to WeighFish", () => {
    const availability = getRegistrationAvailability(
      tournament(),
      new Date("2026-11-01T11:30:00Z"),
    );
    expect(availability.period).toBe("fully_closed");
    expect(availability.canSubmit).toBe(false);
    expect(availability.reason).toContain("completed in person");
    expect(availability.reason).toContain("WeighFish");
  });

  it("uses the rescheduled date for safe light and registration timing", () => {
    const rescheduled = tournament({ tournamentStatus: "rescheduled", rescheduledDate: "2027-03-14" });
    const operations = getTournamentOperationsViewModel(rescheduled, new Date("2027-03-12T12:00:00Z"));
    const availability = getRegistrationAvailability(rescheduled, new Date("2027-03-12T12:00:00Z"));
    expect(operations.effectiveDate).toBe("2027-03-14");
    expect(operations.safeLight.time).toBe(getTournamentOperationsViewModel(tournament({ date: "2027-03-14" }), new Date("2027-03-12T12:00:00Z")).safeLight.time);
    expect(availability.earlyRegistrationDeadline.toISOString()).toBe(tournamentDateTimeToUtc("2027-03-13", "21:00").toISOString());
  });

  it("returns no tournament for the Home empty state when none are upcoming", () => {
    const pastTournament = tournament({ date: "2025-01-01", featured: true });
    expect(getNextRelevantTournament([pastTournament], new Date("2026-07-21T12:00:00Z"))).toBeUndefined();
  });
});
