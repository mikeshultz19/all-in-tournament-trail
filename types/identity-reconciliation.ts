import type {
  Angler,
  CompetitiveRecordType,
  IdentityReconciliationStatus,
} from "@/types/aoy";

export type IdentityResolutionMethod =
  | "confirmed_alias"
  | "trusted_email"
  | "exact_normalized_name"
  | "registration"
  | "canonical_members"
  | "admin_confirmation"
  | "admin_reassignment"
  | "admin_rejection";

export interface SourceAnglerIdentity {
  id: string;
  source_system: string;
  source_identity_key: string;
  source_display_name: string;
  normalized_name: string;
  source_metadata: Record<string, unknown>;
  angler_id: string | null;
  reconciliation_status: IdentityReconciliationStatus;
  resolution_method: string | null;
  resolved_at: string | null;
  resolved_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportedCompetitiveIdentity {
  id: string;
  source_system: string;
  source_entry_key: string;
  tournament_id: string;
  season_id: string;
  regular_season_number: number | null;
  record_type: CompetitiveRecordType;
  source_participants: Array<Record<string, unknown>>;
  source_metadata: Record<string, unknown>;
  competitive_record_id: string | null;
  registration_id: string | null;
  reconciliation_status: IdentityReconciliationStatus;
  resolution_method: string | null;
  resolved_at: string | null;
  resolved_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdentityCandidate {
  angler: Angler;
  method:
    | "trusted_email"
    | "exact_normalized_name"
    | "partial_name";
}

export type IdentityMatchResult =
  | {
      status: "confirmed";
      anglerId: string;
      method: "confirmed_alias" | "trusted_email" | "exact_normalized_name";
      candidates: IdentityCandidate[];
    }
  | {
      status: "suggested" | "review_required" | "unresolved";
      anglerId: null;
      method: "partial_name" | "ambiguous_exact_match" | "no_match";
      candidates: IdentityCandidate[];
      code?: "AITT_IDENTITY_REVIEW_REQUIRED";
    };
