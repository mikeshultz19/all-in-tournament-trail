import {
  TOURNAMENT_IMAGE_FALLBACK,
  type RegistrationStatus,
  type Tournament as PublicTournament,
  type TournamentOperationalStatus,
} from "@/data/tournaments";
import { getApprovedTournamentWeatherLocation } from "@/config/tournament-weather-locations";
import type {
  Tournament,
  TournamentStatus,
} from "@/types/tournament";

export interface PublicTournamentRecord extends PublicTournament {
  lifecycleStatus: TournamentStatus;
}

function centralDate(timestamp: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function centralTime(timestamp: string | null): string {
  if (!timestamp) {
    return "21:00";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.hour}:${values.minute}`;
}

function registrationStatus(status: TournamentStatus): RegistrationStatus {
  if (status === "Registration Open") return "open";
  if (
    status === "Registration Closed" ||
    status === "Cancelled" ||
    status === "Results Published"
  ) {
    return "closed";
  }
  return "unavailable";
}

function operationalStatus(
  status: TournamentStatus,
): TournamentOperationalStatus {
  if (status === "Postponed") return "postponed";
  if (status === "Cancelled") return "cancelled";
  return "scheduled";
}

function optionalDisplayText(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized || null;
}

export function toPublicTournament(
  tournament: Tournament,
): PublicTournamentRecord {
  const date = centralDate(tournament.tournament_date);
  const approvedWeatherLocation = getApprovedTournamentWeatherLocation({
    lake: tournament.lake,
    ramp: tournament.ramp,
  });
  const tournamentFormat =
    tournament.regular_season_number === 5 ||
    tournament.regular_season_number === 8
      ? "bass-stack"
      : "standard";

  return {
    slug: tournament.slug,
    name: tournament.name,
    season: `${date.slice(0, 4)}`,
    lake: tournament.lake,
    weatherLatitude:
      tournament.weather_latitude ?? approvedWeatherLocation?.latitude ?? null,
    weatherLongitude:
      tournament.weather_longitude ?? approvedWeatherLocation?.longitude ?? null,
    tournamentFormat,
    venue: tournament.ramp,
    city: null,
    state: "Texas",
    date,
    endDate: tournament.tournament_end_date
      ? centralDate(tournament.tournament_end_date)
      : null,
    eventType: tournament.event_type,
    regularSeasonNumber: tournament.regular_season_number,
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    hours: optionalDisplayText(tournament.hours ?? null),
    stopFishing: optionalDisplayText(tournament.stop_fishing ?? null),
    launchType:
      tournament.launch_type?.toLowerCase().includes("number")
        ? "NUMBERED_START"
        : "TRAILERING",
    launchTypeText: optionalDisplayText(tournament.launch_type),
    description:
      tournament.description ?? "Tournament details will be available soon.",
    status:
      tournament.status === "Results Published" ? "official" : "upcoming",
    registrationStatus: registrationStatus(tournament.status),
    registrationUrl: null,
    tournamentStatus: operationalStatus(tournament.status),
    statusMessage:
      tournament.description ??
      `Tournament status: ${tournament.status}.`,
    statusUpdatedAt: tournament.updated_at,
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: centralTime(
      tournament.registration_closes,
    ),
    tournamentMorningRegistrationOpensAt: optionalDisplayText(
      tournament.morning_registration,
    ),
    morningRegistrationText: optionalDisplayText(
      tournament.morning_registration,
    ),
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: optionalDisplayText(
      tournament.registration_information,
    ),
    practiceInformation: optionalDisplayText(
      tournament.practice_information,
    ),
    resultsAvailable: tournament.status === "Results Published",
    featured: tournament.is_featured,
    heroImage: tournament.hero_image_url ?? TOURNAMENT_IMAGE_FALLBACK,
    thumbnailImage: tournament.hero_image_url ?? TOURNAMENT_IMAGE_FALLBACK,
    livestreamAvailable: false,
    lifecycleStatus: tournament.status,
  };
}
