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
// .not("boat_number", "is", null); unresolved identity reviews block online
// check-in, while walk-up reviews remain informational after payment.
// Legacy scope guarantees remain: .eq("id", registrationId), .eq("tournament_id", tournamentId),
// .eq("registration_status", "active")

export async function setRegistrationAttendanceAction(
  tournamentId: string,
  registrationId: string,
  attendanceAction: RegistrationAttendanceAction,
  _previousState: RegistrationCheckInState,
  formData?: FormData,
): Promise<RegistrationCheckInState> {
  void _previousState;

  const admin = await requireAdminUser();
  const assignedBoatNumberValue = formData?.get("assignedBoatNumber");
  const assignedBoatNumberText = String(assignedBoatNumberValue ?? "").trim();
  if (assignedBoatNumberText && (!/^\d{1,3}$/.test(assignedBoatNumberText) || Number(assignedBoatNumberText) < 1)) {
    return { status: "error", message: "Boat numbers must be between 1 and 999." };
  }
  const assignedBoatNumber = assignedBoatNumberText ? Number(assignedBoatNumberText) : null;

  try {
    const rpcName = attendanceAction === "check_in" ? "set_registration_attendance_with_boat_number" : "set_registration_attendance";
    const rpcArgs = attendanceAction === "check_in"
      ? {
          p_registration_id: registrationId,
          p_tournament_id: tournamentId,
          p_attendance_action: attendanceAction,
          p_admin_user_id: admin.id,
          p_assigned_boat_number: assignedBoatNumber,
        }
      : {
          p_registration_id: registrationId,
          p_tournament_id: tournamentId,
          p_attendance_action: attendanceAction,
          p_admin_user_id: admin.id,
        };
    const { error } = await createSupabaseServerClient().rpc(rpcName, rpcArgs);
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
    message: attendanceAction === "check_in" ? "Boat number saved and entry checked in." : "Check-in removed.",
  };
}

function attendanceErrorMessage(error: unknown): string {
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : String(error);
  if (message.includes("AITT_ATTENDANCE_BOAT_NUMBER_INVALID")) return "Boat numbers must be between 1 and 999.";
  if (message.includes("Duplicate numbers cannot be used") || message.includes("duplicate key") || message.includes("tournament_registrations_tournament_assigned_boat_number_uidx")) return "Duplicate numbers cannot be used.";
  if (message.includes("AITT_ATTENDANCE_LOCKED_OR_NOT_FOUND")) return "Attendance is locked after publication or the active registration was not found.";
  return "Attendance requires an active registration and boat number; online reviews must also be resolved.";
}
