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

export type RegistrationPeriod =
  | "early_online"
  | "fully_closed";

export interface RegistrationAvailability {
  period: RegistrationPeriod;
  canSubmit: boolean;
  reason: string;
  earlyRegistrationDeadline: Date;
  morningOpensAt: Date | null;
  morningClosesAt: Date | null;
}

export function getRegistrationAvailability(
  tournament: Tournament,
  now: Date = new Date(),
): RegistrationAvailability {
  const effectiveDate = getEffectiveTournamentDate(tournament);
  const earlyRegistrationDeadline = tournamentDateTimeToUtc(
    previousTournamentDate(effectiveDate),
    tournament.earlyRegistrationDeadlineTime,
  );
  const morningOpensAt = tournament.tournamentMorningRegistrationOpensAt
    ? tournamentDateTimeToUtc(
        effectiveDate,
        tournament.tournamentMorningRegistrationOpensAt,
      )
    : null;
  const morningClosesAt = tournament.tournamentMorningRegistrationClosesAt
    ? tournamentDateTimeToUtc(
        effectiveDate,
        tournament.tournamentMorningRegistrationClosesAt,
      )
    : null;

  const base = { earlyRegistrationDeadline, morningOpensAt, morningClosesAt };

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
          ? "Registration is closed for this tournament."
          : "Registration is not currently available for this tournament.",
    };
  }

  if (now < earlyRegistrationDeadline) {
    return {
      ...base,
      period: "early_online",
      canSubmit: true,
      reason: "Early online registration is open.",
    };
  }

  return {
    ...base,
    period: "fully_closed",
    canSubmit: false,
    reason: "Early Online Registration is closed. Tournament-morning registration is completed in person with a Tournament Director through WeighFish.",
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
