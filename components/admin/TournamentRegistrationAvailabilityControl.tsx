"use client";

import { useActionState } from "react";
import { updateRegistrationAvailabilityAction, type RegistrationAvailabilityActionState } from "@/app/admin/tournament-manager/registration-availability/actions";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import type { TournamentStatus } from "@/types/tournament";

const initialState: RegistrationAvailabilityActionState = { status: "idle", message: "" };

export default function TournamentRegistrationAvailabilityControl({ tournamentId, initialStatus }: { tournamentId: string; initialStatus: TournamentStatus }) {
  const [state, action, pending] = useActionState(updateRegistrationAvailabilityAction.bind(null, tournamentId), initialState);
  const status = state.tournamentStatus ?? initialStatus;
  const registrationOpen = status === "Registration Open";
  return <section className="border-t border-white/10 pt-5" aria-labelledby="registration-availability-heading">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h3 id="registration-availability-heading" className="font-bold text-white">Online Registration</h3><p className="mt-1 text-sm text-neutral-400">{registrationOpen ? "Available until manually suspended." : status === "Postponed" ? "Suspended while the tournament is postponed." : "Temporarily unavailable to new registrations."}</p></div>
      <form action={action} className="flex flex-wrap gap-2">
        {registrationOpen ? <button name="intent" value="suspend" disabled={pending} className={adminButtonStyles("secondary", "min-h-10")}>Suspend Registration</button> : <button name="intent" value="resume" disabled={pending} className={adminButtonStyles("primary", "min-h-10")}>Resume Registration</button>}
        {status !== "Postponed" ? <button name="intent" value="postpone" disabled={pending} className={adminButtonStyles("secondary", "min-h-10")}>Postpone Tournament</button> : null}
      </form>
    </div>
    {state.message ? <p role="status" className={`mt-3 text-sm ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}>{state.message}</p> : null}
  </section>;
}
