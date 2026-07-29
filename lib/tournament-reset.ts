import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface TournamentResetCounts {
  registrations: number;
  resultEntries: number;
  publishedResults: number;
  aoyContributions: number;
}

export function isTournamentResetEnabled(): boolean {
  return process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_PRODUCTION_TOURNAMENT_RESET === "true";
}

export async function getTournamentResetPreview(
  tournamentId: string,
): Promise<TournamentResetCounts | null> {
  const { data, error } = await createSupabaseServerClient().rpc(
    "admin_tournament_reset_preview",
    { p_tournament_id: tournamentId },
  );
  if (error) throw error;
  const row = (data as Array<Record<string, number>> | null)?.[0];
  return row ? {
    registrations: Number(row.registrations),
    resultEntries: Number(row.result_entries),
    publishedResults: Number(row.published_results),
    aoyContributions: Number(row.aoy_contributions),
  } : null;
}

export async function resetTournamentActivity(input: {
  tournamentId: string;
  adminUserId: string;
  adminEmail: string;
}) {
  const { data, error } = await createSupabaseServerClient().rpc(
    "admin_reset_tournament",
    {
      p_tournament_id: input.tournamentId,
      p_admin_user_id: input.adminUserId,
      p_admin_email: input.adminEmail,
    },
  );
  if (error) throw error;
  return (data as Array<Record<string, unknown>> | null)?.[0] ?? null;
}

export async function deleteTournamentTemporaryFiles(
  tournamentId: string,
  resetResult: Record<string, unknown> | null,
): Promise<void> {
  const paths = [
    resetResult?.champion_photo_path,
    resetResult?.big_bass_photo_path,
    `tournaments/${tournamentId}/weighfish.csv`,
  ].filter((path): path is string =>
    typeof path === "string" && path.trim().length > 0
  );

  if (paths.length === 0) return;

  const { error } = await createSupabaseServerClient().storage
    .from("tournament-photos")
    .remove([...new Set(paths)]);

  if (error) {
    // Database activity has already been reset atomically. Keep the error
    // visible to operators without attempting to reconstruct deleted rows.
    console.error("Tournament temporary-file cleanup failed.", error);
  }
}
