"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  OfficialResultsError,
  publishOfficialResults,
  type OfficialParticipationStatus,
} from "@/lib/official-results";
import { validateInsurancePotResult } from "@/lib/insurance-pot";
import { getTournamentInsurancePotResult, publishTournamentInsurancePotResult } from "@/lib/insurance-pot-results";
import { reviewWorkingResultHistoryAction as reviewWorkingResultHistoryActionImpl } from "@/app/admin/results/correction-actions";
import { syncTournamentPublishReadiness } from "@/lib/tournament-publish-readiness";

export interface PublishTournamentState {
  status: "idle" | "error";
  message: string;
}

export interface HistoricalResultReviewState {
  status: "idle" | "success" | "error";
  message: string;
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function booleanFromText(value: string): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export async function reviewHistoricalResultAction(
  _previousState: HistoricalResultReviewState,
  formData: FormData,
): Promise<HistoricalResultReviewState> {
  const tournamentId = text(formData, "tournamentId");
  const resultEntryId = text(formData, "resultEntryId");
  const registrationId = text(formData, "registrationId");
  const participationStatus = text(formData, "participationStatus") as OfficialParticipationStatus;
  const aoyEligible = booleanFromText(text(formData, "aoyEligible"));
  const eligibilityReason = text(formData, "eligibilityReason");

  if (
    !tournamentId ||
    !resultEntryId ||
    !registrationId ||
    !["participated", "withdrew_after_start", "no_show", "disqualified"].includes(participationStatus) ||
    aoyEligible === null ||
    !eligibilityReason
  ) {
    return {
      status: "error",
      message: "Complete the historical review fields before saving.",
    };
  }

  try {
    await requireAdminUser();
    const reviewResult = await reviewWorkingResultHistoryActionImpl({
      resultEntryId,
      registrationId,
      participationStatus,
      aoyEligible,
      eligibilityReason,
    });
    if (reviewResult.status === "error") {
      return reviewResult;
    }
    await syncTournamentPublishReadiness(tournamentId);
    revalidatePath("/admin/tournament-manager");
    revalidatePath("/admin/tournament-manager/publish");
    return { status: "success", message: "Historical result review saved." };
  } catch (error) {
    console.error("Historical result review failed.", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The historical result review could not be saved.",
    };
  }
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

  const readiness = await syncTournamentPublishReadiness(tournamentId);
  if (
    !readiness.tournament ||
    !readiness.tournament.weighfish_imported_at ||
    !readiness.tournament.results_verified_at ||
    !readiness.tournament.results_verified_by
  ) {
    return {
      status: "error",
      message: "The imported results must be verified before publishing.",
    };
  }
  if (readiness.manualReviewRows.length > 0) {
    return {
      status: "error",
      message: `Review ${readiness.manualReviewRows[0].teamName} before publishing results.`,
    };
  }
  if (!readiness.tournament || readiness.tournament.result_status !== "ready_to_publish") {
    return {
      status: "error",
      message: "The tournament is not ready to publish yet.",
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
