"use server";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateTournamentInsurancePotResult, getTournamentInsurancePotResult, saveTournamentInsurancePotResult } from "@/lib/insurance-pot-results";
import { isInsurancePotWinnerDraftComplete } from "@/lib/insurance-pot";
import { getOnSiteCloseout } from "@/lib/on-site-closeout";
import type { WeighfishResultRow } from "@/lib/weighfishParser";
import type { OnSiteCloseoutCheck } from "@/types/on-site-closeout";

export type CloseoutState = {
  status: "idle" | "success" | "error";
  message: string;
  savedIntent?: "review" | "approve";
};
export async function saveOnSiteCloseoutAction(tournamentId: string, _state: CloseoutState, formData: FormData): Promise<CloseoutState> {
  const admin = await requireAdminUser();
  try {
    const sourceRows = JSON.parse(String(formData.get("sourceRows") ?? "[]")) as WeighfishResultRow[];
    const checks = JSON.parse(String(formData.get("checks") ?? "[]")) as OnSiteCloseoutCheck[];
    const collected = Math.round(Number(formData.get("totalCollected")) * 100);
    const retained = Math.round(Number(formData.get("trailRetained")) * 100);
    const intentValue = String(formData.get("intent") ?? "review");
    const intent = intentValue === "review" ? "review" : "approve";
    const complete = intent === "approve";
    if (!Array.isArray(sourceRows) || !Array.isArray(checks) || !Number.isInteger(collected) || collected < 0 || !Number.isInteger(retained) || retained < 0) throw new Error("Invalid closeout input.");
    if (intent === "approve") {
      const [existingCloseout, insuranceResult] = await Promise.all([
        getOnSiteCloseout(tournamentId),
        getTournamentInsurancePotResult(tournamentId),
      ]);
      const resolvedInsuranceResult = insuranceResult && isInsurancePotWinnerDraftComplete({
        entryCount: insuranceResult.entry_count,
        totalPotCents: insuranceResult.total_pot_cents,
        placesPaid: insuranceResult.places_paid,
        winners: insuranceResult.winners,
        published: insuranceResult.published,
      }) ? insuranceResult : await ensureTournamentInsurancePotResult(tournamentId);
      if (!resolvedInsuranceResult) throw new Error("The Insurance calculation could not be completed before generating final checks.");
      void existingCloseout;
    }
    const { error } = await createSupabaseServerClient().rpc("save_on_site_tournament_closeout", {
      p_tournament_id: tournamentId, p_admin_user_id: admin.id,
      p_source_file_name: intent === "approve" ? "Final Tournament Checks" : String(formData.get("sourceFileName") ?? ""),
      p_source_rows: sourceRows, p_entry_count: sourceRows.length,
      p_total_collected_cents: collected, p_trail_retained_cents: retained,
      p_checks: checks, p_complete: complete,
    });
    if (error) throw error;
    revalidatePath("/admin"); revalidatePath("/admin/tournament-manager"); revalidatePath("/admin/tournament-manager/closeout");
    return {
      status: "success",
      message: complete
        ? "Payouts approved and closeout finalized. Nothing was published."
        : "WeighFish payouts confirmed. Nothing was published.",
      savedIntent: intent,
    };
  } catch (error) {
    console.error("On-site closeout save failed.", error);
    return { status: "error", message: "The tournament payouts could not be saved. Review the generated payouts and try again." };
  }
}

async function ensureTournamentInsurancePotResult(tournamentId: string) {
  const calculated = await calculateTournamentInsurancePotResult(tournamentId);
  if (!calculated) return null;
  return saveTournamentInsurancePotResult(tournamentId, calculated);
}
