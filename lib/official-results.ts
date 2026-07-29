import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tournament } from "@/types/tournament";

export class OfficialResultsError extends Error {
  constructor(
    message: string,
    readonly code:
      | "identity_review_required"
      | "invalid_tournament"
      | "validation_failed"
      | "historical_review_required"
      | "immutable"
      | "save_failed",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "OfficialResultsError";
  }
}

function publicationError(error: { message?: string } | null): OfficialResultsError {
  const message = error?.message ?? "";
  if (message.includes("IDENTITY_REVIEW_REQUIRED")) {
    return new OfficialResultsError(
      "Complete Registration Review before publishing Official Results.",
      "identity_review_required",
      { cause: error },
    );
  }
  if (
    message.includes("INVALID_SEASON") ||
    message.includes("INVALID_TOURNAMENT_NUMBER")
  ) {
    return new OfficialResultsError(
      "The tournament season or immutable tournament number is invalid.",
      "invalid_tournament",
      { cause: error },
    );
  }
  if (message.includes("IMMUTABLE")) {
    return new OfficialResultsError(
      "Official Results are already published and cannot be edited normally.",
      "immutable",
      { cause: error },
    );
  }
  if (message.includes("HISTORICAL_REVIEW_REQUIRED")) {
    return new OfficialResultsError(
      "Review registration ownership, participation, and historical eligibility for every result before publication.",
      "historical_review_required",
      { cause: error },
    );
  }
  if (message.includes("VALIDATION_FAILED")) {
    return new OfficialResultsError(
      "Working Results are incomplete or contain unresolved identities.",
      "validation_failed",
      { cause: error },
    );
  }
  return new OfficialResultsError(
    "Official Results could not be published.",
    "save_failed",
    { cause: error },
  );
}

export async function publishOfficialResults(
  tournamentId: string,
  adminUserId: string,
): Promise<Tournament> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("publish_official_results", {
    p_tournament_id: tournamentId,
    p_admin_user_id: adminUserId,
  });
  if (error || !data) throw publicationError(error);
  return data;
}

export async function correctOfficialResult(input: {
  officialResultEntryId: string;
  changes: Record<string, unknown>;
  reason: string;
  adminUserId: string;
}): Promise<void> {
  if (!input.reason.trim()) {
    throw new OfficialResultsError(
      "A documented correction reason is required.",
      "validation_failed",
    );
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("correct_official_result", {
    p_official_result_entry_id: input.officialResultEntryId,
    p_changes: input.changes,
    p_reason: input.reason.trim(),
    p_admin_user_id: input.adminUserId,
  });
  if (error) throw publicationError(error);
}

export async function correctWorkingResult(input: {
  resultEntryId: string;
  changes: Record<string, unknown>;
  reason: string;
  adminUserId: string;
}): Promise<void> {
  if (!input.reason.trim()) {
    throw new OfficialResultsError(
      "A documented working-result correction reason is required.",
      "validation_failed",
    );
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("correct_working_result", {
    p_result_entry_id: input.resultEntryId,
    p_changes: input.changes,
    p_reason: input.reason.trim(),
    p_admin_user_id: input.adminUserId,
  });
  if (error) throw publicationError(error);
}

export type OfficialParticipationStatus =
  | "participated"
  | "withdrew_after_start"
  | "no_show"
  | "disqualified";

export async function reviewWorkingResultHistory(input: {
  resultEntryId: string;
  registrationId: string;
  participationStatus: OfficialParticipationStatus;
  aoyEligible: boolean;
  eligibilityReason: string;
  adminUserId: string;
}): Promise<void> {
  if (!input.eligibilityReason.trim()) {
    throw new OfficialResultsError(
      "A historical eligibility reason is required.",
      "validation_failed",
    );
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("review_working_result_history", {
    p_result_entry_id: input.resultEntryId,
    p_registration_id: input.registrationId,
    p_participation_status: input.participationStatus,
    p_aoy_eligible: input.aoyEligible,
    p_eligibility_reason: input.eligibilityReason.trim(),
    p_admin_user_id: input.adminUserId,
  });
  if (error) throw publicationError(error);
}

export async function correctOfficialResultHistory(input: {
  officialResultEntryId: string;
  registrationId: string;
  participationStatus: OfficialParticipationStatus;
  aoyEligible: boolean;
  eligibilityReason: string;
  reason: string;
  adminUserId: string;
}): Promise<void> {
  if (!input.reason.trim() || !input.eligibilityReason.trim()) {
    throw new OfficialResultsError(
      "Correction and eligibility reasons are required.",
      "validation_failed",
    );
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("correct_official_result_history", {
    p_official_result_entry_id: input.officialResultEntryId,
    p_registration_id: input.registrationId,
    p_participation_status: input.participationStatus,
    p_aoy_eligible: input.aoyEligible,
    p_eligibility_reason: input.eligibilityReason.trim(),
    p_reason: input.reason.trim(),
    p_admin_user_id: input.adminUserId,
  });
  if (error) throw publicationError(error);
}
