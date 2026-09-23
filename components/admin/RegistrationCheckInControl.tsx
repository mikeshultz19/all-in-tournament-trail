"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { setRegistrationAttendanceAction, type RegistrationCheckInState } from "@/app/admin/tournament-manager/prepare/check-in-actions";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";

const initialState: RegistrationCheckInState = { status: "idle", message: "" };

export default function RegistrationCheckInControl({ tournamentId, registrationId, checkedInAt, membershipDue = false }: {
  tournamentId: string;
  registrationId: string;
  checkedInAt: string | null;
  membershipDue?: boolean;
}) {
  const router = useRouter();
  const checkedIn = Boolean(checkedInAt);
  const [state, action, pending] = useActionState(
    setRegistrationAttendanceAction.bind(null, tournamentId, registrationId, checkedIn ? "clear_check_in" : "check_in"),
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  const confirmation = checkedIn ? "Reopen this checked-in registration for corrections?" : null;
  return <form action={action} className="min-w-32 print:hidden" onSubmit={(event) => { if (confirmation && !window.confirm(confirmation)) event.preventDefault(); }}>
    {checkedIn ? <div><p><AdminStatusBadge tone="positive">✓ Checked In</AdminStatusBadge></p><button type="submit" disabled={pending} className={adminButtonStyles("ghost", "mt-1 min-h-0 px-0 py-1 text-[10px] hover:bg-transparent hover:text-amber-300")}>{pending ? "Saving..." : "Edit / Reopen"}</button></div>
      : <div><button type="submit" disabled={pending || membershipDue} className={adminButtonStyles("secondary", membershipDue ? "cursor-not-allowed opacity-50 grayscale" : "")}>{pending ? "Saving..." : "Check In"}</button>{membershipDue ? <p className="mt-1 text-[10px] leading-4 text-neutral-400">Verify membership dues.</p> : null}</div>}
    {state.status === "error" ? <p role="alert" className="mt-2 text-xs text-red-300">{state.message}</p> : null}
  </form>;
}
