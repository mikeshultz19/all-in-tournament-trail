import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/tournaments", async () => {
  const { databaseTournament } = await import(
    "@/tests/tournament-db-fixture"
  );
  return {
    getTournaments: vi.fn(async () => [databaseTournament]),
  };
});

import SchedulePage from "@/app/schedule/page";
import FeaturedTournament from "@/components/FeaturedTournament";
import { tournaments } from "@/data/tournaments";
import { getTournamentDisplay } from "@/lib/tournament-display";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { databaseTournament } from "@/tests/tournament-db-fixture";

describe("shared tournament display data", () => {
  it("maps stored tournament fields for both public views", () => {
    const tournament = {
      ...tournaments[0],
      date: "2026-11-01",
      venue: "Test Ramp",
      city: "Test City",
      state: "Texas",
      startTimeDisplay: "Safe Light",
      stopFishingTime: "15:00",
      launchType: "NUMBERED_START" as const,
      tournamentMorningRegistrationOpensAt: "05:00",
    };

    expect(getTournamentDisplay(tournament)).toMatchObject({
      date: "Nov 1, 2026",
      dayOfWeek: "Sunday",
      ramp: "Test Ramp",
      location: "Test City, Texas",
      hours: "Safe Light – 3:00 PM",
      stopFishing: "Stop Fishing: 3:00 PM",
      launchType: "Numbered Start",
      morningRegistration: "5:00 AM",
    });

    const homepage = renderToStaticMarkup(<FeaturedTournament tournament={tournament} />);
    for (const value of ["Test Ramp", "Test City, Texas", "Safe Light – 3:00 PM", "Stop Fishing: 3:00 PM", "Numbered Start"]) {
      expect(homepage).toContain(value);
    }
    expect(homepage).toContain("Morning Registration");
    expect(homepage).toContain("5:00 AM");
  });

  it("renders schedule values from the same tournament source", async () => {
    const schedule = renderToStaticMarkup(await SchedulePage());
    const display = getTournamentDisplay(
      toPublicTournament(databaseTournament),
    );

    for (const value of [display.date, display.ramp, display.location, display.hours, display.stopFishing, display.launchType]) {
      expect(schedule).toContain(value);
    }
    expect(schedule).toContain("Morning Registration");
    expect(schedule).toContain(display.morningRegistration);
  });
});
