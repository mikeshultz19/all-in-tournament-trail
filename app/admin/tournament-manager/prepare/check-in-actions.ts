"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RegistrationCheckInState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type RegistrationAttendanceAction =
  | "check_in"
  | "clear_check_in";

// The RPC persists the same exact fields the original check-in action owned:
// checked_in_at: checkedIn ? new Date().toISOString() : null
// checked_in_by_admin_id: checkedIn ? admin.id : null
// .not("boat_number", "is", null) and .neq("identity_review_status", "review_required")
// Legacy scope guarantees remain: .eq("id", registrationId), .eq("tournament_id", tournamentId),
// .eq("registration_status", "active")

export async function setRegistrationAttendanceAction(
  tournamentId: string,
  registrationId: string,
  attendanceAction: RegistrationAttendanceAction,
  _previousState: RegistrationCheckInState,
): Promise<RegistrationCheckInState> {
  void _previousState;

  const admin = await requireAdminUser();

  try {
    const { error } = await createSupabaseServerClient().rpc("set_registration_attendance", {
      p_registration_id: registrationId,
      p_tournament_id: tournamentId,
      p_attendance_action: attendanceAction,
      p_admin_user_id: admin.id,
    });
    if (error) throw error;
  } catch (error) {
    console.error("Tournament registration check-in save failed.", error);
    return {
      status: "error",
      message: attendanceErrorMessage(error),
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/prepare");
  revalidatePath("/admin/registration-review");

  return {
    status: "success",
    message: attendanceAction === "check_in" ? "Entry checked in." : "Check-in removed.",
  };
}

function attendanceErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("AITT_ATTENDANCE_LOCKED_OR_NOT_FOUND")) return "Attendance is locked after publication or the active registration was not found.";
  return "Attendance requires an active registration, boat number, and resolved registration review.";
}
