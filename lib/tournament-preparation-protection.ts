import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PreparationUndoProtection = {
  blocked: boolean;
  reason: string | null;
  blockers: string[];
};

export async function getPreparationUndoProtection(
  tournamentId: string,
): Promise<PreparationUndoProtection> {
  const supabase = createSupabaseServerClient();
  const results = await Promise.all([
    supabase.from("tournament_result_entries").select("id").eq("tournament_id", tournamentId).limit(1).maybeSingle(),
    supabase.from("tournament_insurance_pot_results").select("tournament_id").eq("tournament_id", tournamentId).limit(1).maybeSingle(),
    supabase.from("on_site_tournament_closeouts").select("tournament_id").eq("tournament_id", tournamentId).limit(1).maybeSingle(),
    supabase.from("official_results_publication_audit").select("id").eq("tournament_id", tournamentId).limit(1).maybeSingle(),
    supabase.from("aoy_tournament_performances").select("tournament_id").eq("tournament_id", tournamentId).limit(1).maybeSingle(),
  ]);

  const error = results.find((result) => result.error)?.error;
  if (error) {
    throw new Error("Preparation undo protection could not be verified.", { cause: error });
  }

  const labels = ["Imported Results", "Insurance Pot", "Generated Checks / Payout Closeout", "Published Results", "AOY Processing"];
  const blockers = labels.filter((_, index) => Boolean(results[index].data));
  if (blockers.length > 0) {
    return {
      blocked: true,
      reason: `Cannot uncheck preparation yet. Undo the later tournament steps first before changing these confirmations. Blockers: ${blockers.join(", ")}.`,
      blockers,
    };
  }

  return { blocked: false, reason: null, blockers: [] };
}
