import type { TournamentEventType } from "@/types/aoy";

export const TOURNAMENT_STATUSES = [
  "Scheduled",
  "Ready for Registration",
  "Registration Open",
  "Registration Closed",
  "Postponed",
  "Cancelled",
  "Tournament Day",
  "Results Published",
] as const;

export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];
export type TournamentResultStatus =
  | "pending"
  | "imported"
  | "under_review"
  | "ready_to_publish"
  | "official";

export interface Tournament {
  id: string;
  season_id: string | null;
  event_type: TournamentEventType;
  regular_season_number: number | null;
  name: string;
  slug: string;
  lake: string;
  capacity: number | null;
  tournament_date: string;
  tournament_end_date: string | null;
  ramp: string | null;
  launch_type: string | null;
  morning_registration: string | null;
  registration_opens: string | null;
  registration_closes: string | null;
  registration_information: string | null;
  non_member_practice_rule: string | null;
  member_practice_rule: string | null;
  practice_information: string | null;
  status: TournamentStatus;
  description: string | null;
  hero_image_url: string | null;
  is_featured: boolean;
  show_on_homepage: boolean;
  insurance_payout: number | null;
  insurance_notes: string | null;
  insurance_reviewed: boolean;
  insurance_reviewed_at: string | null;
  champion_photo_url: string | null;
  champion_photo_path: string | null;
  big_bass_photo_url: string | null;
  big_bass_photo_path: string | null;
  photos_reviewed: boolean;
  photos_reviewed_at: string | null;
  weighfish_imported: boolean;
  weighfish_imported_at: string | null;
  result_status: TournamentResultStatus;
  official_results_published_at: string | null;
  official_results_published_by: string | null;

  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export type TournamentUpdate = Partial<
  Pick<
    Tournament,
    | "season_id"
    | "event_type"
    | "regular_season_number"
    | "name"
    | "lake"
    | "capacity"
    | "tournament_date"
    | "tournament_end_date"
    | "ramp"
    | "launch_type"
    | "morning_registration"
    | "registration_opens"
    | "registration_closes"
    | "registration_information"
    | "non_member_practice_rule"
    | "member_practice_rule"
    | "practice_information"
    | "status"
    | "description"
    | "hero_image_url"
    | "is_featured"
    | "show_on_homepage"
    | "insurance_payout"
    | "insurance_notes"
    | "insurance_reviewed"
    | "insurance_reviewed_at"
    | "champion_photo_url"
    | "champion_photo_path"
    | "big_bass_photo_url"
    | "big_bass_photo_path"
    | "photos_reviewed"
    | "photos_reviewed_at"
    | "weighfish_imported"
    | "weighfish_imported_at"
    | "result_status"
    | "official_results_published_at"
    | "official_results_published_by"
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
  registrationInformation: string;
  practiceInformation: string;
  status: TournamentStatus;
  heroImageUrl: string;
  isFeatured: boolean;
  showOnHomepage: boolean;
}
