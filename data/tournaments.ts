export type TournamentStatus =
  | "upcoming"
  | "live"
  | "unofficial"
  | "official";

export type RegistrationStatus = "open" | "closed" | "unavailable";

export interface Tournament {
  slug: string;
  name: string;
  season: string;
  lake: string;
  venue: string;
  city: string;
  date: string;
  status: TournamentStatus;
  registrationStatus: RegistrationStatus;
  registrationUrl: string | null;
  resultsAvailable: boolean;
  featured: boolean;
  heroImage: string | null;
  livestreamAvailable: boolean;
}

export const TOURNAMENT_IMAGE_FALLBACK = "/images/tournament-hero.png";

export const tournaments: readonly Tournament[] = [
  {
    slug: "eagle-mountain-2026",
    name: "Eagle Mountain",
    season: "2026-2027",
    lake: "Eagle Mountain",
    venue: "Twin Points Park",
    city: "Azle",
    date: "2026-11-01",
    status: "upcoming",
    registrationStatus: "open",
    registrationUrl: null,
    resultsAvailable: false,
    featured: true,
    heroImage: "/images/featured-tournament.png",
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
    status: "upcoming",
    registrationStatus: "open",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: null,
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
    status: "upcoming",
    registrationStatus: "open",
    registrationUrl: null,
    resultsAvailable: false,
    featured: false,
    heroImage: null,
    livestreamAvailable: false,
  },
];

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

export function getTournamentImage(tournament: Tournament): string {
  return tournament.heroImage ?? TOURNAMENT_IMAGE_FALLBACK;
}
