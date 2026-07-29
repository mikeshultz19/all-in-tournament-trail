import type {
  Angler,
  Membership,
  Season,
  Team,
  TeamMember,
  TournamentRegistration,
} from "@/types/aoy";
import type {
  Tournament,
  TournamentUpdate,
} from "@/types/tournament";
import type {
  ImportedCompetitiveIdentity,
  SourceAnglerIdentity,
} from "@/types/identity-reconciliation";

type GeneratedTable<
  Row,
  Insert = Omit<Row, "id" | "created_at" | "updated_at"> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  },
  Update = Partial<Insert>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      tournaments: GeneratedTable<
        Tournament,
        Omit<Tournament, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        },
        TournamentUpdate
      >;
      seasons: GeneratedTable<Season>;
      anglers: GeneratedTable<Angler>;
      memberships: GeneratedTable<Membership>;
      teams: GeneratedTable<Team>;
      team_members: GeneratedTable<
        TeamMember,
        Omit<TeamMember, "created_at"> & { created_at?: string },
        Partial<Omit<TeamMember, "created_at">>
      >;
      tournament_registrations: GeneratedTable<
        TournamentRegistration,
        Omit<
          TournamentRegistration,
          | "id"
          | "created_at"
          | "updated_at"
          | "competitive_record_id"
          | "angler1_id"
          | "membership_snapshot"
          | "price_snapshot"
          | "payment_reference"
          | "rules_version"
          | "waiver_version"
          | "rules_accepted_at"
          | "identity_review_status"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          competitive_record_id: string;
          angler1_id: string;
          membership_snapshot: unknown[];
          price_snapshot: Record<string, unknown>;
          payment_reference: string;
          rules_version: string;
          waiver_version: string;
          rules_accepted_at: string;
          identity_review_status?: TournamentRegistration["identity_review_status"];
        }
      >;
      source_angler_identities: GeneratedTable<SourceAnglerIdentity>;
      source_angler_identity_candidates: GeneratedTable<{
        source_identity_id: string;
        angler_id: string;
        match_method: string;
        created_at: string;
      }, {
        source_identity_id: string;
        angler_id: string;
        match_method: string;
        created_at?: string;
      }>;
      imported_competitive_identities:
        GeneratedTable<ImportedCompetitiveIdentity>;
      imported_competitive_identity_members: GeneratedTable<{
        imported_identity_id: string;
        source_identity_id: string;
        source_position: 1 | 2;
        created_at: string;
      }, {
        imported_identity_id: string;
        source_identity_id: string;
        source_position: 1 | 2;
        created_at?: string;
      }>;
      imported_competitive_identity_candidates: GeneratedTable<{
        imported_identity_id: string;
        competitive_record_id: string;
        match_method: string;
        created_at: string;
      }, {
        imported_identity_id: string;
        competitive_record_id: string;
        match_method: string;
        created_at?: string;
      }>;
      registration_identity_reviews: GeneratedTable<{
        id: string;
        registration_id: string;
        participant_position: 1 | 2;
        original_first_name: string;
        original_last_name: string;
        original_display_name: string;
        original_email: string | null;
        original_phone: string | null;
        canonical_angler_id: string | null;
        review_status: TournamentRegistration["identity_review_status"];
        review_reason: string;
        resolution_method: string | null;
        review_note: string | null;
        resolved_at: string | null;
        resolved_by_admin_id: string | null;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: {
      current_aoy_standings: {
        Row: {
          id: string;
          calculation_run_id: string;
          season_id: string;
          rank: number;
          competitive_record_id: string;
          display_name: string;
          record_type: Team["record_type"];
          canonical_members: unknown[];
          total_counted_points: number;
          counted_tournament_count: number;
          official_participation_count: number;
          wins: number;
          top_tens: number;
          total_official_season_weight: number;
          counted_performance_ids: string[];
          dropped_performance_ids: string[];
          tie_status: "resolved" | "unresolved";
          tie_break_details: Record<string, unknown>;
          calculated_at: string;
        };
        Relationships: [];
      };
      current_aoy_performances: {
        Row: Record<string, unknown>;
        Relationships: [];
      };
      current_championship_qualifications: {
        Row: {
          id: string;
          calculation_run_id: string;
          season_id: string;
          competitive_record_id: string;
          display_name: string;
          record_type: Team["record_type"];
          canonical_members: unknown[];
          official_participations: number;
          qualifying_tournament_numbers: number[];
          nonqualifying_official_result_ids: string[];
          remaining_participation_count: number;
          uncredited_regular_season_numbers: number[];
          qualification_status: "qualified" | "not_qualified";
          qualified_at: string | null;
          calculated_at: string;
        };
        Relationships: [];
      };
      current_championship_participations: {
        Row: Record<string, unknown>;
        Relationships: [];
      };
    };
    Functions: {
      create_competitive_record: {
        Args: {
          p_season_id: string;
          p_record_type: Team["record_type"];
          p_angler_ids: string[];
          p_display_name?: string | null;
        };
        Returns: Team;
      };
      complete_durable_registration: {
        Args: {
          p_tournament_id: string;
          p_registration_type: Team["record_type"];
          p_anglers: unknown[];
          p_options: Record<string, unknown>;
          p_payment_reference: string;
          p_rules_version: string;
          p_waiver_version: string;
          p_price_snapshot: Record<string, unknown>;
        };
        Returns: TournamentRegistration;
      };
      record_imported_competitive_identity: {
        Args: {
          p_source_system: string;
          p_source_entry_key: string;
          p_tournament_id: string;
          p_record_type: Team["record_type"];
          p_source_participants: unknown[];
          p_source_metadata?: Record<string, unknown>;
        };
        Returns: ImportedCompetitiveIdentity;
      };
      resolve_source_angler_identity: {
        Args: {
          p_source_identity_id: string;
          p_angler_id: string | null;
          p_decision: "confirmed" | "rejected";
          p_resolution_method: string;
          p_admin_user_id: string;
        };
        Returns: SourceAnglerIdentity;
      };
      set_source_identity_candidates: {
        Args: {
          p_source_identity_id: string;
          p_status: "unresolved" | "suggested" | "review_required";
          p_candidate_angler_ids: string[];
          p_match_method: string;
        };
        Returns: SourceAnglerIdentity;
      };
      set_imported_identity_candidates: {
        Args: {
          p_imported_identity_id: string;
          p_status: "unresolved" | "suggested" | "review_required";
          p_candidate_record_ids: string[];
          p_match_method: string;
        };
        Returns: ImportedCompetitiveIdentity;
      };
      resolve_imported_competitive_identity: {
        Args: {
          p_imported_identity_id: string;
          p_competitive_record_id: string | null;
          p_registration_id: string | null;
          p_decision: "confirmed" | "rejected";
          p_resolution_method: string;
          p_admin_user_id: string;
        };
        Returns: ImportedCompetitiveIdentity;
      };
      complete_registration_for_identity_review: {
        Args: {
          p_tournament_id: string;
          p_registration_type: Team["record_type"];
          p_anglers: unknown[];
          p_options: Record<string, unknown>;
          p_payment_reference: string;
          p_rules_version: string;
          p_waiver_version: string;
          p_price_snapshot: Record<string, unknown>;
          p_classification: unknown[];
        };
        Returns: TournamentRegistration;
      };
      admin_resolve_registration_identity: {
        Args: {
          p_review_id: string;
          p_resolution: "existing" | "new";
          p_existing_angler_id: string | null;
          p_admin_user_id: string;
          p_review_note?: string | null;
        };
        Returns: TournamentRegistration;
      };
      admin_reopen_registration_identity_review: {
        Args: {
          p_review_id: string;
          p_admin_user_id: string;
          p_review_note?: string | null;
        };
        Returns: TournamentRegistration;
      };
      import_working_results: {
        Args: {
          p_tournament_id: string;
          p_entries: unknown[];
          p_admin_user_id: string;
        };
        Returns: number;
      };
      replace_aoy_projection: {
        Args: {
          p_season_id: string;
          p_source_fingerprint: string;
          p_calculation_version: string;
          p_performances: Record<string, unknown>[];
          p_standings: Record<string, unknown>[];
          p_admin_user_id: string;
        };
        Returns: string;
      };
      replace_championship_qualification_projection: {
        Args: {
          p_season_id: string;
          p_source_fingerprint: string;
          p_calculation_version: string;
          p_participations: Record<string, unknown>[];
          p_qualifications: Record<string, unknown>[];
          p_admin_user_id: string;
        };
        Returns: string;
      };
      review_working_result_history: {
        Args: {
          p_result_entry_id: string;
          p_registration_id: string;
          p_participation_status:
            | "participated"
            | "withdrew_after_start"
            | "no_show"
            | "disqualified";
          p_aoy_eligible: boolean;
          p_eligibility_reason: string;
          p_admin_user_id: string;
        };
        Returns: Record<string, unknown>;
      };
      correct_official_result_history: {
        Args: {
          p_official_result_entry_id: string;
          p_registration_id: string;
          p_participation_status:
            | "participated"
            | "withdrew_after_start"
            | "no_show"
            | "disqualified";
          p_aoy_eligible: boolean;
          p_eligibility_reason: string;
          p_reason: string;
          p_admin_user_id: string;
        };
        Returns: Record<string, unknown>;
      };
      publish_official_results: {
        Args: {
          p_tournament_id: string;
          p_admin_user_id: string;
        };
        Returns: Tournament;
      };
      correct_official_result: {
        Args: {
          p_official_result_entry_id: string;
          p_changes: Record<string, unknown>;
          p_reason: string;
          p_admin_user_id: string;
        };
        Returns: Record<string, unknown>;
      };
      correct_working_result: {
        Args: {
          p_result_entry_id: string;
          p_changes: Record<string, unknown>;
          p_reason: string;
          p_admin_user_id: string;
        };
        Returns: Record<string, unknown>;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
