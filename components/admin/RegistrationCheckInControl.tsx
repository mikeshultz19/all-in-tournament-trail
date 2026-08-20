"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  setRegistrationCheckInAction,
  type RegistrationCheckInState,
} from "@/app/admin/tournament-manager/prepare/check-in-actions";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";

const initialState: RegistrationCheckInState = { status: "idle", message: "" };

export default function RegistrationCheckInControl({
  tournamentId,
  registrationId,
  checkedInAt,
}: {
  tournamentId: string;
  registrationId: string;
  checkedInAt: string | null;
}) {
  const router = useRouter();
  const checkedIn = Boolean(checkedInAt);
  const [state, action, pending] = useActionState(
    setRegistrationCheckInAction.bind(null, tournamentId, registrationId, !checkedIn),
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <form
      action={action}
      className="min-w-32 print:hidden"
      onSubmit={(event) => {
        if (checkedIn && !window.confirm("Reopen this checked-in registration for corrections?")) {
          event.preventDefault();
        }
      }}
    >
      {checkedIn ? (
        <div>
          <p><AdminStatusBadge tone="positive">✓ Checked In</AdminStatusBadge></p>
          <button
            type="submit"
            disabled={pending}
            className={adminButtonStyles("ghost", "mt-1 min-h-0 px-0 py-1 text-[10px] hover:bg-transparent hover:text-amber-300")}
          >
            {pending ? "Saving…" : "Edit / Reopen"}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className={adminButtonStyles("secondary")}
        >
          {pending ? "Saving…" : "Check In"}
        </button>
      )}
      {state.status === "error" ? <p role="alert" className="mt-2 text-xs text-red-300">{state.message}</p> : null}
    </form>
  );
}
