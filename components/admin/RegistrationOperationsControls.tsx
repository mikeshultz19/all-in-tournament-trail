"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createWalkUpRegistrationAction,
  cancelWalkUpRegistrationAction,
  updateRegistrationOperationsAction,
  type RegistrationOperationsActionState,
} from "@/app/admin/registration-review/actions";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import type { RegistrationParticipantContactSnapshot } from "@/lib/tournament-registration-roster";

const initialState: RegistrationOperationsActionState = { status: "idle", message: "" };
const input = "min-h-11 w-full border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-[#D4A017]";

function useRefreshOnSuccess(state: RegistrationOperationsActionState) {
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);
}

export function AddWalkUpControl({ tournamentId }: { tournamentId: string }) {
  const [state, action, pending] = useActionState(createWalkUpRegistrationAction, initialState);
  useRefreshOnSuccess(state);

  return (
    <details className="border border-[#D4A017]/30 bg-[#111] p-4">
      <summary className="cursor-pointer list-none text-sm font-black uppercase text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]">
        + Add Walk-Up
      </summary>
      <form action={action} className="mt-5 grid gap-4" data-testid="walk-up-form">
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Entry Type"><select name="registrationType" className={input} defaultValue="team"><option value="team">Team</option><option value="solo">Solo</option></select></Field>
          <Field label="Payment Method"><select name="paymentMethod" className={input} defaultValue="cash"><option value="cash">Cash</option><option value="card">Card</option><option value="other">Other</option></select></Field>
        </div>
        <AnglerFields position={1} required />
        <AnglerFields position={2} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Member Pot"><select name="memberPot" className={input} defaultValue=""><option value="">None</option><option value="bronze">Bronze</option><option value="silver">Silver</option><option value="gold">Gold</option></select></Field>
          <Field label="Total Collected"><input name="totalPaid" type="number" min="0" step="0.01" required className={input} /></Field>
          <Check name="bigBass" label="Big Bass" />
          <Check name="insurance" label="Insurance Pot" />
        </div>
        <p className="text-xs leading-5 text-neutral-500">The next tournament boat number is assigned automatically. Angler 2 is required for Team entries. Membership selections are saved with this paid walk-up and synchronized to Members automatically.</p>
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={pending} className={adminButtonStyles("primary", "min-h-11")}>{pending ? "Saving…" : "Save Walk-Up"}</button>
          <ActionMessage state={state} />
        </div>
      </form>
    </details>
  );
}

function AnglerFields({ position, required = false }: { position: 1 | 2; required?: boolean }) {
  const prefix = `angler${position}`;
  return <fieldset className="border border-white/10 p-3"><legend className="px-2 text-xs font-black uppercase text-white">Angler {position}{required ? "" : " — Team Entries"}</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="First Name"><input name={`${prefix}FirstName`} required={required} className={input} /></Field><Field label="Last Name"><input name={`${prefix}LastName`} required={required} className={input} /></Field><Field label="Street Address"><input name={`${prefix}StreetAddress`} required={required} className={input} /></Field><Field label="City"><input name={`${prefix}City`} required={required} className={input} /></Field><Field label="State"><input name={`${prefix}State`} required={required} maxLength={2} className={input} /></Field><Field label="ZIP"><input name={`${prefix}ZipCode`} required={required} inputMode="numeric" className={input} /></Field><Field label="Email"><input name={`${prefix}Email`} type="email" required={required} className={input} /></Field><Field label="Phone"><input name={`${prefix}Phone`} type="tel" required={required} className={input} /></Field><Field label="Membership"><select name={`${prefix}Membership`} className={input} defaultValue="non-member"><option value="non-member">Non-Member</option><option value="current">Current Member</option><option value="joining">Joining / Purchasing</option></select></Field></div></fieldset>;
}

