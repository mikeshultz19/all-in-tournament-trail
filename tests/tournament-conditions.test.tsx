import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";
import FeaturedTournament from "@/components/FeaturedTournament";
import TournamentConditions from "@/components/TournamentConditions";
import { tournaments } from "@/data/tournaments";
import {
  getAccuWeatherTournamentForecast,
  isTournamentWithinForecastHorizon,
  normalizeAccuWeatherDailyForecast,
} from "@/lib/accuweather";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";
import type { TournamentWeatherForecast } from "@/lib/tournament-weather";

const tournament = tournaments[0];
const operations = getTournamentOperationsViewModel(
  tournament,
  new Date("2026-10-30T12:00:00.000Z"),
);
const forecast: TournamentWeatherForecast = {
  conditionText: "Partly cloudy",
  weatherIcon: 3,
  temperatureF: 82,
  highF: 82,
  lowF: 64,
  windDirection: "S",
  windSpeedMph: 8,
  windGustMph: 14,
  precipitationProbability: 10,
  observedOrForecastAt: "2026-11-01T07:00:00-06:00",
  fetchedAt: "2026-07-22T00:05:00.000Z",
  source: "AccuWeather",
};

const rawForecast = {
  DailyForecasts: [
    {
      Date: "2026-11-01T07:00:00-06:00",
      Temperature: {
        Minimum: { Value: 64, Unit: "F" },
        Maximum: { Value: 82, Unit: "F" },
      },
      Day: {
        Icon: 3,
        IconPhrase: "Partly cloudy",
        PrecipitationProbability: 10,
        Wind: {
          Direction: { English: "S" },
          Speed: { Value: 8, Unit: "mi/h" },
        },
        WindGust: { Speed: { Value: 14, Unit: "mi/h" } },
      },
    },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.ACCUWEATHER_API_KEY;
});

describe("Tournament Conditions", () => {
  it("combines Tournament Status and unchanged Safe Light in the compact panel", () => {
    const html = renderToStaticMarkup(
      <TournamentConditions tournament={tournament} safeLight={operations.safeLight} weather={{ status: "pending" }} />,
    );
    expect(html).toContain("Tournament Conditions");
    expect(html).toContain("Scheduled");
    expect(html).toContain("Safe Light");
    expect(html).toContain(operations.safeLight.time);
    expect(html).toContain('data-icon-src="/icons/sun-safe-light.svg"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Tournament forecast will be available closer to the event.");
    expect(html).toContain("sm:grid-cols-");
  });

  it("renders normalized forecast fields, Central update time, and linked attribution", () => {
    const html = renderToStaticMarkup(
      <TournamentConditions tournament={tournament} safeLight={operations.safeLight} weather={{ status: "available", forecast }} />,
    );
    expect(html).toContain("Partly cloudy");
    expect(html).toContain("82°F");
    expect(html).toContain("Wind S 8 mph");
    expect(html).toContain("Gusts 14 mph");
    expect(html).toContain("Rain 10%");
    expect(html).toContain("Jul 21, 2026, 7:05 PM CDT");
    expect(html).toContain("Weather data by AccuWeather");
    expect(html).toContain('href="https://www.accuweather.com"');
    expect(html).not.toContain("accuweather-logo.svg");
  });

  it("omits gusts cleanly when they are unavailable", () => {
    const html = renderToStaticMarkup(
      <TournamentConditions tournament={tournament} safeLight={operations.safeLight} weather={{ status: "available", forecast: { ...forecast, windGustMph: null } }} />,
    );
    expect(html).not.toContain("Gusts");
    expect(html).toContain("Wind S 8 mph");
  });

  it("does not let weather alter the configured Tournament Status", () => {
    const delayed = { ...tournament, tournamentStatus: "delayed" as const };
    const html = renderToStaticMarkup(
      <TournamentConditions tournament={delayed} safeLight={operations.safeLight} weather={{ status: "available", forecast: { ...forecast, conditionText: "Sunny" } }} />,
    );
    expect(html).toContain("Delayed");
    expect(html).toContain("Sunny");
    expect(delayed.tournamentStatus).toBe("delayed");
  });

  it("renders the restored homepage hierarchy without the detailed entry summary", async () => {
    const html = renderToStaticMarkup(await HomePage());
    expect(html).toContain("Featured Tournament");
    expect(html).toContain("Latest News &amp; Announcements");
    expect(html).toContain(tournament.statusMessage);
    expect(html).toContain("Tournament Conditions");
    expect(html).toContain("Tournament forecast will be available closer to the event.");
    expect(html).toContain("View Tournament Entries");
    expect(html).toContain("Eagle Mountain");
    expect(html).toContain("Twin Points Park");
    expect(html).not.toContain("4 Tournament Entries");
    expect(html).not.toContain("3 Team Entries");
    expect(html).not.toContain("1 Solo Entry");
    expect(html).not.toContain('id="entry-summary-heading"');
    for (const metric of ["Big Bass", "Bronze", "Silver", "Gold", "Insurance Pot"]) {
      expect(html).not.toContain(`<dt class="text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">${metric}</dt>`);
    }
    expect(html).toContain("Registration closes");
    expect(html).toContain('href="/register?tournament=eagle-mountain-2026"');
    expect(html).toContain("Tournament Information");
    expect(html).toContain("Safe Light – 3:00 PM");
    expect(html).toContain("Stop Fishing: 3:00 PM");
    expect(html).toContain("Trailering");
    expect(html).toContain("Azle, Texas");
    expect(html).toContain("w-full bg-red-700");
    expect(html).not.toContain("Event Info");
    expect(html).not.toContain("Tournament Details");
    const featuredSource = readFileSync("components/FeaturedTournament.tsx", "utf8");
    expect(featuredSource).not.toContain("Tournament resources");
    expect(featuredSource).not.toContain('href="/how-it-works"');
    expect(featuredSource).not.toContain('href="/results"');
    expect(html).not.toContain("private4@example.com");
    expect(html).not.toContain("private-payment-004");
    expect(html).toContain("overflow-x-hidden");
  });

  it("places the shared tournament grid directly before Latest News", async () => {
    const html = renderToStaticMarkup(await HomePage());
    const heroIndex = html.indexOf('alt="All In Tournament Trail"');
    const gridIndex = html.indexOf('data-homepage-tournament-grid="true"');
    const featuredIndex = html.indexOf("Featured Tournament");
    const conditionsIndex = html.indexOf("Tournament Conditions");
    const newsIndex = html.indexOf('data-homepage-news="true"');

    expect(heroIndex).toBeGreaterThan(-1);
    expect(gridIndex).toBeGreaterThan(heroIndex);
    expect(featuredIndex).toBeGreaterThan(gridIndex);
    expect(conditionsIndex).toBeGreaterThan(gridIndex);
    expect(newsIndex).toBeGreaterThan(featuredIndex);
    expect(newsIndex).toBeGreaterThan(conditionsIndex);
    expect(html.slice(gridIndex, newsIndex)).toContain('data-tournament-column="left"');
    expect(html.slice(gridIndex, newsIndex)).toContain('data-tournament-column="right"');
  });

  it("renders Payment Update once inside Latest News and nowhere in Header or Hero", async () => {
    const html = renderToStaticMarkup(await HomePage());
    const newsIndex = html.indexOf('data-homepage-news="true"');
    const paymentMatches = html.match(/Payment Update/g) ?? [];

    expect(paymentMatches).toHaveLength(1);
    expect(html.indexOf("Payment Update")).toBeGreaterThan(newsIndex);
    expect(readFileSync("components/Header.tsx", "utf8")).not.toContain("LatestTournamentNews");
    expect(readFileSync("components/Hero.tsx", "utf8")).not.toContain("LatestTournamentNews");
  });

  it("keeps all five admin-managed tournament information boxes", () => {
    const html = renderToStaticMarkup(<FeaturedTournament tournament={tournament} operations={operations} />);

    for (const label of ["Date", "Ramp", "Hours", "Launch Type", "Morning Registration"]) {
      expect(html).toContain(`>${label}</dt>`);
    }
    expect(html).toContain("Opens at");
    expect(html).toContain("5:00 AM");
  });

  it("does not use full-bleed layout utilities in homepage sections", () => {
    for (const file of ["app/page.tsx", "components/LatestTournamentNews.tsx", "components/SponsorHome.tsx"]) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/w-screen|100vw|min-w-\[100vw\]|full-bleed|-mx-|left-\[50%\]|-ml-\[50vw\]|max-w-none/);
    }
  });

  it("does not render an active registration action when registration is closed", () => {
    const closedTournament = { ...tournament, registrationStatus: "closed" as const };
    const closedOperations = getTournamentOperationsViewModel(closedTournament, new Date("2026-07-21T12:00:00Z"));
    const html = renderToStaticMarkup(<FeaturedTournament tournament={closedTournament} operations={closedOperations} />);
    expect(html).toContain("Registration Closed");
    expect(html).not.toContain('href="/register?tournament=eagle-mountain-2026"');
    expect(html).toContain('href="/registrations"');
  });
});

