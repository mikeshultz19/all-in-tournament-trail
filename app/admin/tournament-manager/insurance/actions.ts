"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { expectedInsurancePotCents, getInsurancePotPlaces, splitInsurancePotCents } from "@/lib/insurance-pot";
import { saveTournamentInsurancePotCalculation } from "@/lib/insurance-pot-results";
import { updateTournament } from "@/lib/tournaments";

export interface InsuranceReviewFormState { status: "idle" | "success" | "error"; message: string; savedEntryCount?: number; }
const dollarsToCents = (value: FormDataEntryValue | null) => { const amount = Number(String(value ?? "").trim()); return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null; };

export async function saveInsuranceCalculationAction(tournamentId: string, _state: InsuranceReviewFormState, formData: FormData): Promise<InsuranceReviewFormState> {
  await requireAdminUser();
  const entryCount = Number(String(formData.get("entryCount") ?? ""));
  const totalPotCents = dollarsToCents(formData.get("totalPot"));
  if (!Number.isInteger(entryCount) || entryCount < 0 || totalPotCents === null) return { status: "error", message: "Enter a valid entry count and total Insurance Pot." };
  if (totalPotCents !== expectedInsurancePotCents(entryCount)) return { status: "error", message: "The Insurance Pot total must equal the entry count multiplied by $20." };
  const placesPaid = getInsurancePotPlaces(entryCount);
  const calculatedPayouts = splitInsurancePotCents(totalPotCents, placesPaid);
  try {
    await saveTournamentInsurancePotCalculation(tournamentId, { entryCount, totalPotCents, placesPaid, calculatedPayouts });
    await updateTournament(tournamentId, { insurance_payout: totalPotCents / 100, insurance_reviewed: true, insurance_reviewed_at: new Date().toISOString(), insurance_notes: null });
    ["/admin", "/admin/tournament-manager", "/admin/tournament-manager/insurance", "/admin/tournament-manager/insurance/results"].forEach((path) => revalidatePath(path));
    return { status: "success", message: "Insurance Pot Calculation Saved", savedEntryCount: entryCount };
  } catch (error) { console.error("Insurance Pot calculation save failed.", error); return { status: "error", message: "We could not save the payout calculation." }; }
}
