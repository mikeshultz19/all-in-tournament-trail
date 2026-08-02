import { TWIN_POINTS_WEATHER_LOCATION } from "@/config/tournament-weather-locations";

export type TournamentFormat = "standard" | "bass-stack";

export type TournamentStatus =
  | "upcoming"
  | "live"
  | "unofficial"
  | "official";

export type RegistrationStatus = "open" | "closed" | "unavailable";

export type TournamentLaunchType = "TRAILERING" | "NUMBERED_START";

export type TournamentOperationalStatus =
  | "scheduled"
  | "weather_watch"
  | "delayed"
  | "postponed"
  | "cancelled"
  | "rescheduled";

export interface Tournament {
  slug: string;
  name: string;
  season: string;
  lake: string;
  venue: string | null;
  city: string | null;
  state: string;
  date: string;
  endDate: string | null;
  eventType: "regular_season" | "championship";
  regularSeasonNumber: number | null;
  startTimeDisplay: string;
  stopFishingTime: string;
  launchType: TournamentLaunchType;
  hours?: string | null;
  stopFishing?: string | null;
  launchTypeText?: string | null;
  morningRegistrationText?: string | null;
  description: string;
  status: TournamentStatus;
  registrationStatus: RegistrationStatus;
  registrationUrl: string | null;
  tournamentStatus: TournamentOperationalStatus;
  statusMessage: string;
  statusUpdatedAt: string;
  rescheduledDate: string | null;
  safeLightOverride: string | null;
  safeLightOverridePublicMessage: string | null;
  earlyRegistrationDeadlineTime: string;
  tournamentMorningRegistrationOpensAt: string | null;
  tournamentMorningRegistrationClosesAt: string | null;
  registrationInformation?: string | null;
  practiceInformation?: string | null;
  resultsAvailable: boolean;
  featured: boolean;
  heroImage: string | null;
  thumbnailImage: string | null;
  livestreamAvailable: boolean;
  /** Approved tournament weather location; never derive through browser geolocation. */
  weatherLatitude: number | null;
  weatherLongitude: number | null;
  tournamentFormat?: TournamentFormat;
}

export const TOURNAMENT_IMAGE_FALLBACK = "/images/tournament-hero.png";

const TOURNAMENT_DESCRIPTIONS = {
  1: "A powerhouse fishery known for big bass and heavyweight tournament bags. Get ready to see some impressive fish brought to the scales.",
  2: "One of the premier power plant lakes in Texas, known for excellent winter fishing and consistent limits.",
  3: "A big-weight lake where marinas, riprap, and the expansive river system often hold the winning fish.",
  4: "A unique river-system fishery featuring boat docks, deep clear water, and a variety of productive structure.",
  5: "One of the premier power plant lakes in Texas, known for excellent winter fishing and consistent limits.",
  6: "One of the toughest tournament lakes in Texas, but capable of producing trophy bass around rocks, flats, and flooded timber.",
  7: "An expansive fishery known for its abundant boat docks and outstanding shallow-water cover fishing.",
  8: "One of the toughest lakes in DFW, where success often comes from fishing rocks, brush piles, and riprap.",
} as const;

type TournamentScheduleSeed = Pick<
  Tournament,
  "slug" | "lake" | "date" | "endDate" | "eventType" | "regularSeasonNumber"
>;

type TournamentMetadataSeed = Omit<
  Tournament,
  | "slug"
  | "lake"
  | "date"
  | "endDate"
  | "eventType"
  | "regularSeasonNumber"
>;

type TournamentSeed = TournamentScheduleSeed & TournamentMetadataSeed;

const tournamentScheduleSeeds: readonly TournamentScheduleSeed[] = [
  {
    slug: "eagle-mountain-2026",
    lake: "Eagle Mountain",
    date: "2026-11-01",
    endDate: null,
    eventType: "regular_season",
    regularSeasonNumber: 1,
  },
  {
    slug: "squaw-creek-2026",
    lake: "Squaw Creek",
    date: "2026-11-22",
    endDate: null,
    eventType: "regular_season",
    regularSeasonNumber: 2,
  },
  {
    slug: "ray-hubbard-2026",
    lake: "Ray Hubbard",
    date: "2026-12-13",
    endDate: null,
    eventType: "regular_season",
    regularSeasonNumber: 3,
  },
  {
    slug: "granbury-2027",
    lake: "Granbury",
    date: "2027-01-17",
    endDate: null,
    eventType: "regular_season",
    regularSeasonNumber: 4,
  },
  {
    slug: "squaw-creek-2027",
    lake: "Squaw Creek",
    date: "2027-02-14",
    endDate: null,
    eventType: "regular_season",
    regularSeasonNumber: 5,
  },
  {
    slug: "ray-roberts-march-2027",
    lake: "Ray Roberts",
    date: "2027-03-14",
    endDate: null,
    eventType: "regular_season",
    regularSeasonNumber: 6,
  },
  {
    slug: "tawakoni-april-2027",
    lake: "Tawakoni",
    date: "2027-04-25",
    endDate: null,
    eventType: "regular_season",
    regularSeasonNumber: 7,
  },
  {
    slug: "lewisville-may-2027",
    lake: "Lewisville",
    date: "2027-05-16",
    endDate: null,
    eventType: "regular_season",
    regularSeasonNumber: 8,
  },
  {
    slug: "aitt-2026-2027-championship",
    lake: "TBD",
    date: "2027-06-12",
    endDate: "2027-06-13",
    eventType: "championship",
    regularSeasonNumber: null,
  },
];

