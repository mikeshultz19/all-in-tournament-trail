import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/tournaments", async () => {
  const { tournaments } = await import("@/data/tournaments");
  const { databaseTournament } = await import("@/tests/tournament-db-fixture");
  const regularSeason = tournaments
    .filter((tournament) => tournament.eventType === "regular_season")
    .map((tournament) => ({
      ...databaseTournament,
      id: `${tournament.slug}-id`,
      slug: tournament.slug,
      name: tournament.name,
      lake: tournament.lake,
      tournament_date: `${tournament.date}T06:00:00-06:00`,
      tournament_end_date: null,
      ramp: tournament.venue,
      launch_type: "Trailering",
      morning_registration: "05:00",
      registration_information: tournament.registrationInformation ?? null,
      practice_information: tournament.practiceInformation ?? null,
      status: "Registration Open",
      description: tournament.description,
      hero_image_url: tournament.heroImage,
      is_featured: tournament.featured,
      show_on_homepage: true,
      event_type: "regular_season" as const,
      regular_season_number: tournament.regularSeasonNumber,
    }));

  return {
    getActiveSeasonSchedule: vi.fn(async () => regularSeason),
  };
});

import SchedulePage from "@/app/schedule/page";

describe("Bass Stack schedule badges", () => {
  it("renders the Bass Stack badge and about copy only for the approved events", async () => {
    const html = renderToStaticMarkup(await SchedulePage());

    expect((html.match(/BASS STACK/g) ?? []).length).toBe(2);
    expect(html).toContain("This event is an AITT Bass Stack Challenge.");
    expect(html).not.toContain("AITT Bass Stack Challenge event");
    expect(html).toContain("Squaw Creek");
    expect(html).toContain("Lewisville");
  });
});
