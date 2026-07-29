"use client";

import { useActionState } from "react";

import {
  resolveRegistrationReviewAction,
  type RegistrationReviewActionState,
} from "@/app/admin/registration-review/actions";
import type { Angler } from "@/types/aoy";

const initialState: RegistrationReviewActionState = {
  status: "idle",
  message: "",
};

export default function RegistrationReviewResolutionForm({
  reviewId,
  anglers,
  suggestedAnglerIds,
}: {
  reviewId: string;
  anglers: Angler[];
  suggestedAnglerIds: string[];
}) {
  const [state, action, pending] = useActionState(
    resolveRegistrationReviewAction,
    initialState,
  );

  const orderedAnglers = [...anglers].sort((left, right) => {
    const leftSuggested = suggestedAnglerIds.includes(left.id);
    const rightSuggested = suggestedAnglerIds.includes(right.id);
    if (leftSuggested !== rightSuggested) return leftSuggested ? -1 : 1;
    return left.display_name.localeCompare(right.display_name);
  });

  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <label className="text-xs font-black uppercase text-neutral-300">
        Existing Angler
        <select
          name="existingAnglerId"
          className="mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 text-sm text-white"
          defaultValue=""
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
      <label className="text-xs font-black uppercase text-neutral-300">
        Review Note
        <input
          name="reviewNote"
          className="mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 text-sm text-white"
        />
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button
          name="resolution"
          value="existing"
          disabled={pending}
          className="min-h-10 bg-[#D4A017] px-4 text-xs font-black uppercase text-black disabled:opacity-50"
        >
          Confirm Existing
        </button>
        <button
          name="resolution"
          value="new"
          disabled={pending}
          className="min-h-10 border border-white/20 px-4 text-xs font-black uppercase text-white disabled:opacity-50"
        >
          Approve New Angler
        </button>
      </div>
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
