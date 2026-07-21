export type TournamentStatus =
  | "upcoming"
  | "live"
  | "unofficial"
  | "official";

export type RegistrationStatus = "open" | "closed" | "unavailable";

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
  date: string;
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
  resultsAvailable: boolean;
  featured: boolean;
  heroImage: string | null;
  thumbnailImage: string | null;
  livestreamAvailable: boolean;
}

export const TOURNAMENT_IMAGE_FALLBACK = "/images/tournament-hero.png";

const TOURNAMENT_DESCRIPTION =
  "Eagle Mountain Lake is one of North Texas’ premier fisheries, known for its healthy population of largemouth, spotted, and white bass. With miles of shoreline, creek arms, and deep ledges, it offers something for every angler.";

type TournamentSeed = Omit<
  Tournament,
  | "tournamentStatus"
  | "statusMessage"
  | "statusUpdatedAt"
  | "rescheduledDate"
  | "safeLightOverride"
  | "safeLightOverridePublicMessage"
  | "earlyRegistrationDeadlineTime"
  | "tournamentMorningRegistrationOpensAt"
  | "tournamentMorningRegistrationClosesAt"
> &
  Partial<
    Pick<
      Tournament,
      | "tournamentStatus"
      | "statusMessage"
      | "statusUpdatedAt"
      | "rescheduledDate"
      | "safeLightOverride"
      | "safeLightOverridePublicMessage"
      | "earlyRegistrationDeadlineTime"
      | "tournamentMorningRegistrationOpensAt"
      | "tournamentMorningRegistrationClosesAt"
    >
  >;

const tournamentSeeds: readonly TournamentSeed[] = [
  {
    slug: "eagle-mountain-2026",
    name: "Eagle Mountain",
    season: "2026-2027",
    lake: "Eagle Mountain",
    venue: "Twin Points Park",
    city: "Azle",
    date: "2026-11-01",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "open",
    registrationUrl: null,
    resultsAvailable: false,
    featured: true,
    heroImage: "/images/lakes/eagle-mountain.jfif",
    thumbnailImage: "/images/lakes/eagle-mountain.jfif",
    livestreamAvailable: false,
  },
  {
    slug: "squaw-creek-2026",
    name: "Squaw Creek",
    season: "2026-2027",
    lake: "Squaw Creek",
    venue: "Public Ramp",
    city: "Glen Rose",
    date: "2026-11-22",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "open",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/squaw-creek.jfif",
    thumbnailImage: "/images/lakes/squaw-creek.jfif",
    livestreamAvailable: false,
  },
  {
    slug: "ray-hubbard-2026",
    name: "Ray Hubbard",
    season: "2026-2027",
    lake: "Ray Hubbard",
    venue: "Public Ramp",
    city: "Rockwall",
    date: "2026-12-13",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "open",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/ray-hubbard.jfif",
    thumbnailImage: "/images/lakes/ray-hubbard.jfif",
    livestreamAvailable: false,
  },
  {
    slug: "granbury-2027",
    name: "Granbury",
    season: "2026-2027",
    lake: "Granbury",
    venue: null,
    city: null,
    date: "2027-01-17",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/granbury.jfif",
    thumbnailImage: "/images/lakes/granbury.jfif",
    livestreamAvailable: false,
  },
  {
    slug: "squaw-creek-2027",
    name: "Squaw Creek",
    season: "2026-2027",
    lake: "Squaw Creek",
    venue: null,
    city: null,
    date: "2027-02-14",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/squaw-creek.jfif",
    thumbnailImage: "/images/lakes/squaw-creek.jfif",
    livestreamAvailable: false,
  },
  {
    slug: "eagle-mountain-2027",
    name: "Eagle Mountain",
    season: "2026-2027",
    lake: "Eagle Mountain",
    venue: null,
    city: null,
    date: "2027-03-14",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/eagle-mountain.jfif",
    thumbnailImage: "/images/lakes/eagle-mountain.jfif",
    livestreamAvailable: false,
  },
  {
    slug: "ray-roberts-2027",
    name: "Ray Roberts",
    season: "2026-2027",
    lake: "Ray Roberts",
    venue: null,
    city: null,
    date: "2027-04-25",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/ray-roberts.jfif",
    thumbnailImage: "/images/lakes/ray-roberts.jfif",
    livestreamAvailable: false,
  },
  {
    slug: "tawakoni-2027",
    name: "Tawakoni",
    season: "2026-2027",
    lake: "Tawakoni",
    venue: null,
    city: null,
    date: "2027-05-16",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/tawakoni.jfif",
    thumbnailImage: "/images/lakes/tawakoni.jfif",
    livestreamAvailable: false,
  },
  {
    slug: "lewisville-2027",
    name: "Lewisville",
    season: "2026-2027",
    lake: "Lewisville",
    venue: null,
    city: null,
    date: "2027-06-13",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/lewisville-lake.jfif",
    thumbnailImage: "/images/lakes/lewisville-lake.jfif",
    livestreamAvailable: false,
  },
  {
    slug: "ray-roberts-2027-07",
    name: "Ray Roberts",
    season: "2026-2027",
    lake: "Ray Roberts",
    venue: null,
    city: null,
    date: "2027-07-11",
    description: TOURNAMENT_DESCRIPTION,
    status: "upcoming",
    registrationStatus: "unavailable",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: "/images/lakes/ray-roberts.jfif",
    thumbnailImage: "/images/lakes/ray-roberts.jfif",
    livestreamAvailable: false,
  },
];

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
      tournament.tournamentMorningRegistrationOpensAt ?? null,
    tournamentMorningRegistrationClosesAt:
      tournament.tournamentMorningRegistrationClosesAt ?? null,
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
