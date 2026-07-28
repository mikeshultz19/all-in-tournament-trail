export const MEMBERSHIP_STATUSES = [
  "active",
  "cancelled",
  "refunded",
] as const;

export type MembershipStatus =
  (typeof MEMBERSHIP_STATUSES)[number];

export const TOURNAMENT_EVENT_TYPES = [
  "regular_season",
  "championship",
] as const;

export type TournamentEventType =
  (typeof TOURNAMENT_EVENT_TYPES)[number];

export const IDENTITY_RECONCILIATION_STATUSES = [
  "unresolved",
  "matched",
  "confirmed_new",
] as const;

export type IdentityReconciliationStatus =
  (typeof IDENTITY_RECONCILIATION_STATUSES)[number];

export interface Season {
  id: string;
  year: number;
  name: string;
  slug: string;
  regular_season_start_date: string | null;
  regular_season_end_date: string | null;
  championship_start_date: string | null;
  championship_end_date: string | null;
  membership_sales_open: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Angler {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  normalized_name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  merged_into_angler_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  angler_id: string;
  season_id: string;
  status: MembershipStatus;
  effective_date: string;
  first_eligible_tournament_id: string | null;
  source: string | null;
  payment_reference: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  season_id: string;
  display_name: string | null;
  canonical_member_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  team_id: string;
  angler_id: string;
  member_position: 1 | 2;
  created_at: string;
}

export interface TeamWithMembers extends Team {
  members: Array<TeamMember & { angler: Angler }>;
}

export type CreateAnglerInput = Pick<
  Angler,
  "first_name" | "last_name"
> &
  Partial<Pick<Angler, "display_name" | "email" | "phone">>;

export type CreateOrUpdateMembershipInput = Pick<
  Membership,
  "angler_id" | "season_id" | "status" | "effective_date"
> &
  Partial<
    Pick<
      Membership,
      | "source"
      | "payment_reference"
      | "admin_notes"
      | "first_eligible_tournament_id"
    >
  >;

export interface AdminMemberListRow {
  membership_id: string;
  angler_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  membership_status: MembershipStatus;
  season_id: string;
  season_name: string;
  first_eligible_tournament_id: string | null;
  first_eligible_tournament_name: string | null;
  effective_date: string;
  updated_at: string;
}

export interface CreateTeamInput {
  seasonId: string;
  anglerIds: string[];
  displayName?: string | null;
}
