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
): SafeLightResult {
  const officialSunrise = SunCalc.getTimes(
    tournamentDateAtNoonUtc(effectiveTournamentDate),
    SAFE_LIGHT_REFERENCE.latitude,
    SAFE_LIGHT_REFERENCE.longitude,
  ).sunrise;
  if (!officialSunrise) {
    throw new Error(`Sunrise is unavailable for ${effectiveTournamentDate}.`);
  }
  const calculatedSafeLight = new Date(
    officialSunrise.getTime() -
      SAFE_LIGHT_REFERENCE.minutesBeforeSunrise * 60 * 1000,
  );
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
