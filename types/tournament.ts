export const TOURNAMENT_STATUSES = [
  "Scheduled",
  "Registration Open",
  "Registration Closed",
  "Postponed",
  "Cancelled",
  "Tournament Day",
  "Results Published",
] as const;

export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  lake: string;
  tournament_date: string;
  ramp: string | null;
  launch_type: string | null;
  morning_registration: string | null;
  registration_opens: string | null;
  registration_closes: string | null;
  status: TournamentStatus;
  description: string | null;
  hero_image_url: string | null;
  is_featured: boolean;
  show_on_homepage: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export type TournamentUpdate = Partial<
  Pick<
    Tournament,
    | "name"
    | "lake"
    | "tournament_date"
    | "ramp"
    | "launch_type"
    | "morning_registration"
    | "registration_opens"
    | "registration_closes"
    | "status"
    | "description"
    | "hero_image_url"
    | "is_featured"
    | "show_on_homepage"
    | "updated_by"
  >
>;

export interface TournamentFormValues {
  name: string;
  lake: string;
  tournamentDate: string;
  description: string;
  ramp: string;
  launchType: string;
  morningRegistration: string;
  registrationOpens: string;
  registrationCloses: string;
  status: TournamentStatus;
  heroImageUrl: string;
  isFeatured: boolean;
  showOnHomepage: boolean;
}

export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: Tournament;
        Insert: Omit<Tournament, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: TournamentUpdate;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
