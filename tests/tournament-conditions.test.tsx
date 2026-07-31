import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";
import FeaturedTournament from "@/components/FeaturedTournament";
import TournamentConditions from "@/components/TournamentConditions";
import { tournaments } from "@/data/tournaments";
import {
  buildOpenMeteoForecastUrl,
  getOpenMeteoTournamentForecast,
  mapOpenMeteoWeatherCode,
  normalizeOpenMeteoForecast,
} from "@/lib/open-meteo";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";
import type { TournamentWeatherForecast } from "@/lib/tournament-weather";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { databaseTournament } from "@/tests/tournament-db-fixture";

vi.mock("@/lib/tournaments", async () => {
  const { databaseTournament } = await import(
    "@/tests/tournament-db-fixture"
  );
  return {
    getNextUpcomingTournament: vi.fn(async () => databaseTournament),
    getFeaturedTournament: vi.fn(async () => databaseTournament),
  };
});

vi.mock("@/lib/aoy-standings", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/aoy-standings")>();
  return {
    ...actual,
    getHomepageAoyStandings: vi.fn(async () => ({
      status: "available",
      standings: [],
    })),
  };
});

const tournament = tournaments[0];
const operations = getTournamentOperationsViewModel(
  tournament,
  new Date("2026-10-30T12:00:00.000Z"),
);
const forecast: TournamentWeatherForecast = {
  days: [
    {
      date: "2026-10-30",
      condition: "clear",
      conditionText: "Clear",
      highF: 80,
      lowF: 61,
      precipitationProbability: 5,
      maxWindMph: 12,
      maxGustMph: 19,
      dominantWindDirectionDegrees: 180,
    },
    {
      date: "2026-10-31",
      condition: "mostly-clear",
      conditionText: "Mostly Clear",
      highF: 81,
      lowF: 63,
      precipitationProbability: 10,
      maxWindMph: 11,
      maxGustMph: 18,
      dominantWindDirectionDegrees: 190,
    },
    {
      date: "2026-11-01",
      condition: "partly-cloudy",
      conditionText: "Partly Cloudy",
      highF: 82,
      lowF: 64,
      precipitationProbability: 10,
      maxWindMph: 10,
      maxGustMph: 17,
      dominantWindDirectionDegrees: 200,
    },
    {
      date: "2026-11-02",
      condition: "overcast",
      conditionText: "Overcast",
      highF: 79,
      lowF: 62,
      precipitationProbability: 20,
      maxWindMph: 9,
      maxGustMph: 16,
      dominantWindDirectionDegrees: 210,
    },
    {
      date: "2026-11-03",
      condition: "rain-showers",
      conditionText: "Rain Showers",
      highF: 76,
      lowF: 60,
      precipitationProbability: null,
      maxWindMph: 8,
      maxGustMph: 15,
      dominantWindDirectionDegrees: 220,
    },
  ],
  fetchedAt: "2026-07-22T00:05:00.000Z",
  source: "Open-Meteo",
};

