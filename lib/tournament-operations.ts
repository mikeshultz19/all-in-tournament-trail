import {
  getEffectiveTournamentDate,
  type Tournament,
  type TournamentOperationalStatus,
} from "@/data/tournaments";
import {
  getTournamentLocalDate,
  previousTournamentDate,
  tournamentDateTimeToUtc,
} from "@/lib/tournament-time";

export const TOURNAMENT_STATUS_LABELS: Record<
  TournamentOperationalStatus,
  string
> = {
  scheduled: "Scheduled",
  weather_watch: "Weather Watch",
  delayed: "Delayed",
  postponed: "Postponed",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
};

export type RegistrationPeriod = "online" | "fully_closed";

export interface RegistrationAvailability {
  period: RegistrationPeriod;
  canSubmit: boolean;
  reason: string;
  earlyRegistrationDeadline: Date;
  morningOpensAt: Date | null;
  morningClosesAt: Date | null;
}

function optionalTournamentTime(
  tournament: Tournament,
  effectiveDate: string,
  field: "tournamentMorningRegistrationOpensAt" | "tournamentMorningRegistrationClosesAt",
): { value: Date | null; valid: boolean } {
  const time = tournament[field];
  if (!time) {
    return { value: null, valid: true };
  }

  try {
    return {
      value: tournamentDateTimeToUtc(effectiveDate, time),
      valid: true,
    };
  } catch (error) {
    console.error(
      `Invalid ${field} for tournament ${tournament.slug || tournament.name}.`,
      error,
    );
    return { value: null, valid: false };
  }
}

export function getRegistrationAvailability(
  tournament: Tournament,
  now: Date = new Date(),
): RegistrationAvailability {
  void now;
  const effectiveDate = getEffectiveTournamentDate(tournament);
  const earlyRegistrationDeadline = tournamentDateTimeToUtc(
    previousTournamentDate(effectiveDate),
    tournament.earlyRegistrationDeadlineTime,
  );
  const morningOpens = optionalTournamentTime(
    tournament,
    effectiveDate,
    "tournamentMorningRegistrationOpensAt",
  );
  const morningCloses = optionalTournamentTime(
    tournament,
    effectiveDate,
    "tournamentMorningRegistrationClosesAt",
  );
  const morningOpensAt = morningOpens.value;
  const morningClosesAt = morningCloses.value;

  const base = { earlyRegistrationDeadline, morningOpensAt, morningClosesAt };

  if (!morningOpens.valid || !morningCloses.valid) {
    return {
      ...base,
      period: "fully_closed",
      canSubmit: false,
      reason: "Registration is unavailable because tournament timing requires review.",
    };
  }

  if (tournament.status === "official" || tournament.status === "unofficial") {
    return {
      ...base,
      period: "fully_closed",
      canSubmit: false,
      reason: "Registration is no longer available for this tournament.",
    };
  }

  if (tournament.tournamentStatus === "cancelled") {
    return {
      ...base,
      period: "fully_closed",
      canSubmit: false,
      reason: "Registration is closed because this tournament is cancelled.",
    };
  }

  if (tournament.tournamentStatus === "postponed") {
    return {
      ...base,
      period: "fully_closed",
      canSubmit: false,
      reason:
        "New registrations are paused while tournament officials publish updated instructions.",
    };
  }

  if (tournament.registrationStatus !== "open") {
    return {
      ...base,
      period: "fully_closed",
      canSubmit: false,
      reason:
        tournament.registrationStatus === "closed"
          ? "Registration is temporarily unavailable."
          : "Registration is not currently available for this tournament.",
    };
  }

  return {
    ...base,
    period: "online",
    canSubmit: true,
    reason: "Online registration is open.",
  };
}

export function getNextRelevantTournament(
  tournamentList: readonly Tournament[],
  now: Date = new Date(),
): Tournament | undefined {
  const today = getTournamentLocalDate(now);
  const relevant = tournamentList
    .filter(
      (tournament) =>
        tournament.status === "upcoming" &&
        getEffectiveTournamentDate(tournament) >= today,
    )
    .toSorted((a, b) =>
      getEffectiveTournamentDate(a).localeCompare(getEffectiveTournamentDate(b)),
    );

  return relevant.find((tournament) => tournament.featured) ?? relevant[0];
}
