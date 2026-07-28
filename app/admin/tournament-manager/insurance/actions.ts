"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateTournament } from "@/lib/tournaments";

export interface InsuranceReviewFormState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function saveInsuranceReviewAction(
  tournamentId: string,
  _previousState: InsuranceReviewFormState,
  formData: FormData,
): Promise<InsuranceReviewFormState> {
  const payoutValue = String(
    formData.get("insurancePayout") ?? "",
  ).trim();

  const insuranceNotes = String(
    formData.get("insuranceNotes") ?? "",
  ).trim();

  const insuranceReviewed =
    formData.get("insuranceReviewed") === "on";

  const insurancePayout =
    payoutValue === "" ? null : Number(payoutValue);

  if (
    insurancePayout !== null &&
    (!Number.isFinite(insurancePayout) || insurancePayout < 0)
  ) {
    return {
      status: "error",
      message: "Enter a valid insurance payout.",
    };
  }

  try {
    await updateTournament(tournamentId, {
      insurance_payout: insurancePayout,
      insurance_notes: insuranceNotes || null,
      insurance_reviewed: insuranceReviewed,
      insurance_reviewed_at: insuranceReviewed
        ? new Date().toISOString()
        : null,
    });

    revalidatePath("/admin/tournament-manager");
    revalidatePath("/admin/tournament-manager/insurance");
    revalidatePath("/admin/tournament-manager/publish");
    revalidatePath("/admin");

  } catch (error) {
    console.error("Insurance review save failed.", error);

    return {
      status: "error",
      message: "We could not save the insurance review.",
    };
  }

  redirect(`/admin?tournament=${encodeURIComponent(tournamentId)}`);
}
