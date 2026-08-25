"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import { validateTournamentRecap } from "@/lib/tournament-recap";
import { updateTournament } from "@/lib/tournaments";

export interface WinnerPhotosFormState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function saveWinnerPhotosAction(
  tournamentId: string,
  _previousState: WinnerPhotosFormState,
  formData: FormData,
): Promise<WinnerPhotosFormState> {
  await requireAdminUser();

  const championPhotoUrl = String(
    formData.get("championPhotoUrl") ?? "",
  ).trim();

  const championPhotoPath = String(
    formData.get("championPhotoPath") ?? "",
  ).trim();

  const bigBassPhotoUrl = String(
    formData.get("bigBassPhotoUrl") ?? "",
  ).trim();

  const bigBassPhotoPath = String(
    formData.get("bigBassPhotoPath") ?? "",
  ).trim();

  const photosReviewed = formData.get("photosReviewed") === "on";

  if (!championPhotoUrl || !championPhotoPath) {
    return {
      status: "error",
      message: "Upload a Champion photo before saving.",
    };
  }

  if (!bigBassPhotoUrl || !bigBassPhotoPath) {
    return {
      status: "error",
      message: "Upload a Big Bass photo before saving.",
    };
  }

  try {
    await updateTournament(tournamentId, {
      champion_photo_url: championPhotoUrl,
      champion_photo_path: championPhotoPath,
      big_bass_photo_url: bigBassPhotoUrl,
      big_bass_photo_path: bigBassPhotoPath,
      photos_reviewed: photosReviewed,
      photos_reviewed_at: photosReviewed
        ? new Date().toISOString()
        : null,
    });

    revalidatePath("/admin/tournament-manager");
    revalidatePath("/admin/tournament-manager/photos");
    revalidatePath("/admin/tournament-manager/publish");
    revalidatePath("/admin");

  } catch (error) {
    console.error("Winner photos save failed.", error);

    return {
      status: "error",
      message: "We could not save the winner photos. Please try again.",
    };
  }

  redirect(`/admin/tournament-manager?tournament=${encodeURIComponent(tournamentId)}&step=5`);
}

export interface TournamentRecapFormState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function saveTournamentRecapAction(
  tournamentId: string,
  _previousState: TournamentRecapFormState,
  formData: FormData,
): Promise<TournamentRecapFormState> {
  const admin = await requireAdminUser();
  const validation = validateTournamentRecap(
    String(formData.get("tournamentRecap") ?? ""),
  );

  if (!validation.ok) {
    return { status: "error", message: validation.message };
  }

  try {
    await updateTournament(tournamentId, {
      tournament_recap: validation.value,
      updated_by: admin.id,
    });

    revalidatePath("/");
    revalidatePath("/results");
    revalidatePath("/results/[slug]", "page");
    revalidatePath("/admin/tournament-manager/photos");

    return {
      status: "success",
      message: validation.value
        ? "Tournament recap saved."
        : "Tournament recap cleared.",
    };
  } catch (error) {
    console.error("Tournament recap save failed.", error);
    return {
      status: "error",
      message: "We could not save the tournament recap. Please try again.",
    };
  }
}
