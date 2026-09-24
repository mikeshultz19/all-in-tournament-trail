import { createClient } from "@supabase/supabase-js";

import {
  buildManualMembershipCollectionCounts,
  buildTournamentCollectionSummary,
  type RegistrationCollectionRow,
} from "../lib/tournament-collection-calculator";
import { reconcileParticipant } from "./staging-reconciliation-core";

const STAGING_PROJECT_REF = "vcjhufuklqwvnqmarpqi";
const PRODUCTION_PROJECT_REF = "qrmnglzylrrdhcvashmx";
const MANUAL_MARKER = "Manual $40 membership collected at check-in";

type RegistrationRow = RegistrationCollectionRow & {
  boat_number: number | null;
  angler1_id: string | null;
  angler2_id: string | null;
  checked_in_at: string | null;
};

type ReviewRow = {
  id: string;
  registration_id: string;
  participant_position: 1 | 2;
  review_kind: string;
  review_status: string;
  submitted_membership: string | null;
};

type HistoryRow = {
  review_id: string;
  registration_id: string;
  review_note: string | null;
};

type MembershipRow = {
  angler_id: string;
  season_id: string;
  status: string;
};

function argument(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

function fail(message: string): never {
  throw new Error(message);
}

async function read<T>(
  query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const result = await query;
  if (result.error) fail(`staging read failed: ${result.error.message}`);
  return result.data ?? [];
}

async function main(): Promise<void> {
  const projectRef = argument("--project-ref");
  const tournamentId = argument("--tournament-id");
  if (projectRef !== STAGING_PROJECT_REF) fail("Refusing reconciliation: explicit staging project reference is required.");
  if (!tournamentId) fail("Usage: npx tsx scripts/reconcile-staging.ts --project-ref vcjhufuklqwvnqmarpqi --tournament-id <id>");

  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) fail("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided in process-scoped environment variables.");
  if (url.includes(PRODUCTION_PROJECT_REF) || url.includes("all-in-tournament-trail.com")) fail("Refusing reconciliation: production target detected.");
  if (!url.includes(STAGING_PROJECT_REF)) fail("Refusing reconciliation: Supabase URL is not the approved staging project.");

  const client = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const tournaments = await read<{ id: string; season_id: string }>(client.from("tournaments").select("id,season_id").eq("id", tournamentId));
  if (tournaments.length !== 1) fail("Expected exactly one staging tournament.");
  const tournament = tournaments[0];
  if (!tournament) fail("Expected exactly one staging tournament.");
  const seasonId = tournament.season_id;
  const registrations = await read<RegistrationRow>(client.from("tournament_registrations").select("id,tournament_id,boat_number,registration_type,angler1_name,angler2_name,angler1_id,angler2_id,payment_reference,identity_review_status,member_pot,big_bass,insurance,membership_snapshot,price_snapshot,registration_source,payment_method,registration_status,online_payment_state,square_payment_id,checked_in_at").eq("tournament_id", tournamentId));
  const active = registrations.filter((row) => row.registration_status === "active");
  const canceled = registrations.filter((row) => row.registration_status === "cancelled");
  const registrationIds = registrations.map((row) => row.id);
  const reviews = registrationIds.length
    ? await read<ReviewRow>(client.from("registration_identity_reviews").select("registration_id,participant_position,id,review_kind,review_status,submitted_membership").in("registration_id", registrationIds))
    : [];
  const history = registrationIds.length
    ? await read<HistoryRow>(client.from("registration_identity_review_history").select("review_id,registration_id,review_note").in("registration_id", registrationIds))
    : [];
  const memberships = await read<MembershipRow>(client.from("memberships").select("angler_id,season_id,status").eq("season_id", seasonId));
  const activeMemberships = new Set(memberships.filter((row) => row.status === "active").map((row) => row.angler_id));
  const manualCounts = buildManualMembershipCollectionCounts(history);
  const markerReviewIds = history.filter((row) => row.review_note?.startsWith(MANUAL_MARKER)).map((row) => row.review_id);
  const duplicateMarkerEvidence = markerReviewIds.length !== new Set(markerReviewIds).size;
  const reviewsByRegistration = new Map<string, ReviewRow[]>();
  for (const review of reviews) reviewsByRegistration.set(review.registration_id, [...(reviewsByRegistration.get(review.registration_id) ?? []), review]);
  const activeParticipantResults = active.flatMap((row) => ([row.angler1_id, row.angler2_id] as const).flatMap((anglerId, index) => {
    if (!anglerId) return [];
    const registrationId = row.id;
    if (!registrationId) return [];
    const position = (index + 1) as 1 | 2;
    const review = reviewsByRegistration.get(registrationId)?.find((item) => item.participant_position === position);
    const result = reconcileParticipant({
      registrationId,
      boatNumber: row.boat_number,
      participantPosition: position,
      hasActiveCurrentSeasonMembership: activeMemberships.has(anglerId),
      reviewStatus: review?.review_status ?? null,
      reviewKind: review?.review_kind ?? null,
      submittedMembership: review?.submitted_membership ?? null,
      manualCollectionMarkerCount: review ? history.filter((item) => item.review_id === review.id && item.review_note?.startsWith(MANUAL_MARKER)).length : 0,
      checkedIn: Boolean(row.checked_in_at),
    });
    return [{ registrationId, boatNumber: row.boat_number, participantPosition: position, state: result.state, checkInBlocked: result.checkInBlocked, reason: result.reason }];
  }));
  const collection = buildTournamentCollectionSummary(tournamentId, active, undefined, [], activeMemberships, manualCounts);
  const warnings = collection.membershipReconciliationWarnings ?? [];
  const unresolvedDues = reviews.filter((review) => review.review_status === "review_required" && review.review_kind === "membership" && review.submitted_membership === "current");
  const invariantFailures = [
    ...activeParticipantResults.filter((result) => result.state === "invariant_failure").map((result) => `registration ${result.registrationId} participant ${result.participantPosition}: ${result.reason}`),
    ...(duplicateMarkerEvidence ? ["duplicate manual collection evidence exists for a review_id"] : []),
    ...(unresolvedDues.length !== activeParticipantResults.filter((result) => result.state === "actionable" && result.reason === "membership dues remain unresolved").length ? ["Membership Dues count does not equal unresolved dues records"] : []),
    ...(warnings.length ? warnings.map((warning) => `financial warning: ${warning}`) : []),
    ...(active.length !== registrations.filter((row) => row.registration_status === "active").length ? ["active registration projection mismatch"] : []),
  ];
  console.log(JSON.stringify({
    project: STAGING_PROJECT_REF,
    tournamentId,
    readOnly: true,
    counts: { active: active.length, canceled: canceled.length, unresolvedReviews: reviews.filter((review) => review.review_status === "review_required").length, membershipDues: unresolvedDues.length, pendingCheckIn: active.filter((row) => !row.checked_in_at).length },
    registrations: activeParticipantResults,
    financial: { membershipCount: collection.lines.find((line) => line.key === "membership")?.count ?? 0, membershipAmountCents: collection.membershipRevenueCents, totalRegistrationFundsCollectedCents: collection.totalRegistrationFundsCollectedCents, tournamentPayoutFundsCents: collection.totalTournamentPayoutFundsCents, onlineRegistrationFundsCents: collection.onlineRegistrationFundsCents, warnings },
    publicActiveEntryCount: active.length,
    invariantFailures,
  }, null, 2));
  if (invariantFailures.length) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Staging reconciliation failed.");
  process.exitCode = 1;
});
