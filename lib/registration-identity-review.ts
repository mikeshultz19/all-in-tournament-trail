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
  reviewKind: "identity" | "contact" | "membership";
  submittedMembership: "current" | "joining" | "non-member" | null;
  submittedContact: RegistrationContact | null;
  existingContact: RegistrationContact | null;
  differingFields: string[];
}

export interface RegistrationReviewAnglerOption extends Angler {
  membershipStatus: "active" | "inactive" | null;
  membershipEffectiveDate: string | null;
}

export interface RegistrationContact {
  firstName: string; lastName: string; streetAddress: string; city: string;
  state: string; zipCode: string; email: string; phone: string;
  membership?: "current" | "joining" | "non-member";
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
  review_kind: "identity" | "contact" | "membership";
  submitted_membership: "current" | "joining" | "non-member" | null;
  submitted_contact: RegistrationContact | null;
  existing_contact: RegistrationContact | null;
  differing_fields: string[] | null;
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
      "id,participant_position,original_display_name,original_email,original_phone,review_reason,review_status,canonical_angler_id,review_note,review_kind,submitted_membership,submitted_contact,existing_contact,differing_fields,registration:tournament_registrations!inner(id,tournament_id,registered_at,registration_type,tournament:tournaments!inner(name)),candidates:registration_identity_review_candidates(angler:anglers(*))",
    )
    .eq("registration.registration_status", "active")
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
    reviewKind: row.review_kind,
    submittedMembership: row.submitted_membership,
    submittedContact: row.submitted_contact,
    existingContact: row.existing_contact,
    differingFields: row.differing_fields ?? [],
  }));
}

export async function listReviewAnglerOptions(tournamentId: string): Promise<RegistrationReviewAnglerOption[]> {
  const supabase = createSupabaseServerClient();
  const [{ data, error }, { data: tournament, error: tournamentError }] = await Promise.all([
    supabase.from("anglers").select("*").eq("is_active", true).is("merged_into_angler_id", null).order("display_name"),
    supabase.from("tournaments").select("season_id").eq("id", tournamentId).single(),
  ]);
  if (error || tournamentError || !tournament?.season_id) {
    throw new RegistrationIdentityReviewError(
      "Angler choices could not be loaded.",
      { cause: error ?? tournamentError },
    );
  }
  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("angler_id,status,effective_date")
    .eq("season_id", tournament.season_id);
  if (membershipError) throw new RegistrationIdentityReviewError("Membership details could not be loaded.", { cause: membershipError });
  const membershipsByAngler = new Map((memberships ?? []).map((membership) => [membership.angler_id, membership]));
  return (data ?? []).map((angler) => {
    const membership = membershipsByAngler.get(angler.id);
    return {
      ...angler,
      membershipStatus: membership?.status === "active" || membership?.status === "inactive" ? membership.status : null,
      membershipEffectiveDate: membership?.effective_date ?? null,
    };
  });
}

export async function getRegistrationReviewPendingCount(): Promise<number> {
  const supabase = createSupabaseServerClient();
  const { count, error } = await supabase
    .from("tournament_registrations")
    .select("id", { count: "exact", head: true })
    .eq("registration_status", "active")
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
    .eq("tournament_id", tournamentId)
    .eq("registration_status", "active");
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
      "The registration identity review could not be saved.",
      { cause: error },
    );
  }
  return data;
}

export async function resolveRegistrationContactReview(input: {
  reviewId: string;
  approve: boolean;
  adminUserId: string;
  reviewNote?: string | null;
}): Promise<void> {
  const { error } = await createSupabaseServerClient().rpc(
    "admin_resolve_registration_contact_review",
    { p_review_id: input.reviewId, p_approve_update: input.approve, p_admin_user_id: input.adminUserId, p_review_note: input.reviewNote ?? null },
  );
  if (error) throw new RegistrationIdentityReviewError("The member contact review could not be saved.", { cause: error });
}

export async function resolveHistoricalMembershipReview(input: { reviewId: string; membership: "current" | "joining" | "non-member"; adminUserId: string; reviewNote?: string | null }): Promise<void> {
  const { error } = await createSupabaseServerClient().rpc("admin_resolve_historical_membership_review", { p_review_id: input.reviewId, p_submitted_membership: input.membership, p_admin_user_id: input.adminUserId, p_review_note: input.reviewNote ?? null });
  if (error) throw new RegistrationIdentityReviewError("The historical membership review could not be saved.", { cause: error });
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
