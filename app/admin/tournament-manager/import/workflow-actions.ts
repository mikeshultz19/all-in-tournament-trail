"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function refreshImportWorkflow() {
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/import");
}

export async function verifyImportedResultsAction(tournamentId: string) {
  const admin = await requireAdminUser();
  const { error } = await createSupabaseServerClient().rpc("verify_tournament_import", {
    p_tournament_id: tournamentId,
    p_admin_user_id: admin.id,
  });
  if (error) throw new Error("The imported results could not be verified.", { cause: error });
  refreshImportWorkflow();
}

export async function resetImportedResultsAction(tournamentId: string, overridePublished: boolean) {
  const admin = await requireAdminUser();
  const { error } = await createSupabaseServerClient().rpc("reset_tournament_import", {
    p_tournament_id: tournamentId,
    p_admin_user_id: admin.id,
    p_override_published: overridePublished,
  });
  if (error) {
    if (error.message.includes("AITT_PUBLISHED_RESULTS_OVERRIDE_REQUIRED")) {
      throw new Error("Published results require the authorized override before reset.");
    }
    throw new Error("The imported results could not be reset.", { cause: error });
  }
  refreshImportWorkflow();
}
