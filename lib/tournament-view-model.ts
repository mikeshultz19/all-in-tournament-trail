import { getEffectiveTournamentDate, type Tournament } from "@/data/tournaments";
import { getSafeLight } from "@/lib/safe-light";
import { getRegistrationAvailability } from "@/lib/tournament-operations";
import {
  formatTournamentDate,
  formatTournamentTime,
  formatTournamentTimestamp,
} from "@/lib/tournament-time";

export interface SafeLightViewModel {
  time: string;
  officialSunrise: string;
  isOverridden: boolean;
  publicOverrideReason: string | null;
}

export interface TournamentOperationsViewModel {
  effectiveDate: string;
  formattedEffectiveDate: string;
  earlyRegistrationDeadline: string;
  earlyRegistrationDeadlineIso: string;
  tournamentMorningWindow: string | null;
  registrationCanSubmit: boolean;
  registrationPeriod:
    | "early_online"
    | "closed_between_periods"
    | "tournament_morning"
    | "fully_closed";
  registrationReason: string;
  safeLight: SafeLightViewModel;
}

export function getTournamentOperationsViewModel(
  tournament: Tournament,
  now: Date = new Date(),
): TournamentOperationsViewModel {
  const effectiveDate = getEffectiveTournamentDate(tournament);
  const safeLight = getSafeLight(
    effectiveDate,
    tournament.safeLightOverride,
    tournament.safeLightOverridePublicMessage,
  );
  const registration = getRegistrationAvailability(tournament, now);

  return {
    effectiveDate,
    formattedEffectiveDate: formatTournamentDate(effectiveDate),
    earlyRegistrationDeadline: formatTournamentTimestamp(
      registration.earlyRegistrationDeadline.toISOString(),
    ),
    earlyRegistrationDeadlineIso: registration.earlyRegistrationDeadline.toISOString(),
    tournamentMorningWindow:
      registration.morningOpensAt && registration.morningClosesAt
        ? `${formatTournamentTime(registration.morningOpensAt)}–${formatTournamentTime(registration.morningClosesAt)}`
        : null,
    registrationCanSubmit: registration.canSubmit,
    registrationPeriod: registration.period,
    registrationReason: registration.reason,
    safeLight: {
      time: formatTournamentTime(safeLight.safeLight),
      officialSunrise: formatTournamentTime(safeLight.officialSunrise),
      isOverridden: safeLight.isOverridden,
      publicOverrideReason: safeLight.publicOverrideReason,
    },
  };
}
