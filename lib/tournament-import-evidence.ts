import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TournamentImportEvidence } from "@/lib/tournament-import-status";
import type { ImportedRow } from "@/components/admin/ImportedResultsReview";

export async function listTournamentImportEvidence(
  tournamentIds: string[],
): Promise<Record<string, TournamentImportEvidence>> {
  if (!tournamentIds.length) return {};

  const { data, error } = await createSupabaseServerClient()
    .from("tournament_result_entries")
    .select("tournament_id")
    .in("tournament_id", tournamentIds);

  if (error) {
    throw new Error("Tournament import evidence could not be loaded.", {
      cause: error,
    });
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.tournament_id, (counts.get(row.tournament_id) ?? 0) + 1);
  }

  return Object.fromEntries(
    tournamentIds.map((tournamentId) => [
      tournamentId,
      {
        tournamentId,
        persistedRowCount: counts.get(tournamentId) ?? 0,
      },
    ]),
  );
}

export async function listTournamentImportedRows(
  tournamentIds: string[],
): Promise<Record<string, ImportedRow[]>> {
  if (!tournamentIds.length) return {};
  const { data, error } = await createSupabaseServerClient()
    .from("tournament_result_entries")
    .select("id,tournament_id,place,team_name,total_weight,big_fish_weight,bronze_payout,silver_payout,gold_payout,participation_status,original_import_data")
    .in("tournament_id", tournamentIds)
    .order("place", { ascending: true });
  if (error) throw new Error("Tournament imported results could not be loaded.", { cause: error });
  const result = Object.fromEntries(tournamentIds.map((id) => [id, [] as ImportedRow[]]));
  for (const row of data ?? []) {
    result[row.tournament_id]?.push({
      id: row.id,
      place: row.place,
      team_name: row.team_name,
      total_weight: row.total_weight,
      big_fish_weight: row.big_fish_weight,
      bronze_payout: row.bronze_payout,
      silver_payout: row.silver_payout,
      gold_payout: row.gold_payout,
      participation_status: row.participation_status,
      original_import_data: row.original_import_data as ImportedRow["original_import_data"],
    });
  }
  return result;
}
