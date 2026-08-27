"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";
import { reconcileWeighfishResults } from "@/lib/weighfish-reconciliation";

function refreshImportWorkflow() {
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/import");
}

export async function verifyImportedResultsAction(tournamentId: string) {
  const admin = await requireAdminUser();
  const supabase = createSupabaseServerClient();
  const roster = await getTournamentRegistrationRoster(tournamentId);
  const { data: resultRows, error: resultError } = await supabase
    .from("tournament_result_entries")
    .select("id,place,team_name,registration_id")
    .eq("tournament_id", tournamentId);
  if (resultError) throw new Error("The imported results could not be reconciled.", { cause: resultError });
  const reconciliation = reconcileWeighfishResults({
    roster: roster.map((entry) => ({ id: entry.id, boatNumber: entry.boatNumber, registrationType: entry.registrationType, angler1Name: entry.angler1.displayName, angler2Name: entry.angler2?.displayName ?? null })),
    results: (resultRows ?? []).map((row) => ({ id: row.id, place: row.place, teamName: row.team_name, registrationId: row.registration_id })),
  });
  if (reconciliation.unresolvedRows.length || reconciliation.missingResults.length || reconciliation.duplicateRows.length) {
    throw new Error(`Reconciliation incomplete: ${reconciliation.unresolvedRows.length} unresolved import(s), ${reconciliation.missingResults.length} missing roster result(s), and ${reconciliation.duplicateRows.length} duplicate assignment(s).`);
  }
  for (const row of reconciliation.rows) {
    if (!row.registrationId) continue;
    const { error: mappingError } = await supabase.rpc("reconcile_working_result_registration", {
      p_tournament_id: tournamentId,
      p_result_entry_id: row.resultId,
      p_registration_id: row.registrationId,
      p_match_method: row.fuzzy ? "auto_fuzzy" : "auto_exact",
      p_admin_user_id: admin.id,
    });
    if (mappingError) throw new Error("A reconciled roster match could not be saved.", { cause: mappingError });
  }
  const { error } = await supabase.rpc("verify_tournament_import", {
    p_tournament_id: tournamentId,
    p_admin_user_id: admin.id,
  });
  if (error) throw new Error("The imported results could not be verified.", { cause: error });
  refreshImportWorkflow();
}

export async function confirmImportedResultMatchAction(
  tournamentId: string,
  resultEntryId: string,
  registrationId: string,
) {
  const admin = await requireAdminUser();
  const { error } = await createSupabaseServerClient().rpc("reconcile_working_result_registration", {
    p_tournament_id: tournamentId,
    p_result_entry_id: resultEntryId,
    p_registration_id: registrationId,
    p_match_method: "manual",
    p_admin_user_id: admin.id,
  });
  if (error?.message.includes("AITT_WEIGHFISH_REGISTRATION_ALREADY_OWNED")) {
    throw new Error("That boat/registration is already assigned to another imported result.");
  }
  if (error) throw new Error("The roster match could not be saved.", { cause: error });
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
