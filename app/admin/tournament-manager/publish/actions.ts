"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  OfficialResultsError,
  publishOfficialResults,
} from "@/lib/official-results";

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
    await publishOfficialResults(tournamentId, admin.id);
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
  redirect(`/admin?tournament=${encodeURIComponent(identifier)}`);
}
