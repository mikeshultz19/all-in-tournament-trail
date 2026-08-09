"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import { updateTournament } from "@/lib/tournaments";
import { getPreparationUndoProtection } from "@/lib/tournament-preparation-protection";

export interface PrepareReminderState {
  status: "idle" | "success" | "error";
  message: string;
  savedComplete?: boolean;
}

export async function savePrepareMembershipReminderAction(
  tournamentId: string,
  _previousState: PrepareReminderState,
  formData: FormData,
): Promise<PrepareReminderState> {
  await requireAdminUser();

  const intent = formData.get("intent") === "undo" ? "undo" : "confirm";

  if (intent === "undo") {
    try {
      const protection = await getPreparationUndoProtection(tournamentId);
      if (protection.blocked) {
        return { status: "error", message: protection.reason ?? "Preparation cannot be reopened after later workflow work has started." };
      }
      await updateTournament(tournamentId, {
        prepare_registration_review_complete: false,
        paper_membership_reminder_checked: false,
      });
    } catch (error) {
      console.error("Prepare Tournament undo failed.", error);
      return {
        status: "error",
        message: "Preparation could not be reopened because downstream workflow status could not be safely confirmed.",
      };
    }

    revalidatePreparationPaths();
    return { status: "success", message: "Tournament preparation confirmations unchecked and saved.", savedComplete: false };
  }

  const registrationReviewComplete =
    formData.get("prepare_registration_review_complete") === "on";
  const paperMembershipsConfirmed =
    formData.get("paper_membership_reminder_checked") === "on";

  if (!registrationReviewComplete || !paperMembershipsConfirmed) {
    return {
      status: "error",
      message: "Complete both preparation confirmations before saving.",
    };
  }

  try {
    await updateTournament(tournamentId, {
      prepare_registration_review_complete: registrationReviewComplete,
      paper_membership_reminder_checked: paperMembershipsConfirmed,
    });
  } catch (error) {
    console.error("Prepare Tournament confirmation save failed.", error);
    return {
      status: "error",
      message: "The tournament preparation confirmations could not be saved. Please try again.",
    };
  }

  revalidatePreparationPaths();

  return {
    status: "success",
    message: registrationReviewComplete && paperMembershipsConfirmed
      ? "Tournament preparation confirmed."
      : "Tournament preparation updates saved.",
    savedComplete: registrationReviewComplete && paperMembershipsConfirmed,
  };
}

function revalidatePreparationPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/prepare");
  revalidatePath("/admin/tournament-manager/import");
  revalidatePath("/admin/tournament");
}
