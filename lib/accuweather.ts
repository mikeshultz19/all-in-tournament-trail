import { getTournamentLocalDate } from "@/lib/tournament-time";
import type {
  TournamentWeatherForecast,
  TournamentWeatherResult,
} from "@/lib/tournament-weather";

const ACCUWEATHER_BASE_URL = "https://dataservice.accuweather.com";
const FORECAST_DAYS = 5;
const FORECAST_REVALIDATE_SECONDS = 3 * 60 * 60;

// This provider is imported only by the async server-rendered Home page. Keep
// credentials here and never pass them into the normalized UI model.

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nestedNumber(value: unknown, ...path: string[]): number | null {
  let current: unknown = value;
  for (const segment of path) current = record(current)?.[segment];
  return number(current);
}

function nestedText(value: unknown, ...path: string[]): string | null {
  let current: unknown = value;
  for (const segment of path) current = record(current)?.[segment];
  return text(current);
}

export function normalizeAccuWeatherDailyForecast(
  payload: unknown,
  tournamentDate: string,
  fetchedAt: string,
): TournamentWeatherForecast | null {
  const root = record(payload);
  const forecasts = root?.DailyForecasts;
  if (!Array.isArray(forecasts)) return null;

  const daily = forecasts.map(record).find((forecast) =>
    text(forecast?.Date)?.startsWith(tournamentDate),
  );
  const day = record(daily?.Day);
  const forecastAt = text(daily?.Date);
  const conditionText = text(day?.IconPhrase);
  if (!daily || !day || !forecastAt || !conditionText) return null;

  return {
    conditionText,
    weatherIcon: number(day.Icon),
    temperatureF: nestedNumber(daily.Temperature, "Maximum", "Value"),
    highF: nestedNumber(daily.Temperature, "Maximum", "Value"),
    lowF: nestedNumber(daily.Temperature, "Minimum", "Value"),
    windDirection:
      nestedText(day.Wind, "Direction", "English") ??
      nestedText(day.Wind, "Direction", "Localized"),
    windSpeedMph: nestedNumber(day.Wind, "Speed", "Value"),
    windGustMph: nestedNumber(day.WindGust, "Speed", "Value"),
    precipitationProbability: number(day.PrecipitationProbability),
    observedOrForecastAt: forecastAt,
    fetchedAt,
    source: "AccuWeather",
  };
}

export function isTournamentWithinForecastHorizon(
  tournamentDate: string,
  now: Date = new Date(),
): boolean {
  const today = getTournamentLocalDate(now);
  const lastDate = new Date(`${today}T12:00:00.000Z`);
  lastDate.setUTCDate(lastDate.getUTCDate() + FORECAST_DAYS - 1);
  return tournamentDate >= today && tournamentDate <= lastDate.toISOString().slice(0, 10);
}

export async function getAccuWeatherTournamentForecast({
  tournamentDate,
  locationKey,
  now = new Date(),
}: {
  tournamentDate: string;
  locationKey: string | null;
  now?: Date;
}): Promise<TournamentWeatherResult> {
  if (!isTournamentWithinForecastHorizon(tournamentDate, now)) {
    return { status: "pending" };
  }

  const apiKey = process.env.ACCUWEATHER_API_KEY?.trim();
  if (!apiKey || !locationKey) return { status: "unavailable" };

  try {
    const url = new URL(
      `/forecasts/v1/daily/5day/${encodeURIComponent(locationKey)}`,
      ACCUWEATHER_BASE_URL,
    );
    url.searchParams.set("details", "true");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Accept-Encoding": "gzip,deflate",
      },
      next: { revalidate: FORECAST_REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.error(`AccuWeather forecast request failed with status ${response.status}.`);
      return { status: "unavailable" };
    }

    const fetchedAt = new Date().toISOString();
    const forecast = normalizeAccuWeatherDailyForecast(
      await response.json(),
      tournamentDate,
      fetchedAt,
    );
    if (!forecast) {
      console.error("AccuWeather forecast response did not contain the expected tournament-day data.");
      return { status: "unavailable" };
    }
    return { status: "available", forecast };
  } catch {
    console.error("AccuWeather forecast request could not be completed.");
    return { status: "unavailable" };
  }
}
