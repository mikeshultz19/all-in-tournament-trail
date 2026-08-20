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
  void _previousState;

  const admin = await requireAdminUser();

  try {
    const query = createSupabaseServerClient()
      .from("tournament_registrations")
      .update({
        checked_in_at: checkedIn ? new Date().toISOString() : null,
        checked_in_by_admin_id: checkedIn ? admin.id : null,
      })
      .eq("id", registrationId)
      .eq("tournament_id", tournamentId)
      .eq("registration_status", "active");
    const scopedQuery = checkedIn
      ? query.not("boat_number", "is", null).neq("identity_review_status", "review_required")
      : query;
    const { data, error } = await scopedQuery
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Registration must have a boat number and no unresolved review before check-in.");
  } catch (error) {
    console.error("Tournament registration check-in save failed.", error);
    return {
      status: "error",
      message: "Check-in requires a boat number and resolved registration review.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/prepare");
  revalidatePath("/admin/registration-review");

  return {
    status: "success",
    message: checkedIn ? "Entry checked in." : "Check-in removed.",
  };
}
