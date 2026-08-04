"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import { updateTournament } from "@/lib/tournaments";

export interface PrepareReminderState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function savePrepareMembershipReminderAction(
  tournamentId: string,
  _previousState: PrepareReminderState,
  formData: FormData,
): Promise<PrepareReminderState> {
  await requireAdminUser();

  const registrationReviewComplete =
    formData.get("prepare_registration_review_complete") === "on";
  const paperMembershipsConfirmed =
    formData.get("paper_membership_reminder_checked") === "on";

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

  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/prepare");
  revalidatePath("/admin/tournament-manager/import");
  revalidatePath("/admin/tournament");

  return {
    status: "success",
    message: registrationReviewComplete && paperMembershipsConfirmed
      ? "Tournament preparation confirmed."
      : "Tournament preparation updates saved.",
  };
}
