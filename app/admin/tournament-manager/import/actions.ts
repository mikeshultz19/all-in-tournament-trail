"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateTournament } from "@/lib/tournaments";
import type { WeighfishResultRow } from "@/lib/weighfishParser";

export interface WeighfishImportState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function importWeighfishResultsAction(
  tournamentId: string,
  rows: WeighfishResultRow[],
): Promise<WeighfishImportState> {
  if (!tournamentId) {
    return {
      status: "error",
      message: "No tournament was selected.",
    };
  }

  if (!rows.length) {
    return {
      status: "error",
      message: "The CSV does not contain any result entries.",
    };
  }

  const supabase = createSupabaseServerClient();

  try {
    const { error: deleteError } = await supabase
      .from("tournament_result_entries")
      .delete()
      .eq("tournament_id", tournamentId);

    if (deleteError) {
      throw deleteError;
    }

    const entries = rows.map((row) => ({
      tournament_id: tournamentId,
      place: row.place,
      team_name: row.entryName,
      fish_count: row.fishCount,
      total_weight: row.totalWeight,
      big_fish_weight:
        row.bigFishWeight > 0 ? row.bigFishWeight : null,
      base_payout: row.basePayout,
      bronze_payout: row.bronzePayout,
      silver_payout: row.silverPayout,
      gold_payout: row.goldPayout,
      big_bass_place: row.bigBassPlace,
      big_bass_payout: row.bigBassPayout,
      insurance_payout: 0,
      prize_description: row.prizeDescription || null,
      raw_payout_breakdown: row.payoutBreakdown || null,
      is_demo: false,
    }));

    const { error: insertError } = await supabase
      .from("tournament_result_entries")
      .insert(entries);

    if (insertError) {
      throw insertError;
    }

await updateTournament(tournamentId, {
  weighfish_imported: true,
  weighfish_imported_at: new Date().toISOString(),
});

    revalidatePath("/admin/tournament-manager");
    revalidatePath("/admin/tournament-manager/import");
    revalidatePath("/admin/tournament-manager/insurance");
    revalidatePath("/admin/tournament-manager/publish");
    revalidatePath("/admin");

    return {
      status: "success",
      message: `${rows.length} tournament results imported.`,
    };
  } catch (error) {
    console.error("WeighFish import failed.", error);

    return {
      status: "error",
      message: "The results could not be imported.",
    };
  }
}