const tournamentMetadataSeeds: readonly TournamentMetadataSeed[] = [
  {
    name: "Eagle Mountain",
    season: "2026-2027",
    venue: "Twin Points Park",
    city: "Azle",
    state: "Texas",
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType: "TRAILERING",
    description: TOURNAMENT_DESCRIPTIONS[1],
    status: "upcoming",
    registrationStatus: "open",
    registrationUrl: null,
    tournamentStatus: "scheduled",
    statusMessage:
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt: "2026-07-21T12:00:00.000Z",
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: "21:00",
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: null,
    practiceInformation: null,
    resultsAvailable: false,
    featured: true,
    heroImage: "/images/lakes/eagle-mountain.jfif",
    thumbnailImage: "/images/lakes/eagle-mountain.jfif",
    livestreamAvailable: false,
    weatherLatitude: TWIN_POINTS_WEATHER_LOCATION.latitude,
    weatherLongitude: TWIN_POINTS_WEATHER_LOCATION.longitude,
    tournamentFormat: "standard",
  },
  {
    name: "Squaw Creek",
    season: "2026-2027",
    venue: "Public Ramp",
    city: "Glen Rose",
    state: "Texas",
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType: "TRAILERING",
    description: TOURNAMENT_DESCRIPTIONS[2],
    status: "upcoming",
    registrationStatus: "open",
    registrationUrl: null,
    tournamentStatus: "scheduled",
    statusMessage:
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt: "2026-07-21T12:00:00.000Z",
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: "21:00",
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: null,
    practiceInformation: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/squaw-creek.jfif",
    thumbnailImage: "/images/lakes/squaw-creek.jfif",
    livestreamAvailable: false,
    weatherLatitude: null,
    weatherLongitude: null,
    tournamentFormat: "standard",
  },
  {
    name: "Ray Hubbard",
    season: "2026-2027",
    venue: "Public Ramp",
    city: "Rockwall",
    state: "Texas",
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType: "TRAILERING",
    description: TOURNAMENT_DESCRIPTIONS[3],
    status: "upcoming",
    registrationStatus: "open",
    registrationUrl: null,
    tournamentStatus: "scheduled",
    statusMessage:
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt: "2026-07-21T12:00:00.000Z",
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: "21:00",
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: null,
    practiceInformation: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/ray-hubbard.jfif",
    thumbnailImage: "/images/lakes/ray-hubbard.jfif",
    livestreamAvailable: false,
    weatherLatitude: null,
    weatherLongitude: null,
    tournamentFormat: "standard",
  },
  {
    name: "Granbury",
    season: "2026-2027",
    venue: null,
    city: null,
    state: "Texas",
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType: "TRAILERING",
    description: TOURNAMENT_DESCRIPTIONS[4],
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    tournamentStatus: "scheduled",
    statusMessage:
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt: "2026-07-21T12:00:00.000Z",
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: "21:00",
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: null,
    practiceInformation: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/granbury.jfif",
    thumbnailImage: "/images/lakes/granbury.jfif",
    livestreamAvailable: false,
    weatherLatitude: null,
    weatherLongitude: null,
    tournamentFormat: "standard",
  },
  {
    name: "Squaw Creek",
    season: "2026-2027",
    venue: null,
    city: null,
    state: "Texas",
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType: "TRAILERING",
    description: TOURNAMENT_DESCRIPTIONS[5],
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    tournamentStatus: "scheduled",
    statusMessage:
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt: "2026-07-21T12:00:00.000Z",
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: "21:00",
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: null,
    practiceInformation: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/squaw-creek.jfif",
    thumbnailImage: "/images/lakes/squaw-creek.jfif",
    livestreamAvailable: false,
    weatherLatitude: null,
    weatherLongitude: null,
    tournamentFormat: "bass-stack",
  },
  {
    name: "Ray Roberts",
    season: "2026-2027",
    venue: null,
    city: null,
    state: "Texas",
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType: "TRAILERING",
    description: TOURNAMENT_DESCRIPTIONS[6],
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    tournamentStatus: "scheduled",
    statusMessage:
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt: "2026-07-21T12:00:00.000Z",
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: "21:00",
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: null,
    practiceInformation: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/ray-roberts.jfif",
    thumbnailImage: "/images/lakes/ray-roberts.jfif",
    livestreamAvailable: false,
    weatherLatitude: null,
    weatherLongitude: null,
    tournamentFormat: "standard",
  },
  {
    name: "Tawakoni",
    season: "2026-2027",
    venue: null,
    city: null,
    state: "Texas",
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType: "TRAILERING",
    description: TOURNAMENT_DESCRIPTIONS[7],
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    tournamentStatus: "scheduled",
    statusMessage:
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt: "2026-07-21T12:00:00.000Z",
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: "21:00",
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: null,
    practiceInformation: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/tawakoni.jfif",
    thumbnailImage: "/images/lakes/tawakoni.jfif",
    livestreamAvailable: false,
    weatherLatitude: null,
    weatherLongitude: null,
    tournamentFormat: "standard",
  },
  {
    name: "Lewisville",
    season: "2026-2027",
    venue: null,
    city: null,
    state: "Texas",
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType: "TRAILERING",
    description: TOURNAMENT_DESCRIPTIONS[8],
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    tournamentStatus: "scheduled",
    statusMessage:
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt: "2026-07-21T12:00:00.000Z",
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: "21:00",
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: null,
    practiceInformation: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/lewisville-lake.jfif",
    thumbnailImage: "/images/lakes/lewisville-lake.jfif",
    livestreamAvailable: false,
    weatherLatitude: null,
    weatherLongitude: null,
    tournamentFormat: "bass-stack",
  },
  {
    name: "AITT Championship",
    season: "2026-2027",
    venue: null,
    city: null,
    state: "Texas",
    startTimeDisplay: "Safe Light",
    stopFishingTime: "15:00",
    launchType: "TRAILERING",
    description:
      "The two-day 2026-2027 AITT Championship. Championship lake and event details are to be announced.",
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    tournamentStatus: "scheduled",
    statusMessage:
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt: "2026-07-21T12:00:00.000Z",
    rescheduledDate: null,
    safeLightOverride: null,
    safeLightOverridePublicMessage: null,
    earlyRegistrationDeadlineTime: "21:00",
    tournamentMorningRegistrationOpensAt: "05:00",
    tournamentMorningRegistrationClosesAt: null,
    registrationInformation: null,
    practiceInformation: null,
    resultsAvailable: false,
    featured: false,
    heroImage: TOURNAMENT_IMAGE_FALLBACK,
    thumbnailImage: TOURNAMENT_IMAGE_FALLBACK,
    livestreamAvailable: false,
    weatherLatitude: null,
    weatherLongitude: null,
  },
];

