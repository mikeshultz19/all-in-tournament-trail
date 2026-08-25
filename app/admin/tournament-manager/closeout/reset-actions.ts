"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ResetPayoutState = { status: "idle" | "success" | "error"; message: string };

export async function resetPayoutCalculationsAction(
  tournamentId: string,
  _state: ResetPayoutState,
  formData: FormData,
): Promise<ResetPayoutState> {
  await requireAdminUser();
  const supabase = createSupabaseServerClient();

  const [publication, closeout, insurance] = await Promise.all([
    supabase.from("official_results_publication_audit").select("id").eq("tournament_id", tournamentId).limit(1).maybeSingle(),
    supabase.from("on_site_tournament_closeouts").select("checks").eq("tournament_id", tournamentId).maybeSingle(),
    supabase.from("tournament_insurance_pot_results").select("published").eq("tournament_id", tournamentId).maybeSingle(),
  ]);
  const evidenceError = publication.error ?? closeout.error ?? insurance.error;
  if (evidenceError) {
    console.error("Payout reset evidence query failed.", { tournamentId, code: evidenceError.code, message: evidenceError.message, details: evidenceError.details, hint: evidenceError.hint });
    return { status: "error", message: "Payout calculations could not be reset because their current status could not be confirmed." };
  }

  if (insurance.data?.published) {
    return { status: "error", message: "Published Insurance Pot results remain protected and cannot be cleared by the normal payout reset." };
  }

  const checks = Array.isArray(closeout.data?.checks) ? closeout.data.checks : [];
  const delivered = checks.some((check) => typeof check === "object" && check !== null && "status" in check && check.status === "delivered");
  const protectedEvidence = Boolean(publication.data || delivered);
  if (protectedEvidence && formData.get("acknowledgeProtectedPayouts") !== "yes") {
    return { status: "error", message: "Confirm the stronger warning before resetting payout work that has delivered checks or published results." };
  }

  const { error: resetError } = await supabase.rpc("reset_tournament_payout_workflow", {
    p_tournament_id: tournamentId,
  });
  if (resetError) {
    console.error("Payout workflow reset failed.", { tournamentId, code: resetError.code, message: resetError.message, details: resetError.details, hint: resetError.hint });
    return { status: "error", message: "The generated payouts could not be reset. No imported results were changed." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/closeout");
  revalidatePath("/admin/tournament-manager/insurance");
  return {
    status: "success",
    message: "Payout calculations and unpublished Insurance Pot work were reset. The verified WeighFish import remains available.",
  };
}
