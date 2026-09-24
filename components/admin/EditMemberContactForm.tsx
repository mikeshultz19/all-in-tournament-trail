"use client";

import { useActionState } from "react";

import {
  updateCanonicalMemberContactAction,
  type RegistrationReviewActionState,
} from "@/app/admin/registration-review/actions";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";

const initialState: RegistrationReviewActionState = { status: "idle", message: "" };

export type EditableMemberContact = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
};

export default function EditMemberContactForm({
  memberId,
  contact,
  compact = false,
}: {
  memberId: string;
  contact: EditableMemberContact;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(
    updateCanonicalMemberContactAction,
    initialState,
  );

  return (
    <form action={action} className="mt-3 grid gap-3 border border-[#D4A017]/30 bg-black/30 p-3 sm:grid-cols-2">
      <input type="hidden" name="memberId" value={memberId} />
      <p className="text-xs text-neutral-300 sm:col-span-2">
        Saving updates the canonical All Members record. The original
        registration submission snapshot remains unchanged.
      </p>
      {field("First name", "firstName", contact.firstName, true)}
      {field("Last name", "lastName", contact.lastName, true)}
      {field("Email", "email", contact.email ?? "", false, "email")}
      {field("Phone", "phone", contact.phone ?? "", true, "tel")}
      {field("Street address", "streetAddress", contact.streetAddress ?? "", true)}
      {field("City", "city", contact.city ?? "", true)}
      {field("State", "state", contact.state ?? "", true, "text", 2)}
      {field("ZIP code", "zipCode", contact.zipCode ?? "", true, "text")}
      <label className="text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400 sm:col-span-2">
        Optional correction note
        <input name="correctionNote" className="mt-1 min-h-10 w-full border border-white/15 bg-[#0B0B0B] px-2 text-xs text-white" placeholder="Verified at check-in" />
      </label>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <button disabled={pending} className={adminButtonStyles("primary", compact ? "min-h-9" : "min-h-10")}>
          {pending ? "Saving..." : "Save Member"}
        </button>
        {state.status !== "idle" ? <p role={state.status === "error" ? "alert" : "status"} className={`text-xs ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}>{state.message}</p> : null}
      </div>
    </form>
  );
}

function field(label: string, name: string, value: string, required: boolean, type = "text", maxLength?: number) {
  return (
    <label className="text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400">
      {label}
      <input name={name} type={type} required={required} maxLength={maxLength} defaultValue={value} autoComplete="off" className="mt-1 min-h-10 w-full border border-white/15 bg-[#0B0B0B] px-2 text-xs text-white" />
    </label>
  );
}
