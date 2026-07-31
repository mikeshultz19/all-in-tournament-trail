export type TournamentWeatherCondition =
  | "clear"
  | "mostly-clear"
  | "partly-cloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "freezing-rain"
  | "snow"
  | "rain-showers"
  | "snow-showers"
  | "thunderstorms"
  | "unknown";

export interface TournamentWeatherDay {
  date: string;
  condition: TournamentWeatherCondition;
  conditionText: string;
  highF: number | null;
  lowF: number | null;
  precipitationProbability: number | null;
  maxWindMph: number | null;
  maxGustMph: number | null;
  dominantWindDirectionDegrees: number | null;
}

export interface TournamentWeatherForecast {
  days: TournamentWeatherDay[];
  fetchedAt: string;
  source: "Open-Meteo";
}

export type TournamentWeatherResult =
  | { status: "available"; forecast: TournamentWeatherForecast }
  | { status: "pending" }
  | {
      status: "unavailable";
      reason?: "location-not-configured" | "provider-error";
    };
