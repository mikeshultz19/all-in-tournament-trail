"use client";

import { useActionState, useState } from "react";

import {
  resolveRegistrationReviewAction,
  type RegistrationReviewActionState,
} from "@/app/admin/registration-review/actions";
import type { RegistrationReviewAnglerOption } from "@/lib/registration-identity-review";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";

const initialState: RegistrationReviewActionState = {
  status: "idle",
  message: "",
};

export default function RegistrationReviewResolutionForm({
  reviewId,
  anglers,
  suggestedAnglerIds,
  submission,
}: {
  reviewId: string;
  anglers: RegistrationReviewAnglerOption[];
  suggestedAnglerIds: string[];
  submission: { name: string; email: string | null; phone: string | null; membership: "current" | "joining" | "non-member" | null };
}) {
  const [state, action, pending] = useActionState(
    resolveRegistrationReviewAction,
    initialState,
  );
  const initialAnglerId = suggestedAnglerIds.find((id) => anglers.some((angler) => angler.id === id)) ?? "";
  const [selectedAnglerId, setSelectedAnglerId] = useState(initialAnglerId);

  const orderedAnglers = [...anglers].sort((left, right) => {
    const leftSuggested = suggestedAnglerIds.includes(left.id);
    const rightSuggested = suggestedAnglerIds.includes(right.id);
    if (leftSuggested !== rightSuggested) return leftSuggested ? -1 : 1;
    return left.display_name.localeCompare(right.display_name);
  });
  const selectedAngler = orderedAnglers.find((angler) => angler.id === selectedAnglerId) ?? null;
  const matchReason = selectedAngler ? describeReviewCandidateMatch(submission, selectedAngler, suggestedAnglerIds.length) : null;

  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <section className="border border-white/10 bg-black/20 p-3 sm:col-span-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D4A017]">Registration Submission</h3>
        <dl className="mt-2 grid gap-x-5 gap-y-1 text-xs text-neutral-300 sm:grid-cols-2"><Detail label="Name" value={submission.name} /><Detail label="Email" value={submission.email} /><Detail label="Phone" value={submission.phone} /><Detail label="Membership Selection" value={membershipSelection(submission.membership)} /></dl>
      </section>
      <div className="border border-white/10 bg-black/20 p-3">
      <label className="text-xs font-black uppercase text-neutral-300">
        Existing angler
        <select
          name="existingAnglerId"
          className="mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 text-sm text-white"
          value={selectedAnglerId}
          onChange={(event) => setSelectedAnglerId(event.target.value)}
        >
          <option value="">Select an Angler</option>
          {orderedAnglers.map((angler) => (
            <option key={angler.id} value={angler.id}>
              {suggestedAnglerIds.includes(angler.id) ? "Suggested — " : ""}
              {angler.display_name}
              {angler.email ? ` — ${angler.email}` : ""}
            </option>
          ))}
        </select>
      </label>
      {selectedAngler ? <section className="mt-3 border-t border-white/10 pt-3"><h3 className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D4A017]">Existing Angler</h3><dl className="mt-2 grid gap-y-1 text-xs text-neutral-300"><Detail label="Name" value={selectedAngler.display_name} /><Detail label="Email" value={selectedAngler.email} /><Detail label="Phone" value={selectedAngler.phone} /><Detail label="Membership Status" value={membershipStatus(selectedAngler.membershipStatus)} />{selectedAngler.membershipEffectiveDate ? <Detail label="Membership Effective" value={formatDate(selectedAngler.membershipEffectiveDate)} /> : null}</dl>{matchReason ? <p className="mt-3 text-xs font-bold text-amber-200">{matchReason}</p> : null}</section> : null}
      <button
        name="resolution"
        value="existing"
        disabled={pending}
        className={adminButtonStyles("primary", "mt-2")}
      >
        Confirm Match
      </button>
      </div>
      <div className="border border-white/10 bg-black/20 p-3">
        <p className="text-xs font-black uppercase text-neutral-300">New angler</p>
        <p className="mt-2 text-xs text-neutral-500">Use this when the submitted person is not the existing angler.</p>
        <button
          name="resolution"
          value="new"
          disabled={pending}
          className={adminButtonStyles("secondary", "mt-3")}
        >
          Approve New Angler
        </button>
      </div>
      <label className="text-xs text-neutral-500 sm:col-span-2">
        Optional review note
        <input
          name="reviewNote"
          className="mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 text-sm text-white"
        />
      </label>
      {state.message && (
        <p
          className={`text-sm sm:col-span-2 ${
            state.status === "error" ? "text-red-400" : "text-green-400"
          }`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) { return <div><dt className="font-bold text-white">{label}</dt><dd>{value || "Not available"}</dd></div>; }
function normalizeEmail(value: string | null) { return value?.trim().toLowerCase() ?? ""; }
function normalizePhone(value: string | null) { return value?.replace(/\D/g, "") ?? ""; }
export function describeReviewCandidateMatch(submission: { email: string | null; phone: string | null }, angler: RegistrationReviewAnglerOption, candidateCount: number) {
  const email = Boolean(normalizeEmail(submission.email)) && normalizeEmail(submission.email) === normalizeEmail(angler.email);
  const phone = Boolean(normalizePhone(submission.phone)) && normalizePhone(submission.phone) === normalizePhone(angler.phone);
  if (email && phone) return "Matched by: Email and Phone";
  if (email) return "Matched by: Email";
  if (phone) return "Matched by: Phone";
  return candidateCount > 1 ? "Possible matches were found using different contact fields." : "Suggested from the submitted identity details.";
}
function membershipSelection(value: "current" | "joining" | "non-member" | null) { return value === "joining" ? "Purchased / New Membership" : value === "current" ? "Current Member" : value === "non-member" ? "Non-Member" : "Not available"; }
function membershipStatus(value: "active" | "inactive" | null) { return value === "active" ? "Active Member" : value === "inactive" ? "Inactive Membership" : "No membership found"; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "short", day: "numeric" }).format(new Date(`${value.slice(0, 10)}T12:00:00-05:00`)); }
