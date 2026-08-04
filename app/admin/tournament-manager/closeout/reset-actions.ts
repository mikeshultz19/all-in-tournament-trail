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

  const [publication, closeout] = await Promise.all([
    supabase.from("official_results_publication_audit").select("id").eq("tournament_id", tournamentId).limit(1).maybeSingle(),
    supabase.from("on_site_tournament_closeouts").select("checks").eq("tournament_id", tournamentId).maybeSingle(),
  ]);
  const evidenceError = publication.error ?? closeout.error;
  if (evidenceError) {
    console.error("Payout reset evidence query failed.", { tournamentId, code: evidenceError.code, message: evidenceError.message, details: evidenceError.details, hint: evidenceError.hint });
    return { status: "error", message: "Payout calculations could not be reset because their current status could not be confirmed." };
  }

  const checks = Array.isArray(closeout.data?.checks) ? closeout.data.checks : [];
  const delivered = checks.some((check) => typeof check === "object" && check !== null && "status" in check && check.status === "delivered");
  const protectedEvidence = Boolean(publication.data || delivered);
  if (protectedEvidence && formData.get("acknowledgeProtectedPayouts") !== "yes") {
    return { status: "error", message: "Confirm the stronger warning before resetting payout work that has delivered checks or published results." };
  }

  const { error: closeoutError } = await supabase.from("on_site_tournament_closeouts").delete().eq("tournament_id", tournamentId);
  if (closeoutError) {
    console.error("On-site closeout reset failed.", { tournamentId, code: closeoutError.code, message: closeoutError.message, details: closeoutError.details, hint: closeoutError.hint });
    return { status: "error", message: "The generated payouts could not be reset. No imported results were changed." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/closeout");
  revalidatePath("/admin/tournament-manager/insurance");
  return {
    status: "success",
    message: "Payout calculations were reset. The verified WeighFish import and completed Insurance Pot remain available.",
  };
}