const tournamentSeeds: readonly TournamentSeed[] = tournamentScheduleSeeds.map(
  (schedule, index) => ({
    ...schedule,
    ...tournamentMetadataSeeds[index],
  }),
);

export const tournaments: readonly Tournament[] = tournamentSeeds.map(
  (tournament): Tournament => ({
    ...tournament,
    tournamentStatus: tournament.tournamentStatus ?? "scheduled",
    statusMessage:
      tournament.statusMessage ??
      "Tournament preparations are on schedule. Register during the published registration windows.",
    statusUpdatedAt:
      tournament.statusUpdatedAt ?? "2026-07-21T12:00:00.000Z",
    rescheduledDate: tournament.rescheduledDate ?? null,
    safeLightOverride: tournament.safeLightOverride ?? null,
    safeLightOverridePublicMessage:
      tournament.safeLightOverridePublicMessage ?? null,
    earlyRegistrationDeadlineTime:
      tournament.earlyRegistrationDeadlineTime ?? "21:00",
    tournamentMorningRegistrationOpensAt:
      tournament.tournamentMorningRegistrationOpensAt ?? "05:00",
    tournamentMorningRegistrationClosesAt:
      tournament.tournamentMorningRegistrationClosesAt ?? null,
    weatherLatitude: tournament.weatherLatitude ?? null,
    weatherLongitude: tournament.weatherLongitude ?? null,
    tournamentFormat: tournament.tournamentFormat ?? "standard",
    state: tournament.state ?? "Texas",
    startTimeDisplay: tournament.startTimeDisplay ?? "Safe Light",
    stopFishingTime: tournament.stopFishingTime ?? "15:00",
    launchType: tournament.launchType ?? "TRAILERING",
    endDate: tournament.endDate ?? null,
    eventType: tournament.eventType ?? "regular_season",
    regularSeasonNumber: tournament.regularSeasonNumber ?? null,
  }),
);

export function getUpcomingTournaments(): readonly Tournament[] {
  return tournaments
    .filter((tournament) => tournament.status === "upcoming")
    .toSorted((a, b) => a.date.localeCompare(b.date));
}

export function getFeaturedTournament(): Tournament | undefined {
  return (
    tournaments.find((tournament) => tournament.featured) ??
    getUpcomingTournaments()[0]
  );
}

export function getTournamentBySlug(slug: string): Tournament | undefined {
  return tournaments.find((tournament) => tournament.slug === slug);
}

export function getEffectiveTournamentDate(tournament: Tournament): string {
  return tournament.tournamentStatus === "rescheduled" && tournament.rescheduledDate
    ? tournament.rescheduledDate
    : tournament.date;
}

export function getTournamentImage(tournament: Tournament): string {
  return tournament.heroImage ?? TOURNAMENT_IMAGE_FALLBACK;
}
