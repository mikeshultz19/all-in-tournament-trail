"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import {
  savePrepareMembershipReminderAction,
  type PrepareReminderState,
} from "@/app/admin/tournament-manager/prepare/actions";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";

const initialState: PrepareReminderState = {
  status: "idle",
  message: "",
};

type PrepareMembershipReminderProps = {
  tournamentId: string;
  tournamentName: string;
  tournamentIdentifier: string;
  needReviewCount: number;
  hasExistingImport: boolean;
  initialRegistrationReviewComplete: boolean;
  initialPaperMembershipsConfirmed: boolean;
  undoBlockers: string[];
  returnHref: string;
};

export default function PrepareMembershipReminder(props: PrepareMembershipReminderProps) {
  const {
    tournamentId,
    needReviewCount,
    hasExistingImport,
    initialRegistrationReviewComplete,
    initialPaperMembershipsConfirmed,
    undoBlockers,
  } = props;
  const [registrationReviewComplete, setRegistrationReviewComplete] = useState(
    initialRegistrationReviewComplete,
  );
  const [paperMembershipsConfirmed, setPaperMembershipsConfirmed] = useState(
    initialPaperMembershipsConfirmed,
  );
  const [savedComplete, setSavedComplete] = useState(
    initialRegistrationReviewComplete && initialPaperMembershipsConfirmed && needReviewCount === 0,
  );
  const [confirmingUndo, setConfirmingUndo] = useState(false);
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

  useEffect(() => {
    if (state.status !== "success" || state.savedComplete === undefined) return;
    setSavedComplete(state.savedComplete);
    setConfirmingUndo(false);
    if (!state.savedComplete) {
      setRegistrationReviewComplete(false);
      setPaperMembershipsConfirmed(false);
    }
  }, [state.savedComplete, state.status]);

  return (
    <AdminPanel variant="nested" className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white">
            Confirm Tournament Preparation
          </h2>
          <p className="mt-1 text-xs leading-5 text-neutral-400">
            Complete both confirmations before importing results.
          </p>
        </div>
        <div className="text-right">
          <AdminStatusBadge tone={readyToConfirm ? "positive" : "attention"}>
            {readyToConfirm ? "Ready" : "Not Ready"}
          </AdminStatusBadge>
        </div>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="intent" value="confirm" />
        <label className="flex items-start gap-3 text-sm text-neutral-200">
          <input
            name="prepare_registration_review_complete"
            type="checkbox"
            checked={registrationReviewComplete}
            onChange={(event) => setRegistrationReviewComplete(event.target.checked)}
            disabled={pending || savedComplete}
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
            disabled={pending || savedComplete}
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

        {!savedComplete ? <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!readyToConfirm || pending}
            className={adminButtonStyles("primary", "min-h-11 disabled:bg-neutral-700 disabled:text-neutral-400")}
          >
            Confirm Tournament Preparation Complete
          </button>
        </div> : null}

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

      {savedComplete ? (
        <div className="mt-5 border-t border-white/10 pt-4">
          {undoBlockers.length > 0 ? (
            <>
              <button type="button" disabled className={adminButtonStyles("ghost", "border border-white/10 text-neutral-600")}>
                Uncheck &amp; Save
              </button>
              <div className="mt-3 border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200" role="status">
                <p className="font-bold">Cannot uncheck preparation yet. Undo the later tournament steps first before changing these confirmations.</p>
                <ul className="mt-2 list-disc pl-5">{undoBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
              </div>
            </>
          ) : confirmingUndo ? (
            <form action={formAction} className="border border-amber-500/30 bg-amber-500/5 p-4">
              <input type="hidden" name="intent" value="undo" />
              <p className="text-sm font-semibold text-white">Uncheck and save the Tournament Preparation confirmations?</p>
              <p className="mt-2 text-xs leading-5 text-neutral-400">This clears only the two saved preparation confirmations. Registrations, memberships, Check-In, and later tournament data are not changed.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="submit" disabled={pending} className="min-h-10 bg-amber-600 px-4 text-xs font-black uppercase text-black disabled:opacity-50">{pending ? "Saving…" : "Confirm Uncheck & Save"}</button>
                <button type="button" disabled={pending} onClick={() => setConfirmingUndo(false)} className={adminButtonStyles("secondary")}>Cancel</button>
              </div>
            </form>
          ) : (
            <button type="button" onClick={() => setConfirmingUndo(true)} className={adminButtonStyles("warning")}>
              Uncheck &amp; Save
            </button>
          )}
        </div>
      ) : null}
    </AdminPanel>
  );
}