describe("AccuWeather provider service", () => {
  it("normalizes the raw provider payload into the application model", () => {
    expect(normalizeAccuWeatherDailyForecast(rawForecast, "2026-11-01", "2026-07-22T00:05:00.000Z")).toEqual(forecast);
  });

  it("keeps credentials server-side in an Authorization header", async () => {
    process.env.ACCUWEATHER_API_KEY = "test-secret";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(rawForecast), { status: 200 }),
    );
    const result = await getAccuWeatherTournamentForecast({
      tournamentDate: "2026-11-01",
      locationKey: "test-location",
      now: new Date("2026-10-30T12:00:00.000Z"),
    });
    expect(result.status).toBe("available");
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain("test-secret");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer test-secret");
    expect(init?.next).toEqual({ revalidate: 10800 });
    expect(readFileSync("components/TournamentConditions.tsx", "utf8")).not.toContain("ACCUWEATHER_API_KEY");
  });

  it("returns a graceful fallback when the API key is missing", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await expect(getAccuWeatherTournamentForecast({
      tournamentDate: "2026-11-01",
      locationKey: "test-location",
      now: new Date("2026-10-30T12:00:00.000Z"),
    })).resolves.toEqual({ status: "unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a graceful fallback for provider and invalid-response errors", async () => {
    process.env.ACCUWEATHER_API_KEY = "test-secret";
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    await expect(getAccuWeatherTournamentForecast({ tournamentDate: "2026-11-01", locationKey: "test", now: new Date("2026-10-30T12:00:00Z") })).resolves.toEqual({ status: "unavailable" });
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ unexpected: true }), { status: 200 }));
    await expect(getAccuWeatherTournamentForecast({ tournamentDate: "2026-11-01", locationKey: "test", now: new Date("2026-10-30T12:00:00Z") })).resolves.toEqual({ status: "unavailable" });
  });

  it("does not request unrelated current weather outside the forecast horizon", async () => {
    process.env.ACCUWEATHER_API_KEY = "test-secret";
    const fetchMock = vi.spyOn(globalThis, "fetch");
    expect(isTournamentWithinForecastHorizon("2026-11-01", new Date("2026-07-21T12:00:00Z"))).toBe(false);
    await expect(getAccuWeatherTournamentForecast({ tournamentDate: "2026-11-01", locationKey: "test", now: new Date("2026-07-21T12:00:00Z") })).resolves.toEqual({ status: "pending" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
