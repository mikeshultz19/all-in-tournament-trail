"use server";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { validateInsurancePotResult, type InsurancePotWinner } from "@/lib/insurance-pot";
import { getTournamentInsurancePotResult, publishTournamentInsurancePotResult } from "@/lib/insurance-pot-results";

export type InsurancePublishState = { status: "idle" | "success" | "error"; message: string };
const cents = (value: FormDataEntryValue | null) => { const amount = Number(String(value ?? "")); return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : -1; };
export async function publishInsuranceResultsAction(tournamentId: string, _state: InsurancePublishState, formData: FormData): Promise<InsurancePublishState> {
  await requireAdminUser();
  const record = await getTournamentInsurancePotResult(tournamentId);
  if (!record) return { status: "error", message: "Save the payout calculation first." };
  if (record.published) return { status: "error", message: "Insurance Pot results are already published." };
  const winners: InsurancePotWinner[] = Array.from({ length: record.places_paid }, (_, index) => ({
    entryName: String(formData.get(`winnerName_${index}`) ?? "").trim(),
    finishingPosition: Number(String(formData.get(`winnerPosition_${index}`) ?? "")),
    amountCents: cents(formData.get(`winnerAmount_${index}`)),
    ...(String(formData.get(`winnerNote_${index}`) ?? "").trim() ? { note: String(formData.get(`winnerNote_${index}`)).trim() } : {}),
  }));
  if (winners.some((winner) => !Number.isInteger(winner.finishingPosition) || (winner.finishingPosition ?? 0) <= 0)) return { status: "error", message: "Enter a valid final finishing position for every recipient." };
  const result = { entryCount: record.entry_count, totalPotCents: record.total_pot_cents, placesPaid: record.places_paid, winners, published: false };
  const errors = validateInsurancePotResult(result);
  if (errors.length) return { status: "error", message: errors[0] };
  try { await publishTournamentInsurancePotResult(tournamentId, result); ["/results", "/", "/admin/tournament-manager/insurance/results"].forEach((path) => revalidatePath(path)); return { status: "success", message: "Insurance Pot results published." }; }
  catch (error) { console.error("Insurance Pot publication failed.", error); return { status: "error", message: "We could not publish the Insurance Pot results." }; }
}
