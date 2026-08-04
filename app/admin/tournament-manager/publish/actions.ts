"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  OfficialResultsError,
  publishOfficialResults,
} from "@/lib/official-results";
import { validateInsurancePotResult } from "@/lib/insurance-pot";
import { getTournamentInsurancePotResult, publishTournamentInsurancePotResult } from "@/lib/insurance-pot-results";

export interface PublishTournamentState {
  status: "idle" | "error";
  message: string;
}

export async function publishTournamentAction(
  _previousState: PublishTournamentState,
  formData: FormData,
): Promise<PublishTournamentState> {
  const admin = await requireAdminUser();
  const tournamentId = String(formData.get("tournamentId") ?? "").trim();
  const identifier = String(formData.get("identifier") ?? "").trim();

  if (!tournamentId || !identifier) {
    return {
      status: "error",
      message: "The selected tournament could not be identified.",
    };
  }
  if (formData.get("confirmed") !== "on") {
    return {
      status: "error",
      message: "Confirm that the imported results are correct before publishing.",
    };
  }

  try {
    const insuranceResult = await getTournamentInsurancePotResult(tournamentId);
    if (insuranceResult && !insuranceResult.published && insuranceResult.entry_count > 0) {
      const insuranceErrors = validateInsurancePotResult({
        entryCount: insuranceResult.entry_count,
        totalPotCents: insuranceResult.total_pot_cents,
        placesPaid: insuranceResult.places_paid,
        winners: insuranceResult.winners,
        published: false,
      });
      if (insuranceErrors.length) return { status: "error", message: `Insurance Pot Winners: ${insuranceErrors[0]}` };
    }
    await publishOfficialResults(tournamentId, admin.id);
    if (insuranceResult && !insuranceResult.published && insuranceResult.entry_count > 0) {
      await publishTournamentInsurancePotResult(tournamentId, {
        entryCount: insuranceResult.entry_count,
        totalPotCents: insuranceResult.total_pot_cents,
        placesPaid: insuranceResult.places_paid,
        winners: insuranceResult.winners,
        published: false,
      });
    }
  } catch (error) {
    console.error("Official Results publication failed.", error);
    return {
      status: "error",
      message:
        error instanceof OfficialResultsError
          ? error.message
          : "The results could not be published. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/results");
  revalidatePath(`/results/${identifier}`);
  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/publish");
  redirect(`/admin/tournament-manager?tournament=${encodeURIComponent(identifier)}&step=5`);
}
