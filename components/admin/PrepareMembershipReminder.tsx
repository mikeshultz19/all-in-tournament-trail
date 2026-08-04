"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import {
  savePrepareMembershipReminderAction,
  type PrepareReminderState,
} from "@/app/admin/tournament-manager/prepare/actions";

const initialState: PrepareReminderState = {
  status: "idle",
  message: "",
};

export default function PrepareMembershipReminder({
  tournamentId,
  tournamentName,
  tournamentIdentifier,
  needReviewCount,
  hasExistingImport,
  initialRegistrationReviewComplete,
  initialPaperMembershipsConfirmed,
  returnHref,
}: {
  tournamentId: string;
  tournamentName: string;
  tournamentIdentifier: string;
  needReviewCount: number;
  hasExistingImport: boolean;
  initialRegistrationReviewComplete: boolean;
  initialPaperMembershipsConfirmed: boolean;
  returnHref: string;
}) {
  const [registrationReviewComplete, setRegistrationReviewComplete] = useState(
    initialRegistrationReviewComplete,
  );
  const [paperMembershipsConfirmed, setPaperMembershipsConfirmed] = useState(
    initialPaperMembershipsConfirmed,
  );
  const [state, formAction, pending] = useActionState(
    savePrepareMembershipReminderAction.bind(null, tournamentId),
    initialState,
  );

  const readyToConfirm = useMemo(
    () =>
      registrationReviewComplete &&
      paperMembershipsConfirmed &&
      needReviewCount === 0,
    [needReviewCount, paperMembershipsConfirmed, registrationReviewComplete],
  );

  const preparationLockedMessage =
    hasExistingImport && !readyToConfirm
      ? "An import already exists for this tournament. Keep these confirmations complete so Import Results stays unlocked."
      : null;

  return (
    <section className="border border-white/10 bg-[#111111] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase text-white">
            Confirm Tournament Preparation
          </h2>
          <p className="mt-1 text-xs leading-5 text-neutral-400">
            Complete both confirmations before importing results.
          </p>
        </div>
        <div className="text-right text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
          <span className={readyToConfirm ? "text-emerald-400" : "text-amber-400"}>
            {readyToConfirm ? "Ready to Confirm" : "Not Ready"}
          </span>
        </div>
      </div>

     <div className="mt-4 rounded border border-white/10 bg-black/30 px-4 py-3">
  <div className="flex items-center justify-between">
    <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
      Preparation Status
    </span>

    <span
      className={`text-sm font-black uppercase ${
        readyToConfirm ? "text-emerald-400" : "text-amber-400"
      }`}
    >
      {readyToConfirm ? "Ready" : "Not Ready"}
    </span>
  </div>

  {!readyToConfirm && (
    <p className="mt-2 text-sm text-neutral-400">
      Complete both confirmations and resolve all registration reviews before
      Import Results is unlocked.
    </p>
  )}
</div>

      <form action={formAction} className="mt-4 space-y-4">
        <label className="flex items-start gap-3 text-sm text-neutral-200">
          <input
            name="prepare_registration_review_complete"
            type="checkbox"
            checked={registrationReviewComplete}
            onChange={(event) => setRegistrationReviewComplete(event.target.checked)}
            disabled={pending}
            className="mt-0.5 size-4 accent-[#D4A017]"
          />
          <span>
            <span className="block font-bold text-white">
              Registration review is complete and all entries needing attention are resolved.
            </span>
            <span className="mt-1 block text-xs leading-5 text-neutral-400">
              Resolve every pending registration review before unlocking Import Results.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm text-neutral-200">
          <input
            name="paper_membership_reminder_checked"
            type="checkbox"
            checked={paperMembershipsConfirmed}
            onChange={(event) => setPaperMembershipsConfirmed(event.target.checked)}
            disabled={pending}
            className="mt-0.5 size-4 accent-[#D4A017]"
          />
          <span>
            <span className="block font-bold text-white">
              Tournament-morning paper memberships have been added to the AITT Members list.
            </span>
            <span className="mt-1 block text-xs leading-5 text-neutral-400">
              Manual confirmation only. This does not create memberships automatically.
            </span>
          </span>
        </label>

        {preparationLockedMessage ? (
          <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-300" role="status">
            {preparationLockedMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!readyToConfirm || pending}
            className="inline-flex min-h-11 items-center bg-[#D4A017] px-4 text-xs font-black uppercase tracking-[0.12em] text-black transition disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            Confirm Tournament Preparation Complete
          </button>

        </div>

        {state.message ? (
          <p
            className={`text-xs font-black uppercase tracking-[0.12em] ${
              state.status === "error" ? "text-red-300" : "text-emerald-300"
            }`}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}

