"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  cancelWalkUpRegistrationAction,
  createWalkUpRegistrationAction,
  updateRegistrationOperationsAction,
  getWalkUpMemberAction,
  searchWalkUpMembersAction,
  type RegistrationOperationsActionState,
} from "@/app/admin/registration-review/actions";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import {
  createDefaultWalkUpRegistrationDraft,
  getWalkUpDisplayPricing,
  type WalkUpRegistrationDraft,
} from "@/lib/walk-up-registration-form";
import { formatCurrencyFromCents } from "@/config/payment-policy";
import { hasFullMembershipEligibility, type Membership } from "@/lib/registration";
import type { RegistrationParticipantContactSnapshot } from "@/lib/tournament-registration-roster";

const initialState: RegistrationOperationsActionState = {
  status: "idle",
  message: "",
};

const initialDraft = createDefaultWalkUpRegistrationDraft();
const input =
  "min-h-11 w-full border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-[#D4A017]";

function useRefreshOnSuccess(state: RegistrationOperationsActionState) {
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);
}

export function AddWalkUpControl({ tournamentId }: { tournamentId: string }) {
  const [registrationType, setRegistrationType] = useState(initialDraft.registrationType);
  const [paymentMethod, setPaymentMethod] = useState(initialDraft.paymentMethod);
  const [angler1Membership, setAngler1Membership] = useState(initialDraft.angler1Membership);
  const [angler2Membership, setAngler2Membership] = useState(initialDraft.angler2Membership);
  const [memberPot, setMemberPot] = useState<WalkUpRegistrationDraft["memberPot"]>(initialDraft.memberPot);
  const [bigBass, setBigBass] = useState(initialDraft.bigBass);
  const [insurance, setInsurance] = useState(initialDraft.insurance);
  const [selectedMembers, setSelectedMembers] = useState<{ 1: string | null; 2: string | null }>({ 1: null, 2: null });
  const [formInstance, setFormInstance] = useState(0);
  const [displayState, setDisplayState] = useState<RegistrationOperationsActionState>(initialState);
  const [state, action, pending] = useActionState(
    async (previousState: RegistrationOperationsActionState, formData: FormData) => {
      const nextState = await createWalkUpRegistrationAction(previousState, formData);
      setDisplayState(nextState);
      if (nextState.status === "success") {
        setRegistrationType(initialDraft.registrationType);
        setPaymentMethod(initialDraft.paymentMethod);
        setAngler1Membership(initialDraft.angler1Membership);
        setAngler2Membership(initialDraft.angler2Membership);
        setMemberPot(initialDraft.memberPot);
        setBigBass(initialDraft.bigBass);
        setInsurance(initialDraft.insurance);
        setSelectedMembers({ 1: null, 2: null });
      }
      return nextState;
    },
    initialState,
  );
  useRefreshOnSuccess(state);

  const draft = state.draft ?? initialDraft;
  const formKey =
    state.status === "error" ? `${JSON.stringify(draft)}:${formInstance}` : `walk-up-form-default:${formInstance}`;
  const memberships = registrationType === "team"
    ? [angler1Membership, angler2Membership]
    : [angler1Membership];
  const memberOptionsEligible = hasFullMembershipEligibility({
    registrationType,
    memberships,
  });
  const walkUpPricing = getWalkUpDisplayPricing({
    registrationType,
    paymentMethod,
    memberships,
    memberPot: memberPot || null,
    bigBass,
    insurance,
  });
  const totalCollectedCents = walkUpPricing.totalCollectedCents;

  function closeWalkUp() {
    const details = document.querySelector<HTMLDetailsElement>("details[data-walk-up-panel]");
    if (details) details.open = false;
    setFormInstance((current) => current + 1);
    setSelectedMembers({ 1: null, 2: null });
    setDisplayState(initialState);
  }

  function updateRegistrationType(value: "solo" | "team") {
    setRegistrationType(value);
    const nextMemberships = value === "team"
      ? [angler1Membership, angler2Membership]
      : [angler1Membership];
    if (!hasFullMembershipEligibility({ registrationType: value, memberships: nextMemberships })) {
      setMemberPot("");
      setInsurance(false);
    }
  }

  function updateMembership(position: 1 | 2, value: Membership) {
    if (position === 1) setAngler1Membership(value);
    else setAngler2Membership(value);
    const nextMemberships = registrationType === "team"
      ? [position === 1 ? value : angler1Membership, position === 2 ? value : angler2Membership]
      : [position === 1 ? value : angler1Membership];
    if (!hasFullMembershipEligibility({ registrationType, memberships: nextMemberships })) {
      setMemberPot("");
      setInsurance(false);
    }
  }

  return (
    <details data-walk-up-panel className="relative border border-[#D4A017]/30 bg-[#111] p-4">
      <summary className="cursor-pointer list-none text-sm font-black uppercase text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]">
        + Add Walk-Up
      </summary>
      <button
        type="button"
        aria-label="Close walk-up form"
        onClick={closeWalkUp}
        className="absolute right-4 top-4 flex size-7 items-center justify-center border border-white/20 bg-black/70 text-xs font-black text-white transition hover:border-[#D4A017] hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
      >
        ×
      </button>
      <form
        key={formKey}
        action={action}
        className="mt-5 grid gap-4"
        data-testid="walk-up-form"
      >
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Entry Type">
            <select
              name="registrationType"
              className={input}
              value={registrationType}
              onChange={(event) => updateRegistrationType(event.target.value as "solo" | "team")}
            >
              <option value="team">Team</option>
              <option value="solo">Solo</option>
            </select>
            {registrationType === "solo" ? <p className="mt-2 text-xs font-bold text-red-300">Verify this entry is not part of an existing team.</p> : null}
          </Field>
          <Field label="Payment Method">
            <select
              name="paymentMethod"
              className={input}
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as "cash" | "card" | "other")}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>
        <AnglerFields key="angler-1" position={1} required draft={draft} tournamentId={tournamentId} selectedOtherMemberId={selectedMembers[2]} onSelectedMember={(id) => setSelectedMembers((current) => ({ ...current, 1: id }))} membershipValue={angler1Membership} onMembershipChange={(value) => updateMembership(1, value)} />
        <input type="hidden" name="angler1SelectedMemberId" value={selectedMembers[1] ?? ""} />
        <AnglerFields key="angler-2" position={2} draft={draft} tournamentId={tournamentId} selectedOtherMemberId={selectedMembers[1]} onSelectedMember={(id) => setSelectedMembers((current) => ({ ...current, 2: id }))} membershipValue={angler2Membership} onMembershipChange={(value) => updateMembership(2, value)} />
        <input type="hidden" name="angler2SelectedMemberId" value={selectedMembers[2] ?? ""} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Member Pot">
            <select
              name="memberPot"
              className={input}
              value={memberPot}
              disabled={!memberOptionsEligible}
              onChange={(event) => setMemberPot(event.target.value as WalkUpRegistrationDraft["memberPot"])}
            >
              <option value="">None</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </Field>
          <Field label="Total Collected">
            <input type="hidden" name="totalPaid" value={(totalCollectedCents / 100).toFixed(2)} />
            <output className="flex min-h-11 items-center border border-[#D4A017]/50 bg-[#D4A017]/10 px-3 text-lg font-black tabular-nums text-[#D4A017]" aria-live="polite">
              {formatCurrencyFromCents(totalCollectedCents)}
            </output>
            {paymentMethod === "card" ? <p className="mt-1 text-xs text-neutral-400">SQUARE SERVICE FEE (3%) {formatCurrencyFromCents(walkUpPricing.cardProcessingFeeCents)}</p> : null}
          </Field>
          <Check name="bigBass" label="Big Bass" checked={bigBass} onChange={setBigBass} />
          <Check
            name="insurance"
            label="Insurance Pot"
            checked={insurance}
            disabled={!memberOptionsEligible}
            onChange={setInsurance}
          />
        </div>
        <p className="text-xs leading-5 text-neutral-500">
          The next tournament boat number is assigned automatically. Angler 2 is
          required for Team entries. Membership selections are saved with this
          paid walk-up and synchronized to Members automatically.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={pending}
            className={adminButtonStyles("primary", "min-h-11")}
          >
            {pending ? "Saving..." : "Save Walk-Up"}
          </button>
          <span className="min-w-0 flex-1"><ActionMessage state={displayState} /></span>
          <button
            type="button"
            onClick={closeWalkUp}
            className="ml-auto flex size-7 shrink-0 items-center justify-center border border-white/20 bg-black/70 text-xs font-black text-white transition hover:border-[#D4A017] hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
            aria-label="Close walk-up form"
          >
            ×
          </button>
        </div>
      </form>
    </details>
  );
}

