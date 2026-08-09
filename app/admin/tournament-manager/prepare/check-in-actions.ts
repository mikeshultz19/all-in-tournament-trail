"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RegistrationCheckInState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function setRegistrationCheckInAction(
  tournamentId: string,
  registrationId: string,
  checkedIn: boolean,
  _previousState: RegistrationCheckInState,
): Promise<RegistrationCheckInState> {
  const admin = await requireAdminUser();

  try {
    const { data, error } = await createSupabaseServerClient()
      .from("tournament_registrations")
      .update({
        checked_in_at: checkedIn ? new Date().toISOString() : null,
        checked_in_by_admin_id: checkedIn ? admin.id : null,
      })
      .eq("id", registrationId)
      .eq("tournament_id", tournamentId)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Registration not found for tournament.");
  } catch (error) {
    console.error("Tournament registration check-in save failed.", error);
    return {
      status: "error",
      message: "Check-in could not be saved. Please try again.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/prepare");

  return {
    status: "success",
    message: checkedIn ? "Entry checked in." : "Check-in removed.",
  };
}
