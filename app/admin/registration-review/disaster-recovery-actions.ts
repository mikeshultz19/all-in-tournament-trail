"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function syncDisasterRecoveryNowAction() {
  await requireAdminUser();
  throw new Error("Sync Now is disabled while GitHub Actions staging synchronization is being rehearsed.");
}

export async function rebuildDisasterRecoveryTournamentAction(formData: FormData) {
  await requireAdminUser();
  const tournamentId = String(formData.get("tournamentId") ?? "").trim();
  if (!tournamentId) throw new Error("A tournament is required for disaster-recovery rebuild.");
  const { error } = await createSupabaseServerClient().rpc("admin_enqueue_tournament_disaster_recovery_rebuild", { p_tournament_id: tournamentId });
  if (error) throw new Error("Disaster-recovery rebuild could not be queued.", { cause: error });
  revalidatePath("/admin/registration-review");
}
