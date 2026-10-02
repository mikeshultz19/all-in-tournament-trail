import * as SunCalc from "suncalc";

import { SAFE_LIGHT_REFERENCE } from "@/config/tournament-operations";
import {
  isValidTournamentTime,
  tournamentDateAtNoonUtc,
  tournamentDateTimeToUtc,
} from "@/lib/tournament-time";

export interface SafeLightResult {
  effectiveTournamentDate: string;
  officialSunrise: Date;
  calculatedSafeLight: Date;
  safeLight: Date;
  isOverridden: boolean;
  publicOverrideReason: string | null;
}

export function getSafeLight(
  effectiveTournamentDate: string,
  manualOverride: string | null = null,
  publicOverrideReason: string | null = null,
  latitude: number = SAFE_LIGHT_REFERENCE.latitude,
  longitude: number = SAFE_LIGHT_REFERENCE.longitude,
): SafeLightResult {
  const officialSunrise = SunCalc.getTimes(
    tournamentDateAtNoonUtc(effectiveTournamentDate),
    latitude,
    longitude,
  ).sunrise;
  if (!officialSunrise) {
    throw new Error(`Sunrise is unavailable for ${effectiveTournamentDate}.`);
  }
  // Use the actual sunrise for the tournament date as the simple planning
  // estimate. Tournament officials still control the final launch time.
  const calculatedSafeLight = officialSunrise;
  const isOverridden = isValidTournamentTime(manualOverride);

  return {
    effectiveTournamentDate,
    officialSunrise,
    calculatedSafeLight,
    safeLight: isOverridden
      ? tournamentDateTimeToUtc(effectiveTournamentDate, manualOverride)
      : calculatedSafeLight,
    isOverridden,
    publicOverrideReason: isOverridden ? publicOverrideReason : null,
  };
}
