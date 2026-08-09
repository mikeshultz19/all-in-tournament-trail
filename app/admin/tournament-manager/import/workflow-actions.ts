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

export async function setImportedResultDisqualificationAction(
  tournamentId: string,
  resultEntryId: string,
  disqualified: boolean,
) {
  const admin = await requireAdminUser();
  const { error } = await createSupabaseServerClient().rpc(
    "set_working_result_disqualification",
    { p_tournament_id: tournamentId, p_result_entry_id: resultEntryId, p_disqualified: disqualified, p_admin_user_id: admin.id },
  );
  if (error) {
    if (error.message.includes("set_working_result_disqualification") || error.message.includes("schema cache")) {
      throw new Error("DQ database support is not available. Apply migration 202608090001 before using DQ management.");
    }
    if (error.message.includes("AITT_DQ_EDIT_LOCKED")) throw new Error("Disqualification can only be changed after verification and before financial closeout or publication.");
    throw new Error("The disqualification status could not be changed.", { cause: error });
  }
  refreshImportWorkflow();
}