function AnglerFields({
  position,
  draft,
  tournamentId,
  selectedOtherMemberId,
  onSelectedMember,
  required = false,
  membershipValue,
  onMembershipChange,
}: {
  position: 1 | 2;
  draft: WalkUpRegistrationDraft;
  tournamentId: string;
  selectedOtherMemberId: string | null;
  onSelectedMember: (id: string | null) => void;
  required?: boolean;
  membershipValue: Membership;
  onMembershipChange: (membership: Membership) => void;
}) {
  const prefix = `angler${position}` as const;
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [memberLookup, setMemberLookup] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchWalkUpMembersAction>>>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [searching, startSearch] = useTransition();
  useEffect(() => {
    if (!memberLookup || search.trim().length < 2) return;
    const timer = window.setTimeout(() => startSearch(async () => {
      try { setLookupError(""); setResults(await searchWalkUpMembersAction(tournamentId, search)); }
      catch { setResults([]); setLookupError("Member search is unavailable."); }
    }), 250);
    return () => window.clearTimeout(timer);
  }, [memberLookup, search, tournamentId]);

  function selectMember(id: string) {
    if (id === selectedOtherMemberId) { setLookupError("That member is already selected for the other angler."); return; }
    startSearch(async () => {
      const member = await getWalkUpMemberAction(tournamentId, id);
      if (!member) { setLookupError("Member is no longer available."); return; }
      const values: Record<string, string> = {
        [`${prefix}FirstName`]: member.firstName,
        [`${prefix}LastName`]: member.lastName,
        [`${prefix}StreetAddress`]: member.streetAddress ?? "",
        [`${prefix}City`]: member.city ?? "",
        [`${prefix}State`]: member.state ?? "",
        [`${prefix}ZipCode`]: member.zipCode ?? "",
        [`${prefix}Email`]: member.email ?? "",
        [`${prefix}Phone`]: member.phone ?? "",
      };
      Object.entries(values).forEach(([name, value]) => {
        const input = fieldsetRef.current?.querySelector<HTMLInputElement>(`[name="${name}"]`);
        if (input) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); }
      });
      onMembershipChange(member.membershipStatus === "active" ? "current" : "non-member");
      setSelectedName(`${member.firstName} ${member.lastName}`);
      setSearch(""); setResults([]); setLookupError(""); onSelectedMember(id);
    });
  }
  const values =
    position === 1
      ? {
          firstName: draft.angler1FirstName,
          lastName: draft.angler1LastName,
          streetAddress: draft.angler1StreetAddress,
          city: draft.angler1City,
          state: draft.angler1State,
          zipCode: draft.angler1ZipCode,
          email: draft.angler1Email,
          phone: draft.angler1Phone,
          membership: draft.angler1Membership,
        }
      : {
          firstName: draft.angler2FirstName,
          lastName: draft.angler2LastName,
          streetAddress: draft.angler2StreetAddress,
          city: draft.angler2City,
          state: draft.angler2State,
          zipCode: draft.angler2ZipCode,
          email: draft.angler2Email,
          phone: draft.angler2Phone,
          membership: draft.angler2Membership,
        };

  return (
    <fieldset ref={fieldsetRef} className="border border-white/10 p-3">
      <legend className="px-2 text-xs font-black uppercase text-white">
        Angler {position}
        {required ? "" : " — Team Entries"}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex items-center gap-2 text-[11px] font-bold uppercase text-neutral-300 sm:col-span-2 lg:col-span-4">
          <input type="checkbox" checked={memberLookup} onChange={(event) => { setMemberLookup(event.target.checked); if (!event.target.checked) { setSelectedName(null); onSelectedMember(null); } }} />
          Member Search
        </label>
        {memberLookup ? <div className="relative sm:col-span-2 lg:col-span-4">
          <label className="text-xs font-bold uppercase text-neutral-400">Find Existing Member</label>
          <input className={input} value={search} onChange={(event) => { setSearch(event.target.value); if (event.target.value.trim().length < 2) setResults([]); }} placeholder="Name, phone, or email" />
          {searching ? <p className="mt-1 text-xs text-neutral-400">Searching…</p> : null}
          {!searching && search.trim().length >= 2 && results.length === 0 && !lookupError ? <p className="mt-1 text-xs text-neutral-400">No members found.</p> : null}
          {lookupError ? <p className="mt-1 text-xs text-red-300">{lookupError}</p> : null}
          {results.length > 0 ? <div className="absolute z-10 mt-1 w-full border border-[#D4A017]/40 bg-[#111] shadow-xl">{results.map((result) => <button key={result.anglerId} type="button" className="block w-full border-b border-white/10 px-3 py-2 text-left text-xs hover:bg-white/10" onClick={() => selectMember(result.anglerId)}><span className="block font-bold text-white">{result.displayName}</span><span className="text-neutral-400">{result.emailHint} · {result.phoneHint} · {result.membershipStatus === "active" ? "Current Member" : result.membershipStatus}</span></button>)}</div> : null}
          {selectedName ? <p className="mt-1 text-xs font-bold text-[#D4A017]">Selected: {selectedName} · <button type="button" className="underline" onClick={() => { setSelectedName(null); onSelectedMember(null); }}>Change</button></p> : null}
        </div> : null}
        <Field label="First Name">
          <input
            name={`${prefix}FirstName`}
            required={required}
            className={input}
            defaultValue={values.firstName}
          />
        </Field>
        <Field label="Last Name">
          <input
            name={`${prefix}LastName`}
            required={required}
            className={input}
            defaultValue={values.lastName}
          />
        </Field>
        <Field label="Street Address">
          <input
            name={`${prefix}StreetAddress`}
            required={required}
            className={input}
            defaultValue={values.streetAddress}
          />
        </Field>
        <Field label="City">
          <input
            name={`${prefix}City`}
            required={required}
            className={input}
            defaultValue={values.city}
          />
        </Field>
        <Field label="State">
          <input
            name={`${prefix}State`}
            required={required}
            maxLength={2}
            className={input}
            defaultValue={values.state}
          />
        </Field>
        <Field label="ZIP">
          <input
            name={`${prefix}ZipCode`}
            required={required}
            inputMode="numeric"
            className={input}
            defaultValue={values.zipCode}
          />
        </Field>
        <Field label="Email">
          <input
            name={`${prefix}Email`}
            type="email"
            required={required}
            className={input}
            defaultValue={values.email}
          />
        </Field>
        <Field label="Phone">
          <input
            name={`${prefix}Phone`}
            type="tel"
            required={required}
            className={input}
            defaultValue={values.phone}
          />
        </Field>
        <Field label="Membership">
          <select
            name={`${prefix}Membership`}
            className={input}
            value={membershipValue}
            onChange={(event) => onMembershipChange(event.target.value as Membership)}
          >
            <option value="non-member">Non-Member</option>
            <option value="current">Current Member</option>
            <option value="joining">Joining / Purchasing</option>
          </select>
        </Field>
      </div>
    </fieldset>
  );
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
  const [state, action, pending] = useActionState(
    updateRegistrationOperationsAction.bind(null, tournamentId, registrationId),
    initialState,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelWalkUpRegistrationAction.bind(null, tournamentId, registrationId),
    initialState,
  );
  useRefreshOnSuccess(state.status === "success" ? state : cancelState);

  if (checkedIn) {
    return (
      <details className="mt-2">
        <summary className="cursor-pointer text-[10px] font-bold uppercase text-neutral-500">
          Locked after check-in / Registration Details
        </summary>
        <div className="mt-3 border border-white/10 bg-black/30 p-3">
          <p className="text-[10px] font-black uppercase text-[#D4A017]">
            Submitted Contact Snapshot
          </p>
          {contactSnapshot.map((contact, index) => (
            <address
              key={`${contact.email}-${index}`}
              className="mt-2 not-italic text-xs leading-5 text-neutral-300"
            >
              <strong className="text-white">
                Angler {index + 1}: {contact.firstName} {contact.lastName}
              </strong>
              <br />
              {contact.streetAddress}
              <br />
              {contact.city}, {contact.state} {contact.zipCode}
              <br />
              {contact.email} · {contact.phone}
              <br />
              Membership: {contact.membership}
            </address>
          ))}
        </div>
      </details>
    );
  }

  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-[10px] font-black uppercase text-neutral-400 hover:text-[#D4A017]">
        Edit / Registration Details
      </summary>
      <div className="mt-3 border border-white/10 bg-black/30 p-3">
        <p className="text-[10px] font-black uppercase text-[#D4A017]">
          Submitted Contact Snapshot
        </p>
        {contactSnapshot.map((contact, index) => (
          <address
            key={`${contact.email}-${index}`}
            className="mt-2 not-italic text-xs leading-5 text-neutral-300"
          >
            <strong className="text-white">
              Angler {index + 1}: {contact.firstName} {contact.lastName}
            </strong>
            <br />
            {contact.streetAddress}
            <br />
            {contact.city}, {contact.state} {contact.zipCode}
            <br />
            {contact.email} · {contact.phone}
            <br />
            Membership: {contact.membership}
          </address>
        ))}
      </div>
      <form
        action={action}
        className="mt-3 grid gap-3 border border-white/10 bg-black/30 p-3"
      >
        <Field label="Boat #">
          <input
            name="boatNumber"
            type="number"
            min="1"
            required
            defaultValue={boatNumber ?? ""}
            className={input}
          />
        </Field>
        {walkUp ? (
          <>
            <Field label="Member Pot">
              <select
                name="memberPot"
                defaultValue={memberPot ?? ""}
                className={input}
              >
                <option value="">None</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </select>
            </Field>
            <Check name="bigBass" label="Big Bass" defaultChecked={bigBass} />
            <Check
              name="insurance"
              label="Insurance Pot"
              defaultChecked={insurance}
            />
          </>
        ) : (
          <p className="text-xs leading-5 text-neutral-500">
            Paid online selections and submitted contact snapshots remain
            immutable.
          </p>
        )}
        <button disabled={pending} className={adminButtonStyles("secondary", "min-h-10")}>
          {pending ? "Saving..." : "Save Corrections"}
        </button>
        <ActionMessage state={state} />
      </form>
      {walkUp ? (
        <form
          action={cancelAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                "Cancel this walk-up? It will leave the active field but remain in the audit record. Permanent anglers, memberships, and review history will be retained.",
              )
            ) {
              event.preventDefault();
            }
          }}
          className="mt-2"
        >
          <button
            disabled={cancelPending}
            className={adminButtonStyles("destructive", "min-h-10")}
          >
            {cancelPending ? "Cancelling..." : "Cancel Walk-Up"}
          </button>
          <ActionMessage state={cancelState} />
        </form>
      ) : null}
    </details>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Check({
  name,
  label,
  defaultChecked = false,
  checked,
  disabled = false,
  onChange,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 border border-white/10 px-3 text-xs font-bold text-white">
      <input
        name={name}
        type="checkbox"
        {...(checked === undefined ? { defaultChecked } : { checked })}
        disabled={disabled}
        onChange={onChange ? (event) => onChange(event.target.checked) : undefined}
        className="size-4 accent-red-600"
      />
      {label}
    </label>
  );
}

function ActionMessage({
  state,
}: {
  state: RegistrationOperationsActionState;
}) {
  return state.status === "idle" ? null : (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={`text-xs ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}
    >
      {state.message}
    </p>
  );
}
