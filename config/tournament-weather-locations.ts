export interface TournamentWeatherLocation {
  latitude: number;
  longitude: number;
}

/**
 * Approved weather coordinates used during database-migration rollout.
 *
 * Source: Texas Parks & Wildlife Department, 2024 Eagle Mountain Reservoir
 * survey, Twin Points public boat ramp.
 */
export const TWIN_POINTS_WEATHER_LOCATION = {
  latitude: 32.87562,
  longitude: -97.49323,
} as const satisfies TournamentWeatherLocation;

/**
 * Source: Texas Parks & Wildlife Department, 2024 Eagle Mountain Reservoir
 * survey, West Bay Marina public boat ramp.
 */
export const WEST_BAY_MARINA_WEATHER_LOCATION = {
  latitude: 32.93417,
  longitude: -97.51397,
} as const satisfies TournamentWeatherLocation;

export function getApprovedTournamentWeatherLocation(input: {
  lake: string;
  ramp: string | null;
}): TournamentWeatherLocation | null {
  if (input.lake !== "Eagle Mountain") return null;
  if (input.ramp === "Twin Points Park") return TWIN_POINTS_WEATHER_LOCATION;
  if (input.ramp === "West Bay Marina") {
    return WEST_BAY_MARINA_WEATHER_LOCATION;
  }
  return null;
}
