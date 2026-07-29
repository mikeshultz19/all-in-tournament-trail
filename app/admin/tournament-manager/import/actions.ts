"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WeighfishResultRow } from "@/lib/weighfishParser";

export interface WeighfishImportState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function importWeighfishResultsAction(
  tournamentId: string,
  rows: WeighfishResultRow[],
): Promise<WeighfishImportState> {
  const admin = await requireAdminUser();

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
    const { data: importedCount, error: importError } = await supabase.rpc(
      "import_working_results",
      {
        p_tournament_id: tournamentId,
        p_entries: rows,
        p_admin_user_id: admin.id,
      },
    );
    if (importError) throw importError;

    revalidatePath("/admin/tournament-manager");
    revalidatePath("/admin/tournament-manager/import");
    revalidatePath("/admin/tournament-manager/insurance");
    revalidatePath("/admin/tournament-manager/publish");
    revalidatePath("/admin");

    return {
      status: "success",
      message: `${importedCount ?? rows.length} working results imported.`,
    };
  } catch (error) {
    console.error("WeighFish import failed.", error);

    return {
      status: "error",
      message: "The results could not be imported.",
    };
  }
}