const rawForecast = {
  daily: {
    time: forecast.days.map((day) => day.date),
    weather_code: [0, 1, 2, 3, 80],
    temperature_2m_max: forecast.days.map((day) => day.highF),
    temperature_2m_min: forecast.days.map((day) => day.lowF),
    precipitation_probability_max: forecast.days.map(
      (day) => day.precipitationProbability,
    ),
    wind_speed_10m_max: forecast.days.map((day) => day.maxWindMph),
    wind_gusts_10m_max: forecast.days.map((day) => day.maxGustMph),
    wind_direction_10m_dominant: forecast.days.map(
      (day) => day.dominantWindDirectionDegrees,
    ),
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Tournament Conditions", () => {
  it("keeps Tournament Status and Safe Light visible when weather is unavailable", () => {
    const html = renderToStaticMarkup(
      <TournamentConditions
        tournament={tournament}
        safeLight={operations.safeLight}
        weather={{ status: "unavailable" }}
      />,
    );

    expect(html).toContain("Tournament Conditions");
    expect(html).toContain("Scheduled");
    expect(html).toContain("Safe Light");
    expect(html).toContain(operations.safeLight.time);
    expect(html).toContain(operations.safeLight.officialSunrise);
    expect(html).toContain('data-icon-src="/icons/sun-safe-light.svg"');
    expect(html).toContain("Forecast temporarily unavailable.");
  });

  it("explains when the tournament weather location is not configured", () => {
    const html = renderToStaticMarkup(
      <TournamentConditions
        tournament={tournament}
        safeLight={operations.safeLight}
        weather={{
          status: "unavailable",
          reason: "location-not-configured",
        }}
      />,
    );

    expect(html).toContain(
      "Forecast unavailable: tournament weather location is not configured.",
    );
    expect(html).toContain("Safe Light");
  });

  it("renders five compact chronological forecast days beginning today", () => {
    const html = renderToStaticMarkup(
      <TournamentConditions
        tournament={tournament}
        safeLight={operations.safeLight}
        weather={{ status: "available", forecast }}
      />,
    );

    expect(html).toContain("Next 5 Days");
    expect(html.match(/<li/g)).toHaveLength(5);
    expect(html).toContain('dateTime="2026-10-30"');
    expect(html).toContain('dateTime="2026-11-03"');
    expect(html.indexOf('dateTime="2026-10-30"')).toBeLessThan(
      html.indexOf('dateTime="2026-11-03"'),
    );
    expect(html).toContain(">Fri</time>");
    expect(html).toContain('title="Partly Cloudy"');
    expect(html).toContain("82°");
    expect(html).toContain("64°");
    expect(html).toContain("Rain 10%");
    expect(html).toContain("Weather data by Open-Meteo");
    expect(html).toContain('href="https://open-meteo.com/"');
  });

  it("omits missing rain data and renders fewer available days without placeholders", () => {
    const shorterForecast = { ...forecast, days: forecast.days.slice(3) };
    const html = renderToStaticMarkup(
      <TournamentConditions
        tournament={tournament}
        safeLight={operations.safeLight}
        weather={{ status: "available", forecast: shorterForecast }}
      />,
    );

    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).toContain("Rain 20%");
    expect(html).not.toContain("Rain null");
  });

  it("does not change the rolling forecast for a distant tournament", () => {
    const html = renderToStaticMarkup(
      <TournamentConditions
        tournament={{ ...tournament, date: "2026-12-01" }}
        safeLight={operations.safeLight}
        weather={{ status: "available", forecast }}
      />,
    );

    expect(html).toContain("Next 5 Days");
    expect(html).toContain('dateTime="2026-10-30"');
    expect(html).toContain('dateTime="2026-11-03"');
    expect(html).not.toContain("Tournament-day forecast");
    expect(html).not.toContain("Tournament Day");
  });

  it("does not let weather alter the configured Tournament Status", () => {
    const delayed = { ...tournament, tournamentStatus: "delayed" as const };
    const html = renderToStaticMarkup(
      <TournamentConditions
        tournament={delayed}
        safeLight={operations.safeLight}
        weather={{ status: "available", forecast }}
      />,
    );

    expect(html).toContain("Delayed");
    expect(html).toContain("Clear");
    expect(delayed.tournamentStatus).toBe("delayed");
  });

  it("preserves a Safe Light manual override", () => {
    const overriddenSafeLight = {
      ...operations.safeLight,
      time: "6:30 AM",
      isOverridden: true,
      publicOverrideReason: "Launch adjusted by officials.",
    };
    const html = renderToStaticMarkup(
      <TournamentConditions
        tournament={tournament}
        safeLight={overriddenSafeLight}
        weather={{ status: "available", forecast }}
      />,
    );

    expect(html).toContain("6:30 AM");
    expect(html).toContain("Adjusted by Tournament Officials");
    expect(html).toContain("Launch adjusted by officials.");
  });

  it("supports one desktop row and confines mobile overflow to the forecast", () => {
    const source = readFileSync("components/TournamentConditions.tsx", "utf8");

    expect(source).toContain("data-conditions-row");
    expect(source).toContain(
      "md:grid-cols-[minmax(170px,0.34fr)_minmax(0,1fr)]",
    );
    expect(source).toContain("max-w-full");
    expect(source).toContain("overflow-x-auto");
    expect(source).toContain("grid-cols-5");
    expect(source).not.toMatch(
      /w-screen|100vw|min-w-\[100vw\]|full-bleed|-mx-|left-\[50%\]|-ml-\[50vw\]|max-w-none/,
    );
  });

  it("keeps the homepage rendering when provider configuration is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Provider unavailable"),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain("Featured Tournament");
    expect(html).toContain("Latest News &amp; Announcements");
    expect(html).toContain("Tournament Conditions");
    expect(html).toContain("Safe Light");
    expect(html).toContain("Forecast temporarily unavailable.");
    expect(html).toContain("overflow-x-hidden");
  });

  it("keeps all five admin-managed tournament information boxes", () => {
    const html = renderToStaticMarkup(
      <FeaturedTournament tournament={tournament} operations={operations} />,
    );
    for (const label of [
      "Date",
      "Ramp",
      "Hours",
      "Launch Type",
      "Morning Registration",
    ]) {
      expect(html).toContain(`>${label}</dt>`);
    }
    expect(html).toContain("5:00 AM");
  });
});

