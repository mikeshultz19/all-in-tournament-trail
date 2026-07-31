import { getTournamentLocalDate } from "@/lib/tournament-time";
import type {
  TournamentWeatherCondition,
  TournamentWeatherDay,
  TournamentWeatherForecast,
  TournamentWeatherResult,
} from "@/lib/tournament-weather";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const FORECAST_DAYS = 5;
const FORECAST_REVALIDATE_SECONDS = 3 * 60 * 60;
const FORECAST_TIME_ZONE = "America/Chicago";
const TEMPORARY_PROVIDER_STATUSES = new Set([429, 502, 503, 504]);
const FORECAST_RETRY_DELAYS_MS = [50, 100];
const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "wind_direction_10m_dominant",
] as const;

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function array(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function textAt(values: unknown[] | null, index: number): string | null {
  const value = values?.[index];
  return typeof value === "string" && value.trim() ? value : null;
}

function numberAt(values: unknown[] | null, index: number): number | null {
  const value = values?.[index];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function validCoordinate(
  value: number | null,
  minimum: number,
  maximum: number,
): value is number {
  return value !== null && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function isTemporaryProviderStatus(status: number) {
  return TEMPORARY_PROVIDER_STATUSES.has(status);
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function fetchOpenMeteoForecastWithRetries(url: string) {
  for (let attempt = 0; attempt <= FORECAST_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(url, {
        next: { revalidate: FORECAST_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        return response;
      }

      if (isTemporaryProviderStatus(response.status)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Open-Meteo returned ${response.status}; retrying ${attempt + 1}/${FORECAST_RETRY_DELAYS_MS.length + 1}.`,
          );
        }

        if (attempt < FORECAST_RETRY_DELAYS_MS.length) {
          await delay(FORECAST_RETRY_DELAYS_MS[attempt]);
          continue;
        }

        return null;
      }

      console.error(
        `Open-Meteo forecast request failed with status ${response.status}.`,
      );
      return null;
    } catch (error) {
      console.error("Open-Meteo forecast request could not be completed.", error);
      return null;
    }
  }

  return null;
}

export function mapOpenMeteoWeatherCode(code: number): {
  condition: TournamentWeatherCondition;
  label: string;
} {
  if (code === 0) return { condition: "clear", label: "Clear" };
  if (code === 1) return { condition: "mostly-clear", label: "Mostly Clear" };
  if (code === 2) return { condition: "partly-cloudy", label: "Partly Cloudy" };
  if (code === 3) return { condition: "overcast", label: "Overcast" };
  if (code === 45 || code === 48) return { condition: "fog", label: "Fog" };
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { condition: "drizzle", label: "Drizzle" };
  }
  if ([61, 63, 65].includes(code)) return { condition: "rain", label: "Rain" };
  if (code === 66 || code === 67) {
    return { condition: "freezing-rain", label: "Freezing Rain" };
  }
  if ([71, 73, 75, 77].includes(code)) return { condition: "snow", label: "Snow" };
  if ([80, 81, 82].includes(code)) {
    return { condition: "rain-showers", label: "Rain Showers" };
  }
  if (code === 85 || code === 86) {
    return { condition: "snow-showers", label: "Snow Showers" };
  }
  if ([95, 96, 99].includes(code)) {
    return { condition: "thunderstorms", label: "Thunderstorms" };
  }
  return { condition: "unknown", label: "Unknown Conditions" };
}

export function buildOpenMeteoForecastUrl(input: {
  latitude: number;
  longitude: number;
}) {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    daily: DAILY_FIELDS.join(","),
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: FORECAST_TIME_ZONE,
    forecast_days: String(FORECAST_DAYS),
  });

  return `${OPEN_METEO_FORECAST_URL}?${params.toString()}`;
}

export function normalizeOpenMeteoForecast(
  payload: unknown,
  currentLocalDate: string,
  fetchedAt: string,
): TournamentWeatherForecast | null {
  const daily = record(record(payload)?.daily);
  if (!daily) return null;

  const dates = array(daily.time);
  const weatherCodes = array(daily.weather_code);
  if (!dates || !weatherCodes) return null;

  const highs = array(daily.temperature_2m_max);
  const lows = array(daily.temperature_2m_min);
  const precipitation = array(daily.precipitation_probability_max);
  const winds = array(daily.wind_speed_10m_max);
  const gusts = array(daily.wind_gusts_10m_max);
  const directions = array(daily.wind_direction_10m_dominant);

  const days = dates
    .flatMap<TournamentWeatherDay>((_, index) => {
      const date = textAt(dates, index);
      const weatherCode = numberAt(weatherCodes, index);
      if (!date || weatherCode === null) return [];

      const mapped = mapOpenMeteoWeatherCode(weatherCode);
      return [{
        date: date.slice(0, 10),
        condition: mapped.condition,
        conditionText: mapped.label,
        highF: numberAt(highs, index),
        lowF: numberAt(lows, index),
        precipitationProbability: numberAt(precipitation, index),
        maxWindMph: numberAt(winds, index),
        maxGustMph: numberAt(gusts, index),
        dominantWindDirectionDegrees: numberAt(directions, index),
      }];
    })
    .filter((day) => day.date >= currentLocalDate)
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(0, FORECAST_DAYS);

  if (days.length === 0) return null;

  return {
    days,
    fetchedAt,
    source: "Open-Meteo",
  };
}

export async function getOpenMeteoTournamentForecast(input: {
  latitude: number | null;
  longitude: number | null;
  now?: Date;
}): Promise<TournamentWeatherResult> {
  const { latitude, longitude } = input;
  if (
    !validCoordinate(latitude, -90, 90) ||
    !validCoordinate(longitude, -180, 180)
  ) {
    return { status: "unavailable", reason: "location-not-configured" };
  }

  try {
    const response = await fetchOpenMeteoForecastWithRetries(
      buildOpenMeteoForecastUrl({
        latitude,
        longitude,
      }),
    );
    if (!response) {
      return { status: "unavailable", reason: "provider-error" };
    }

    const forecast = normalizeOpenMeteoForecast(
      await response.json(),
      getTournamentLocalDate(input.now ?? new Date()),
      new Date().toISOString(),
    );
    if (!forecast) {
      console.error("Open-Meteo forecast response did not contain usable daily data.");
      return { status: "unavailable", reason: "provider-error" };
    }

    return { status: "available", forecast };
  } catch {
    console.error("Open-Meteo forecast request could not be completed.");
    return { status: "unavailable", reason: "provider-error" };
  }
}
