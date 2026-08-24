"use client";

import { useActionState } from "react";

import {
  resolveRegistrationContactReviewAction,
  type RegistrationReviewActionState,
} from "@/app/admin/registration-review/actions";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import type { RegistrationContact } from "@/lib/registration-identity-review";

const initialState: RegistrationReviewActionState = {
  status: "idle",
  message: "",
};

const labels: Record<string, string> = {
  firstName: "First name",
  lastName: "Last name",
  streetAddress: "Address",
  city: "City",
  state: "State",
  zipCode: "ZIP",
  email: "Email",
  phone: "Phone",
};

export function getMatchedByLabel(reviewReason: string): string {
  if (/email and phone are associated with different/i.test(reviewReason)) {
    return "Email and Phone";
  }
  if (/submitted email is already associated/i.test(reviewReason)) {
    return "Email";
  }
  if (/submitted phone is already associated/i.test(reviewReason)) {
    return "Phone";
  }
  return "Contact Information";
}

export default function RegistrationContactReviewForm({
  reviewId,
  participantName,
  reviewReason,
  existing,
  submitted,
  differingFields,
}: {
  reviewId: string;
  participantName: string;
  reviewReason: string;
  existing: RegistrationContact;
  submitted: RegistrationContact;
  differingFields: string[];
}) {
  const [state, action, pending] = useActionState(
    resolveRegistrationContactReviewAction,
    initialState,
  );

  return (
    <form
      action={action}
      className="mt-3 grid gap-3 border border-amber-400/20 bg-black/30 p-3"
    >
      <input type="hidden" name="reviewId" value={reviewId} />
      <p className="text-xs text-neutral-300">
        <strong className="text-white">{participantName}</strong> — Contact
        information mismatch
      </p>
      <p className="text-xs text-neutral-300">
        <strong className="text-white">Matched by:</strong>{" "}
        {getMatchedByLabel(reviewReason)}
      </p>
      <p className="text-xs text-amber-300">
        <strong>Differences:</strong>{" "}
        {differingFields.map((field) => labels[field] ?? field).join(", ")}
      </p>
      <details className="border-t border-white/10 pt-2">
        <summary className="cursor-pointer text-xs font-bold text-[#D4A017]">
          View differences
        </summary>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <ContactBlock
            title="Existing Member"
            contact={existing}
            fields={differingFields}
          />
          <ContactBlock
            title="Registration Submission"
            contact={submitted}
            fields={differingFields}
          />
        </div>
      </details>
      <input
        name="reviewNote"
        aria-label="Contact review note"
        placeholder="Optional review note"
        className="min-h-10 border border-white/15 bg-[#0B0B0B] px-2 text-xs text-white"
      />
      <div className="flex flex-wrap gap-2">
        <button
          name="decision"
          value="approve"
          disabled={pending}
          className={adminButtonStyles("primary", "min-h-10")}
        >
          SAME PERSON — UPDATE INFO
        </button>
        <button
          name="decision"
          value="keep"
          disabled={pending}
          className={adminButtonStyles("secondary", "min-h-10")}
        >
          SAME PERSON — KEEP EXISTING INFO
        </button>
        <button
          name="decision"
          value="different"
          disabled={pending}
          className={adminButtonStyles("secondary", "min-h-10")}
        >
          DIFFERENT PERSON — APPROVE NEW MEMBER
        </button>
      </div>
      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`text-xs ${
            state.status === "error" ? "text-red-300" : "text-emerald-300"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function ContactBlock({
  title,
  contact,
  fields,
}: {
  title: string;
  contact: RegistrationContact;
  fields: string[];
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-black uppercase text-neutral-400">
        {title}
      </p>
      <dl className="text-xs leading-5 text-neutral-300">
        {fields.map((field) => (
          <div key={field}>
            <dt className="inline font-bold text-white">
              {labels[field] ?? field}:{" "}
            </dt>
            <dd className="inline">
              {String(contact[field as keyof RegistrationContact] ?? "—")}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