export function RegistrationEditControl({
  tournamentId,
  registrationId,
  boatNumber,
  bigBass,
  memberPot,
  insurance,
  checkedIn,
  walkUp,
  contactSnapshot,
}: {
  tournamentId: string;
  registrationId: string;
  boatNumber: number | null;
  bigBass: boolean;
  memberPot: "bronze" | "silver" | "gold" | null;
  insurance: boolean;
  checkedIn: boolean;
  walkUp: boolean;
  contactSnapshot: RegistrationParticipantContactSnapshot[];
}) {
  const [state, action, pending] = useActionState(updateRegistrationOperationsAction.bind(null, tournamentId, registrationId), initialState);
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelWalkUpRegistrationAction.bind(null, tournamentId, registrationId), initialState);
  useRefreshOnSuccess(state.status === "success" ? state : cancelState);

  if (checkedIn) return <details className="mt-2"><summary className="cursor-pointer text-[10px] font-bold uppercase text-neutral-500">Locked after check-in / Registration Details</summary><div className="mt-3 border border-white/10 bg-black/30 p-3"><p className="text-[10px] font-black uppercase text-[#D4A017]">Submitted Contact Snapshot</p>{contactSnapshot.map((contact, index) => <address key={`${contact.email}-${index}`} className="mt-2 not-italic text-xs leading-5 text-neutral-300"><strong className="text-white">Angler {index + 1}: {contact.firstName} {contact.lastName}</strong><br />{contact.streetAddress}<br />{contact.city}, {contact.state} {contact.zipCode}<br />{contact.email} · {contact.phone}<br />Membership: {contact.membership}</address>)}</div></details>;

  return <details className="mt-2"><summary className="cursor-pointer text-[10px] font-black uppercase text-neutral-400 hover:text-[#D4A017]">Edit / Registration Details</summary><div className="mt-3 border border-white/10 bg-black/30 p-3"><p className="text-[10px] font-black uppercase text-[#D4A017]">Submitted Contact Snapshot</p>{contactSnapshot.map((contact, index) => <address key={`${contact.email}-${index}`} className="mt-2 not-italic text-xs leading-5 text-neutral-300"><strong className="text-white">Angler {index + 1}: {contact.firstName} {contact.lastName}</strong><br />{contact.streetAddress}<br />{contact.city}, {contact.state} {contact.zipCode}<br />{contact.email} · {contact.phone}<br />Membership: {contact.membership}</address>)}</div><form action={action} className="mt-3 grid gap-3 border border-white/10 bg-black/30 p-3"><Field label="Boat #"><input name="boatNumber" type="number" min="1" required defaultValue={boatNumber ?? ""} className={input} /></Field>{walkUp ? <><Field label="Member Pot"><select name="memberPot" defaultValue={memberPot ?? ""} className={input}><option value="">None</option><option value="bronze">Bronze</option><option value="silver">Silver</option><option value="gold">Gold</option></select></Field><Check name="bigBass" label="Big Bass" defaultChecked={bigBass} /><Check name="insurance" label="Insurance Pot" defaultChecked={insurance} /></> : <p className="text-xs leading-5 text-neutral-500">Paid online selections and submitted contact snapshots remain immutable.</p>}<button disabled={pending} className={adminButtonStyles("secondary", "min-h-10")}>{pending ? "Saving…" : "Save Corrections"}</button><ActionMessage state={state} /></form>{walkUp ? <form action={cancelAction} onSubmit={(event) => { if (!window.confirm("Cancel this walk-up? It will leave the active field but remain in the audit record. Permanent anglers, memberships, and review history will be retained.")) event.preventDefault(); }} className="mt-2"><button disabled={cancelPending} className={adminButtonStyles("destructive", "min-h-10")}>{cancelPending ? "Cancelling…" : "Cancel Walk-Up"}</button><ActionMessage state={cancelState} /></form> : null}</details>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function Check({ name, label, defaultChecked = false }: { name: string; label: string; defaultChecked?: boolean }) { return <label className="flex min-h-11 items-center gap-2 border border-white/10 px-3 text-xs font-bold text-white"><input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-4 accent-red-600" />{label}</label>; }
function ActionMessage({ state }: { state: RegistrationOperationsActionState }) { return state.status === "idle" ? null : <p role={state.status === "error" ? "alert" : "status"} className={`text-xs ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}>{state.message}</p>; }
