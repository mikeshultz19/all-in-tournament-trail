import {
  TOURNAMENT_IMAGE_FALLBACK,
  type RegistrationStatus,
  type Tournament as PublicTournament,
  type TournamentOperationalStatus,
} from "@/data/tournaments";
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

export function toPublicTournament(
  tournament: Tournament,
): PublicTournamentRecord {
  const date = centralDate(tournament.tournament_date);
  const morningRegistration =
    tournament.morning_registration &&
    /^\d{2}:\d{2}$/.test(tournament.morning_registration)
      ? tournament.morning_registration
      : null;

  return {
    slug: tournament.slug,
    name: tournament.name,
    season: `${date.slice(0, 4)}`,
    lake: tournament.lake,
    venue: tournament.ramp,
    city: null,
    state: "Texas",
    date,
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType:
      tournament.launch_type?.toLowerCase().includes("number")
        ? "NUMBERED_START"
        : "TRAILERING",
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
    tournamentMorningRegistrationOpensAt: morningRegistration,
    tournamentMorningRegistrationClosesAt: null,
    resultsAvailable: tournament.status === "Results Published",
    featured: tournament.is_featured,
    heroImage: tournament.hero_image_url ?? TOURNAMENT_IMAGE_FALLBACK,
    thumbnailImage: tournament.hero_image_url ?? TOURNAMENT_IMAGE_FALLBACK,
    livestreamAvailable: false,
    accuWeatherLocationKey: null,
    lifecycleStatus: tournament.status,
  };
}
