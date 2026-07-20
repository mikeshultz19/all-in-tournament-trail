export type TournamentStatus =
  | "upcoming"
  | "live"
  | "unofficial"
  | "official";

export interface Tournament {
  id: string;
  slug: string;

  season: string;

  lake: string;
  city: string;

  date: string;

  launchSite: string;

  status: TournamentStatus;

  featured: boolean;

  registrationOpen: boolean;

  resultsAvailable: boolean;

  livestream: boolean;

  heroImage: string;
}

export const tournaments: Tournament[] = [
  {
    id: "eagle-mountain-2026",
    slug: "eagle-mountain-2026",
    season: "2026-2027",

    lake: "Eagle Mountain",
    city: "Azle",

    date: "2026-11-01",

    launchSite: "Twin Points Park",

    status: "upcoming",

    featured: true,

    registrationOpen: true,

    resultsAvailable: false,

    livestream: false,

    heroImage: "/images/lakes/eagle-mountain.jpg",
  },

  {
    id: "squaw-creek-2026",
    slug: "squaw-creek-2026",
    season: "2026-2027",

    lake: "Squaw Creek",
    city: "Glen Rose",

    date: "2026-11-22",

    launchSite: "Public Ramp",

    status: "upcoming",

    featured: false,

    registrationOpen: true,

    resultsAvailable: false,

    livestream: false,

    heroImage: "/images/lakes/squaw-creek.jpg",
  },

  {
    id: "ray-hubbard-2026",
    slug: "ray-hubbard-2026",
    season: "2026-2027",

    lake: "Ray Hubbard",
    city: "Rockwall",

    date: "2026-12-13",

    launchSite: "Public Ramp",

    status: "upcoming",

    featured: false,

    registrationOpen: true,

    resultsAvailable: false,

    livestream: false,

    heroImage: "/images/lakes/ray-hubbard.jpg",
  },
];