describe("Open-Meteo provider service", () => {
  it("normalizes the next five available calendar days beginning today", () => {
    const normalized = normalizeOpenMeteoForecast(
      rawForecast,
      "2026-10-30",
      "2026-07-22T00:05:00.000Z",
    );

    expect(normalized).toEqual(forecast);
    expect(normalized?.days.map((day) => day.date)).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
    ]);
  });

  it("filters past days and does not select relative to the tournament date", () => {
    const payload = {
      daily: Object.fromEntries(
        Object.entries(rawForecast.daily).map(([key, values]) => [
          key,
          key === "time"
            ? ["2026-10-29", ...values]
            : [values[0], ...values],
        ]),
      ),
    };
    const normalized = normalizeOpenMeteoForecast(
      payload,
      "2026-10-30",
      "2026-07-22T00:05:00.000Z",
    );

    expect(normalized?.days).toHaveLength(5);
    expect(normalized?.days[0].date).toBe("2026-10-30");
    expect(normalized?.days.at(-1)?.date).toBe("2026-11-03");
  });

  it("uses coordinates, requested units, timezone, daily fields, and caching without an API key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(rawForecast), { status: 200 }),
    );
    const result = await getOpenMeteoTournamentForecast({
      latitude: 32.87562,
      longitude: -97.49323,
      now: new Date("2026-10-30T12:00:00.000Z"),
    });

    expect(result.status).toBe("available");
    if (result.status === "available") {
      expect(result.forecast.days[0].date).toBe("2026-10-30");
      expect(result.forecast.days.at(-1)?.date).toBe("2026-11-03");
    }
    const [url, init] = fetchMock.mock.calls[0];
    const requestUrl = new URL(String(url));
    expect(requestUrl.origin + requestUrl.pathname).toBe(
      "https://api.open-meteo.com/v1/forecast",
    );
    expect(requestUrl.searchParams.get("latitude")).toBe("32.87562");
    expect(requestUrl.searchParams.get("longitude")).toBe("-97.49323");
    expect(requestUrl.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(requestUrl.searchParams.get("wind_speed_unit")).toBe("mph");
    expect(requestUrl.searchParams.get("timezone")).toBe("America/Chicago");
    expect(requestUrl.searchParams.get("forecast_days")).toBe("5");
    for (const field of [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "wind_direction_10m_dominant",
    ]) {
      expect(requestUrl.searchParams.get("daily")).toContain(field);
    }
    expect(requestUrl.searchParams.has("apikey")).toBe(false);
    expect(init?.next).toEqual({ revalidate: 10800 });
    expect(
      readFileSync("components/TournamentConditions.tsx", "utf8"),
    ).not.toContain("OPEN_METEO_API_KEY");
  });

  it("returns a typed graceful fallback when coordinates are missing", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      getOpenMeteoTournamentForecast({
        latitude: null,
        longitude: null,
      }),
    ).resolves.toEqual({
      status: "unavailable",
      reason: "location-not-configured",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retries a temporary 503 and returns weather when the next attempt succeeds", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(rawForecast), { status: 200 }),
      );

    await expect(
      getOpenMeteoTournamentForecast({
        latitude: 32.87562,
        longitude: -97.49323,
        now: new Date("2026-10-30T12:00:00Z"),
      }),
    ).resolves.toMatchObject({
      status: "available",
      forecast: {
        source: "Open-Meteo",
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns unavailable after repeated 503 responses without throwing or logging an error", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));

    await expect(
      getOpenMeteoTournamentForecast({
        latitude: 32.87562,
        longitude: -97.49323,
        now: new Date("2026-10-30T12:00:00Z"),
      }),
    ).resolves.toEqual({ status: "unavailable", reason: "provider-error" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("keeps the homepage rendering when Open-Meteo repeatedly returns 503", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));

    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain("Featured Tournament");
    expect(html).toContain("Tournament Conditions");
    expect(html).toContain("Forecast temporarily unavailable.");
    expect(html).toContain("Safe Light");
    expect(html).toContain("Next 5 Days");
    expect(html).toContain("overflow-x-hidden");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("still reports malformed provider data as unavailable", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ unexpected: true }), { status: 200 }),
    );

    await expect(
      getOpenMeteoTournamentForecast({
        latitude: 32.87562,
        longitude: -97.49323,
        now: new Date("2026-10-30T12:00:00Z"),
      }),
    ).resolves.toEqual({ status: "unavailable", reason: "provider-error" });
    expect(errorSpy).toHaveBeenCalled();
  });

  it("keeps usable days when optional parallel arrays are incomplete", () => {
    const normalized = normalizeOpenMeteoForecast(
      {
        daily: {
          ...rawForecast.daily,
          precipitation_probability_max: [5],
          wind_gusts_10m_max: [19, null, 17],
        },
      },
      "2026-10-30",
      "2026-07-22T00:05:00.000Z",
    );

    expect(normalized?.days).toHaveLength(5);
    expect(normalized?.days[0].precipitationProbability).toBe(5);
    expect(normalized?.days[1].precipitationProbability).toBeNull();
    expect(normalized?.days[1].maxGustMph).toBeNull();
  });

  it("maps the supported WMO weather conditions to readable labels", () => {
    expect([
      0, 1, 2, 3, 45, 51, 61, 66, 71, 80, 85, 95,
    ].map((code) => mapOpenMeteoWeatherCode(code).label)).toEqual([
      "Clear",
      "Mostly Clear",
      "Partly Cloudy",
      "Overcast",
      "Fog",
      "Drizzle",
      "Rain",
      "Freezing Rain",
      "Snow",
      "Rain Showers",
      "Snow Showers",
      "Thunderstorms",
    ]);
  });

  it("constructs requests with URLSearchParams-compatible encoding", () => {
    const url = new URL(
      buildOpenMeteoForecastUrl({
        latitude: 32.87562,
        longitude: -97.49323,
      }),
    );

    expect(url.searchParams.get("daily")?.split(",")).toHaveLength(7);
    expect(url.search).not.toContain(" ");
  });

  it("adds only narrowly scoped public tournament coordinates", () => {
    const migration = readFileSync(
      "supabase/migrations/202607300006_add_tournament_weather_coordinates.sql",
      "utf8",
    );

    expect(migration).toContain("weather_latitude double precision");
    expect(migration).toContain("weather_longitude double precision");
    expect(migration).toContain("when 'Twin Points Park' then 32.87562");
    expect(migration).toContain("when 'West Bay Marina' then 32.93417");
    expect(migration).toContain("when 'West Bay Marina' then -97.51397");
    expect(migration).not.toMatch(/email|phone|payment|member/i);
    expect(migration).not.toContain("disable row level security");
  });

  it("requires no weather API key or private output fields", () => {
    const environmentExample = readFileSync(".env.example", "utf8");
    const source = readFileSync("lib/open-meteo.ts", "utf8");
    const normalized = normalizeOpenMeteoForecast(
      rawForecast,
      "2026-10-30",
      "2026-07-22T00:05:00.000Z",
    );

    expect(environmentExample).not.toMatch(
      /ACCUWEATHER_API_KEY|OPEN_METEO_API_KEY/,
    );
    expect(source).not.toMatch(/apikey/i);
    expect(JSON.stringify(normalized)).not.toMatch(
      /email|phone|payment|registration|member/i,
    );
  });

  it("uses the approved Twin Points rollout location until database coordinates are applied", () => {
    const publicTournament = toPublicTournament({
      ...databaseTournament,
      weather_latitude: undefined,
      weather_longitude: undefined,
    });

    expect(publicTournament.weatherLatitude).toBe(32.87562);
    expect(publicTournament.weatherLongitude).toBe(-97.49323);
    const westBayTournament = toPublicTournament({
      ...databaseTournament,
      ramp: "West Bay Marina",
      weather_latitude: undefined,
      weather_longitude: undefined,
    });
    expect(westBayTournament.weatherLatitude).toBe(32.93417);
    expect(westBayTournament.weatherLongitude).toBe(-97.51397);
    expect(
      toPublicTournament({
        ...databaseTournament,
        lake: "Unconfigured Lake",
        ramp: "Unconfigured Ramp",
        weather_latitude: undefined,
        weather_longitude: undefined,
      }).weatherLatitude,
    ).toBeNull();
  });
});
