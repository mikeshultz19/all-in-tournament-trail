"use server";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { validateInsurancePotResult, type InsurancePotWinner } from "@/lib/insurance-pot";
import { getTournamentInsurancePotResult, saveTournamentInsurancePotWinnerDraft } from "@/lib/insurance-pot-results";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type InsuranceWinnerDraftState = { status: "idle" | "success" | "error"; message: string };
const cents = (value: FormDataEntryValue | null) => { const amount = Number(String(value ?? "")); return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : -1; };
export async function saveInsuranceWinnerDraftAction(tournamentId: string, _state: InsuranceWinnerDraftState, formData: FormData): Promise<InsuranceWinnerDraftState> {
  await requireAdminUser();
  const record = await getTournamentInsurancePotResult(tournamentId);
  if (!record) return { status: "error", message: "Save the payout calculation first." };
  if (record.published) return { status: "error", message: "Use the protected results correction workflow before changing published Insurance Pot winners." };
  const winners: InsurancePotWinner[] = Array.from({ length: record.places_paid }, (_, index) => ({
    entryName: String(formData.get(`winnerName_${index}`) ?? "").trim(),
    finishingPosition: Number(String(formData.get(`winnerPosition_${index}`) ?? "")),
    amountCents: cents(formData.get(`winnerAmount_${index}`)),
    ...(record.winners[index]?.note ? { note: record.winners[index].note } : {}),
  }));
  if (winners.some((winner) => !Number.isInteger(winner.finishingPosition) || (winner.finishingPosition ?? 0) <= 0)) return { status: "error", message: "Enter a valid final finishing position for every recipient." };
  if (record.entry_count > 0) {
    const { data: basePayoutRows, error: cutoffError } = await createSupabaseServerClient().from("tournament_result_entries").select("place").eq("tournament_id", tournamentId).gt("base_payout", 0);
    if (cutoffError) return { status: "error", message: "The Base Tournament payout cutoff could not be verified." };
    const places = (basePayoutRows ?? []).map((row) => Number(row.place)).filter(Number.isInteger);
    if (places.length === 0) return { status: "error", message: "The Base Tournament payout cutoff could not be determined from the verified standings." };
    const cutoff = Math.max(...places);
    if (winners.some((winner) => (winner.finishingPosition ?? 0) <= cutoff)) return { status: "error", message: "Every Insurance Pot winner must finish outside the Base Tournament payout positions." };
  }
  const result = { entryCount: record.entry_count, totalPotCents: record.total_pot_cents, placesPaid: record.places_paid, winners, published: false };
  const errors = validateInsurancePotResult(result);
  if (errors.length) return { status: "error", message: errors[0] };
  try { await saveTournamentInsurancePotWinnerDraft(tournamentId, winners); ["/admin/tournament-manager", "/admin/tournament-manager/insurance/results"].forEach((path) => revalidatePath(path)); return { status: "success", message: "Insurance Pot Winners Saved — Ready for Results Publishing" }; }
  catch (error) { console.error("Insurance Pot winner draft save failed.", error); return { status: "error", message: "We could not save the Insurance Pot winners." }; }
}
