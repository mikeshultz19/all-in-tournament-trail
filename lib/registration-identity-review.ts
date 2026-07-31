import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Angler,
  CompetitiveRecordType,
  TournamentRegistration,
} from "@/types/aoy";
import type { RegistrationIdentityReviewStatus } from "@/lib/registration-identity-review-core";
import { summarizeRegistrationReviewStatuses } from "@/lib/registration-identity-review-core";

export interface RegistrationReviewItem {
  id: string;
  registrationId: string;
  tournamentId: string;
  tournamentName: string;
  registeredAt: string;
  participantPosition: 1 | 2;
  participantName: string;
  email: string | null;
  phone: string | null;
  recordType: CompetitiveRecordType;
  suggestedAnglers: Angler[];
  reason: string;
  status: RegistrationIdentityReviewStatus;
  canonicalAnglerId: string | null;
  reviewNote: string | null;
}

export interface TournamentRegistrationReviewSummary {
  total: number;
  verified: number;
  pending: number;
  resolved: number;
}

export interface RegistrationReviewDashboardSummary {
  pendingReviewCount: number;
  duplicateCount: number;
  membershipMatchCount: number;
}

export class RegistrationIdentityReviewError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RegistrationIdentityReviewError";
  }
}

type ReviewQueryRow = {
  id: string;
  participant_position: 1 | 2;
  original_display_name: string;
  original_email: string | null;
  original_phone: string | null;
  review_reason: string;
  review_status: RegistrationIdentityReviewStatus;
  canonical_angler_id: string | null;
  review_note: string | null;
  registration: {
    id: string;
    tournament_id: string;
    registered_at: string;
    registration_type: CompetitiveRecordType;
    tournament: { name: string };
  };
  candidates: Array<{ angler: Angler }>;
};

export async function listRegistrationReviewItems(
  tournamentId?: string,
): Promise<RegistrationReviewItem[]> {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("registration_identity_reviews")
    .select(
      "id,participant_position,original_display_name,original_email,original_phone,review_reason,review_status,canonical_angler_id,review_note,registration:tournament_registrations!inner(id,tournament_id,registered_at,registration_type,tournament:tournaments!inner(name)),candidates:registration_identity_review_candidates(angler:anglers(*))",
    )
    .order("created_at", { ascending: true });

  if (tournamentId) {
    query = query.eq("registration.tournament_id", tournamentId);
  }

  const { data, error } = await query;
  if (error) {
    throw new RegistrationIdentityReviewError(
      "Registration reviews could not be loaded.",
      { cause: error },
    );
  }

  return ((data ?? []) as unknown as ReviewQueryRow[]).map((row) => ({
    id: row.id,
    registrationId: row.registration.id,
    tournamentId: row.registration.tournament_id,
    tournamentName: row.registration.tournament.name,
    registeredAt: row.registration.registered_at,
    participantPosition: row.participant_position,
    participantName: row.original_display_name,
    email: row.original_email,
    phone: row.original_phone,
    recordType: row.registration.registration_type,
    suggestedAnglers: row.candidates.map((item) => item.angler),
    reason: row.review_reason,
    status: row.review_status,
    canonicalAnglerId: row.canonical_angler_id,
    reviewNote: row.review_note,
  }));
}

export async function listReviewAnglerOptions(): Promise<Angler[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("anglers")
    .select("*")
    .eq("is_active", true)
    .is("merged_into_angler_id", null)
    .order("display_name");
  if (error) {
    throw new RegistrationIdentityReviewError(
      "Angler choices could not be loaded.",
      { cause: error },
    );
  }
  return data ?? [];
}

export async function getRegistrationReviewPendingCount(): Promise<number> {
  const supabase = createSupabaseServerClient();
  const { count, error } = await supabase
    .from("tournament_registrations")
    .select("id", { count: "exact", head: true })
    .eq("identity_review_status", "review_required");
  if (error) {
    throw new RegistrationIdentityReviewError(
      "Pending registration reviews could not be counted.",
      { cause: error },
    );
  }
  return count ?? 0;
}

export function summarizeRegistrationReviewItems(
  items: readonly RegistrationReviewItem[],
): RegistrationReviewDashboardSummary {
  const pending = items.filter((item) => item.status === "review_required");

  return {
    pendingReviewCount: new Set(
      pending.map((item) => item.registrationId),
    ).size,
    duplicateCount: pending.filter(
      (item) => item.suggestedAnglers.length > 0,
    ).length,
    membershipMatchCount: pending.filter((item) =>
      item.reason.toLowerCase().includes("membership"),
    ).length,
  };
}

export async function getRegistrationReviewDashboardSummary(): Promise<RegistrationReviewDashboardSummary> {
  return summarizeRegistrationReviewItems(
    await listRegistrationReviewItems(),
  );
}

export async function getTournamentRegistrationReviewSummary(
  tournamentId: string,
): Promise<TournamentRegistrationReviewSummary> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournament_registrations")
    .select("identity_review_status")
    .eq("tournament_id", tournamentId);
  if (error) {
    throw new RegistrationIdentityReviewError(
      "Tournament review status could not be loaded.",
      { cause: error },
    );
  }

  return summarizeRegistrationReviewStatuses(
    (data ?? []).map(
      (registration) => registration.identity_review_status,
    ),
  );
}

export async function areAllRegistrationIdentitiesVerified(
  tournamentId: string,
): Promise<boolean> {
  const summary = await getTournamentRegistrationReviewSummary(tournamentId);
  return summary.pending === 0;
}

export async function resolveRegistrationIdentityReview(input: {
  reviewId: string;
  resolution: "existing" | "new";
  existingAnglerId: string | null;
  adminUserId: string;
  reviewNote?: string | null;
}): Promise<TournamentRegistration> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "admin_resolve_registration_identity",
    {
      p_review_id: input.reviewId,
      p_resolution: input.resolution,
      p_existing_angler_id: input.existingAnglerId,
      p_admin_user_id: input.adminUserId,
      p_review_note: input.reviewNote ?? null,
    },
  );
  if (error || !data) {
    throw new RegistrationIdentityReviewError(
      error?.message.includes("AITT_REGISTRATION_REVIEW_DUPLICATE_ANGLER")
        ? "A matching Angler already exists. Select the existing Angler instead."
        : "The registration identity review could not be saved.",
      { cause: error },
    );
  }
  return data;
}

export async function reopenRegistrationIdentityReview(input: {
  reviewId: string;
  adminUserId: string;
  reviewNote?: string | null;
}): Promise<TournamentRegistration> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "admin_reopen_registration_identity_review",
    {
      p_review_id: input.reviewId,
      p_admin_user_id: input.adminUserId,
      p_review_note: input.reviewNote ?? null,
    },
  );
  if (error || !data) {
    throw new RegistrationIdentityReviewError(
      "The registration review could not be reopened.",
      { cause: error },
    );
  }
  return data;
}
