import "server-only";

import {
  prepareImportedParticipant,
  type ImportedParticipant,
} from "@/lib/identity-reconciliation-core";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCompetitiveRecord } from "@/lib/teams";
import type { CompetitiveRecordType } from "@/types/aoy";
import type {
  ImportedCompetitiveIdentity,
  SourceAnglerIdentity,
} from "@/types/identity-reconciliation";

export class IdentityReconciliationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "AITT_IDENTITY_REVIEW_REQUIRED"
      | "AITT_IDENTITY_NOT_FOUND"
      | "AITT_IDENTITY_SAVE_FAILED",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "IdentityReconciliationError";
  }
}

export interface RecordImportedIdentityInput {
  sourceSystem: string;
  sourceEntryKey: string;
  tournamentId: string;
  recordType: CompetitiveRecordType;
  participants: ImportedParticipant[];
  sourceMetadata?: Record<string, unknown>;
}

export async function recordImportedCompetitiveIdentity(
  input: RecordImportedIdentityInput,
): Promise<ImportedCompetitiveIdentity> {
  const preparedParticipants = input.participants.map((participant) =>
    prepareImportedParticipant(input.sourceSystem, participant),
  );
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "record_imported_competitive_identity",
    {
      p_source_system: input.sourceSystem.trim().toLowerCase(),
      p_source_entry_key: input.sourceEntryKey.trim(),
      p_tournament_id: input.tournamentId,
      p_record_type: input.recordType,
      p_source_participants: preparedParticipants,
      p_source_metadata: input.sourceMetadata ?? {},
    },
  );

  if (error || !data) {
    throw new IdentityReconciliationError(
      "The imported identity could not be recorded.",
      "AITT_IDENTITY_SAVE_FAILED",
      { cause: error },
    );
  }

  return data;
}

export async function getSourceIdentity(
  sourceIdentityId: string,
): Promise<SourceAnglerIdentity | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("source_angler_identities")
    .select("*")
    .eq("id", sourceIdentityId)
    .maybeSingle();

  if (error) {
    throw new IdentityReconciliationError(
      "The source identity could not be loaded.",
      "AITT_IDENTITY_SAVE_FAILED",
      { cause: error },
    );
  }

  return data;
}

export async function resolveSourceIdentity(
  sourceIdentityId: string,
  decision: "confirmed" | "rejected",
  anglerId: string | null,
  adminUserId: string,
  method:
    | "admin_confirmation"
    | "admin_reassignment"
    | "admin_rejection",
): Promise<SourceAnglerIdentity> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "resolve_source_angler_identity",
    {
      p_source_identity_id: sourceIdentityId,
      p_angler_id: decision === "confirmed" ? anglerId : null,
      p_decision: decision,
      p_resolution_method: method,
      p_admin_user_id: adminUserId,
    },
  );

  if (error || !data) {
    throw new IdentityReconciliationError(
      "The source identity resolution could not be saved.",
      "AITT_IDENTITY_SAVE_FAILED",
      { cause: error },
    );
  }

  return data;
}

export async function saveSourceIdentityCandidates(input: {
  sourceIdentityId: string;
  status: "unresolved" | "suggested" | "review_required";
  anglerIds: string[];
  matchMethod: string;
}): Promise<SourceAnglerIdentity> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "set_source_identity_candidates",
    {
      p_source_identity_id: input.sourceIdentityId,
      p_status: input.status,
      p_candidate_angler_ids: input.anglerIds,
      p_match_method: input.matchMethod,
    },
  );

  if (error || !data) {
    throw new IdentityReconciliationError(
      "Identity candidates could not be saved.",
      "AITT_IDENTITY_SAVE_FAILED",
      { cause: error },
    );
  }

  return data;
}

export async function resolveImportedIdentity(
  importedIdentityId: string,
  decision: "confirmed" | "rejected",
  competitiveRecordId: string | null,
  registrationId: string | null,
  adminUserId: string,
  method:
    | "registration"
    | "canonical_members"
    | "admin_confirmation"
    | "admin_reassignment"
    | "admin_rejection",
): Promise<ImportedCompetitiveIdentity> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "resolve_imported_competitive_identity",
    {
      p_imported_identity_id: importedIdentityId,
      p_competitive_record_id:
        decision === "confirmed" ? competitiveRecordId : null,
      p_registration_id:
        decision === "confirmed" ? registrationId : null,
      p_decision: decision,
      p_resolution_method: method,
      p_admin_user_id: adminUserId,
    },
  );

  if (error || !data) {
    const reviewRequired =
      error?.message?.includes("AITT_IDENTITY_REVIEW_REQUIRED") ||
      error?.message?.includes(
        "AITT_IDENTITY_COMPETITIVE_RECORD_MEMBERS_MISMATCH",
      );

    throw new IdentityReconciliationError(
      reviewRequired
        ? "Administrative identity review is required."
        : "The imported Competitive Record resolution could not be saved.",
      reviewRequired
        ? "AITT_IDENTITY_REVIEW_REQUIRED"
        : "AITT_IDENTITY_SAVE_FAILED",
      { cause: error },
    );
  }

  return data;
}

export async function createAndResolveImportedIdentity(input: {
  importedIdentityId: string;
  seasonId: string;
  recordType: CompetitiveRecordType;
  anglerIds: string[];
  displayName?: string | null;
  adminUserId: string;
}): Promise<ImportedCompetitiveIdentity> {
  const record = await createCompetitiveRecord({
    seasonId: input.seasonId,
    recordType: input.recordType,
    anglerIds: input.anglerIds,
    displayName: input.displayName,
  });

  return resolveImportedIdentity(
    input.importedIdentityId,
    "confirmed",
    record.id,
    null,
    input.adminUserId,
    "canonical_members",
  );
}

export async function saveImportedIdentityCandidates(input: {
  importedIdentityId: string;
  status: "unresolved" | "suggested" | "review_required";
  competitiveRecordIds: string[];
  matchMethod: string;
}): Promise<ImportedCompetitiveIdentity> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "set_imported_identity_candidates",
    {
      p_imported_identity_id: input.importedIdentityId,
      p_status: input.status,
      p_candidate_record_ids: input.competitiveRecordIds,
      p_match_method: input.matchMethod,
    },
  );

  if (error || !data) {
    throw new IdentityReconciliationError(
      "Competitive Record candidates could not be saved.",
      "AITT_IDENTITY_SAVE_FAILED",
      { cause: error },
    );
  }

  return data;
}
