"use server";

import { revalidatePath } from "next/cache";

import {
  AdminAuthorizationError,
  requireAdminUser,
} from "@/lib/admin-auth";
import {
  AdminSettingsDataError,
  setActiveMembershipSeason,
} from "@/lib/admin-settings";

export interface ActiveSeasonFormState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function saveActiveSeasonAction(
  _previousState: ActiveSeasonFormState,
  formData: FormData,
): Promise<ActiveSeasonFormState> {
  try {
    await requireAdminUser();
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof AdminAuthorizationError
          ? error.message
          : "Admin authorization could not be verified.",
    };
  }

  const seasonId = String(formData.get("seasonId") ?? "").trim();

  if (!seasonId) {
    return {
      status: "error",
      message: "Select an active membership season.",
    };
  }

  try {
    await setActiveMembershipSeason(seasonId);
  } catch (error) {
    console.error("Active membership season update failed.", error);
    return {
      status: "error",
      message:
        error instanceof AdminSettingsDataError
          ? error.message
          : "The active membership season could not be saved.",
    };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/members");
  revalidatePath("/admin/members/new");

  return {
    status: "success",
    message: "Active membership season saved.",
  };
}
