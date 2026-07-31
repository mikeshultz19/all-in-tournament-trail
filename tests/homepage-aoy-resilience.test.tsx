import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";

const aoyResult = vi.hoisted(() => ({
  value: {
    status: "unavailable" as const,
    standings: [],
  } as
    | { status: "unavailable"; standings: [] }
    | {
        status: "available";
        standings: Array<{
          place: number;
          angler: string;
          events: number;
          points: number;
        }>;
      },
}));

vi.mock("@/lib/aoy-standings", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/aoy-standings")>();
  return {
    ...actual,
    getHomepageAoyStandings: vi.fn(async () => aoyResult.value),
  };
});

vi.mock("@/lib/tournaments", async () => {
  const { databaseTournament } = await import(
    "@/tests/tournament-db-fixture"
  );
  return {
    getNextUpcomingTournament: vi.fn(async () => databaseTournament),
  };
});

vi.mock("@/lib/news", () => ({
  getPublishedAnnouncements: vi.fn(async () => []),
}));

vi.mock("@/lib/results", () => ({
  getLatestPublishedTournamentResults: vi.fn(async () => null),
}));

vi.mock("@/lib/tournament-registrations", () => ({
  getPublicEarlyEntriesForTournament: vi.fn(async () => []),
}));

vi.mock("@/lib/open-meteo", () => ({
  getOpenMeteoTournamentForecast: vi.fn(async () => ({
    status: "available",
    forecast: {
      days: [
        {
          date: "2026-07-30",
          condition: "clear",
          conditionText: "Clear",
          highF: 94,
          lowF: 75,
          precipitationProbability: 20,
          maxWindMph: 12,
          maxGustMph: 18,
          dominantWindDirectionDegrees: 180,
        },
        {
          date: "2026-07-31",
          condition: "mostly-clear",
          conditionText: "Mostly Clear",
          highF: 92,
          lowF: 73,
          precipitationProbability: 10,
          maxWindMph: 11,
          maxGustMph: 17,
          dominantWindDirectionDegrees: 190,
        },
        {
          date: "2026-08-01",
          condition: "partly-cloudy",
          conditionText: "Partly Cloudy",
          highF: 91,
          lowF: 72,
          precipitationProbability: 15,
          maxWindMph: 10,
          maxGustMph: 16,
          dominantWindDirectionDegrees: 200,
        },
        {
          date: "2026-08-02",
          condition: "overcast",
          conditionText: "Overcast",
          highF: 89,
          lowF: 71,
          precipitationProbability: 25,
          maxWindMph: 9,
          maxGustMph: 15,
          dominantWindDirectionDegrees: 210,
        },
        {
          date: "2026-08-03",
          condition: "rain-showers",
          conditionText: "Rain Showers",
          highF: 87,
          lowF: 70,
          precipitationProbability: 40,
          maxWindMph: 8,
          maxGustMph: 14,
          dominantWindDirectionDegrees: 220,
        },
      ],
      fetchedAt: "2026-07-30T12:00:00.000Z",
      source: "Open-Meteo",
    },
  })),
}));

describe("homepage AOY resilience", () => {
  beforeEach(() => {
    aoyResult.value = {
      status: "unavailable",
      standings: [],
    };
  });

  it("keeps the complete homepage and weather visible after an AOY access failure", async () => {
    const html = renderToStaticMarkup(await HomePage());
    const conditions = html.match(
      /<section[^>]+aria-labelledby="tournament-conditions-heading"[\s\S]*?<\/section>/,
    )?.[0];

    expect(html).toContain("Featured Tournament");
    expect(html).toContain("Latest News &amp; Announcements");
    expect(html).toContain("Tournament Conditions");
    expect(html).toContain("Safe Light");
    expect(html).toContain("Next 5 Days");
    expect(conditions?.match(/<li/g)).toHaveLength(5);
    expect(html).toContain("Weather data by Open-Meteo");
    expect(html).toContain("AOY standings are temporarily unavailable.");
  });

  it("shows five placeholder AOY positions when no standings are published yet", async () => {
    aoyResult.value = {
      status: "available",
      standings: [],
    };

    const html = renderToStaticMarkup(await HomePage());
    const aoySection = html.match(
      /<section[^>]+aria-labelledby="homepage-aoy-points-race"[\s\S]*?<\/section>/,
    )?.[0];
    const aoySectionText = aoySection ?? "";

    expect(aoySectionText).toContain("1ST");
    expect(aoySectionText).toContain("2ND");
    expect(aoySectionText).toContain("3RD");
    expect(aoySectionText).toContain("4TH");
    expect(aoySectionText).toContain("5TH");
    expect(aoySectionText.match(/Awaiting Results/g)).toHaveLength(5);
    expect(aoySectionText.indexOf("2ND")).toBeLessThan(
      aoySectionText.indexOf("1ST"),
    );
    expect(aoySectionText.indexOf("3RD")).toBeLessThan(
      aoySectionText.indexOf("1ST"),
    );
    expect(aoySectionText).not.toContain(
      "AOY standings are temporarily unavailable.",
    );
  });

  it("renders approved public standings when AOY data is available", async () => {
    aoyResult.value = {
      status: "available",
      standings: [
        {
          place: 1,
          angler: "Public Angler",
          events: 2,
          points: 390,
        },
      ],
    };

    const html = renderToStaticMarkup(await HomePage());
    const aoySection = html.match(
      /<section[^>]+aria-labelledby="homepage-aoy-points-race"[\s\S]*?<\/section>/,
    )?.[0];

    expect(aoySection).toContain("Public Angler");
    expect(aoySection).toContain("390 PTS");
    expect(aoySection).not.toContain(
      "AOY standings are temporarily unavailable.",
    );
    expect(aoySection).not.toMatch(
      /email|phone|payment|canonical_members/i,
    );
  });

  it("limits the migration to the narrow public AOY projection", () => {
    const migration = readFileSync(
      "supabase/migrations/202607300005_secure_public_aoy_standings.sql",
      "utf8",
    );

    expect(migration).toContain(
      "grant select on table public.current_aoy_standings to service_role",
    );
    expect(migration).toContain(
      "revoke all on table public.current_aoy_standings",
    );
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain(
      "create or replace function public.get_public_aoy_standings",
    );
    expect(migration).toContain("security definer");
    expect(migration).toContain(
      "to anon, authenticated, service_role",
    );
    expect(migration).not.toMatch(
      /email|phone|payment|canonical_members|tie_break_details|performance_ids/i,
    );
    expect(migration).not.toContain("disable row level security");
    expect(migration).not.toMatch(
      /grant select on table public\.(anglers|memberships|tournament_registrations|payments)/,
    );
  });
});
