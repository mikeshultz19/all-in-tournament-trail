export interface TournamentWeatherForecast {
  conditionText: string;
  weatherIcon: number | null;
  temperatureF: number | null;
  highF: number | null;
  lowF: number | null;
  windDirection: string | null;
  windSpeedMph: number | null;
  windGustMph: number | null;
  precipitationProbability: number | null;
  observedOrForecastAt: string;
  fetchedAt: string;
  source: "AccuWeather";
}

export type TournamentWeatherResult =
  | { status: "available"; forecast: TournamentWeatherForecast }
  | { status: "pending" }
  | { status: "unavailable" };
