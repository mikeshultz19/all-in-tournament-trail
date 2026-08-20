import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildTournamentCollectionSummary, type ImportedCollectionRow, type RegistrationCollectionRow, type TournamentCollectionSummary } from "@/lib/tournament-collection-calculator";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

export type { TournamentCollectionSummary } from "@/lib/tournament-collection-calculator";

export async function listTournamentCollectionSummaries(tournamentIds: readonly string[], insuranceResults: Record<string, TournamentInsurancePotResultRecord>): Promise<Record<string, TournamentCollectionSummary>> {
  if (!tournamentIds.length) return {};
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tournament_registrations")
    .select("id,tournament_id,registration_type,angler1_name,angler2_name,payment_reference,identity_review_status,member_pot,big_bass,price_snapshot")
    .in("tournament_id", [...tournamentIds])
    .eq("registration_status", "active");
  if (error) throw new Error("Tournament collection records could not be loaded.", { cause: error });
  const { data: imported, error: importedError } = await supabase.from("tournament_result_entries")
    .select("id,tournament_id,registration_id,team_name,participation_status")
    .in("tournament_id", [...tournamentIds]);
  if (importedError) throw new Error("Verified tournament participation could not be loaded.", { cause: importedError });
  return Object.fromEntries(tournamentIds.map((tournamentId) => [tournamentId, buildTournamentCollectionSummary(
    tournamentId,
    (data ?? []).filter((row) => row.tournament_id === tournamentId) as RegistrationCollectionRow[],
    insuranceResults[tournamentId],
    (imported ?? []).filter((row) => row.tournament_id === tournamentId) as ImportedCollectionRow[],
  )]));
}
