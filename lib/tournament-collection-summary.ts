import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildManualMembershipCollectionCounts, buildTournamentCollectionSummary, type ImportedCollectionRow, type RegistrationCollectionRow, type TournamentCollectionSummary } from "@/lib/tournament-collection-calculator";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

export type { TournamentCollectionSummary } from "@/lib/tournament-collection-calculator";

export async function listTournamentCollectionSummaries(tournamentIds: readonly string[], insuranceResults: Record<string, TournamentInsurancePotResultRecord>): Promise<Record<string, TournamentCollectionSummary>> {
  if (!tournamentIds.length) return {};
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tournament_registrations")
    .select("id,tournament_id,boat_number,registration_type,angler1_name,angler2_name,angler1_id,angler2_id,payment_reference,identity_review_status,member_pot,big_bass,insurance,membership_snapshot,price_snapshot,registration_source,payment_method,registration_status,online_payment_state,square_payment_id")
    .in("tournament_id", [...tournamentIds])
    .eq("registration_status", "active");
  if (error) throw new Error("Tournament collection records could not be loaded.", { cause: error });
  const registrationIds = (data ?? []).map((row) => row.id);
  const { data: reviewHistory, error: reviewHistoryError } = registrationIds.length
    ? await supabase.from("registration_identity_review_history").select("review_id,registration_id,review_note").in("registration_id", registrationIds)
    : { data: [], error: null };
  if (reviewHistoryError) throw new Error("Membership collection audit records could not be loaded.", { cause: reviewHistoryError });
  const manualMembershipCollectionCounts = buildManualMembershipCollectionCounts(reviewHistory ?? []);
  const { data: tournaments, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id,season_id")
    .in("id", [...tournamentIds]);
  if (tournamentError) throw new Error("Tournament seasons could not be loaded.", { cause: tournamentError });
  const seasonIds = [...new Set((tournaments ?? []).map((tournament) => tournament.season_id).filter((seasonId): seasonId is string => Boolean(seasonId)))];
  const { data: memberships, error: membershipError } = seasonIds.length
    ? await supabase.from("memberships").select("angler_id,season_id,status").in("season_id", seasonIds)
    : { data: [], error: null };
  if (membershipError) throw new Error("Tournament memberships could not be loaded.", { cause: membershipError });
  const { data: imported, error: importedError } = await supabase.from("tournament_result_entries")
    .select("id,tournament_id,registration_id,team_name,participation_status")
    .in("tournament_id", [...tournamentIds]);
  if (importedError) throw new Error("Verified tournament participation could not be loaded.", { cause: importedError });
  return Object.fromEntries(tournamentIds.map((tournamentId) => [tournamentId, buildTournamentCollectionSummary(
    tournamentId,
    (data ?? []).filter((row) => row.tournament_id === tournamentId) as RegistrationCollectionRow[],
    insuranceResults[tournamentId],
    (imported ?? []).filter((row) => row.tournament_id === tournamentId) as ImportedCollectionRow[],
    new Set(
      (memberships ?? [])
        .filter((membership) => membership.status === "active" && membership.season_id === tournaments?.find((tournament) => tournament.id === tournamentId)?.season_id)
        .map((membership) => membership.angler_id),
    ),
    manualMembershipCollectionCounts,
  )]));
}
