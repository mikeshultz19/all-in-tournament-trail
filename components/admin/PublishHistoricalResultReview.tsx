"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  reviewHistoricalResultAction,
  type HistoricalResultReviewState,
} from "@/app/admin/tournament-manager/publish/actions";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { formatMembershipSummary } from "@/lib/publish-historical-review";

type RegistrationOption = {
  id: string;
  boatNumber: number | null;
  registrationType: "team" | "solo";
  angler1Name: string;
  angler2Name: string | null;
  identityReviewStatus: string;
  membershipSummary: string;
};

export interface HistoricalReviewRow {
  resultId: string;
  place: number | null;
  teamName: string;
  reason: string;
}

const initialState: HistoricalResultReviewState = {
  status: "idle",
  message: "",
};

function formatBoatNumber(boatNumber: number | null) {
  return boatNumber?.toString() ?? "—";
}

export default function PublishHistoricalResultReview({
  tournamentId,
  identifier,
  row,
  registrations,
}: {
  tournamentId: string;
  identifier: string;
  row: HistoricalReviewRow;
  registrations: RegistrationOption[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [state, action, pending] = useActionState(
    reviewHistoricalResultAction,
    initialState,
  );

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={adminButtonStyles("warning", "min-h-9 px-3")}
      >
        Review
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(92vw,48rem)] border border-white/15 bg-[#111111] p-0 text-white backdrop:bg-black/80"
      >
        <form action={action} className="grid gap-4 p-5 sm:p-6">
          <input type="hidden" name="tournamentId" value={tournamentId} />
          <input type="hidden" name="identifier" value={identifier} />
          <input type="hidden" name="resultEntryId" value={row.resultId} />

          <header className="border-b border-white/10 pb-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]">
              Historical Result Review
            </p>
            <h3 className="mt-1 text-xl font-black uppercase text-white">
              Place {row.place ?? "—"} — {row.teamName}
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Review the correct registration / Boat #, then confirm the participation and AOY eligibility used for publication.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-neutral-300">
              Correct registration / Boat #
              <select
                name="registrationId"
                required
                defaultValue=""
                className="min-h-11 border border-white/15 bg-black px-3 text-sm text-white"
              >
                <option value="" disabled>
                  Select Boat #
                </option>
                {registrations.map((registration) => (
                  <option key={registration.id} value={registration.id}>
                    Boat #{formatBoatNumber(registration.boatNumber)} — {registration.registrationType === "team" ? "Team" : "Solo"} — {registration.angler1Name}
                    {registration.angler2Name ? ` / ${registration.angler2Name}` : ""} — {registration.membershipSummary} — {registration.identityReviewStatus.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-neutral-300">
              Participation status
              <select
                name="participationStatus"
                defaultValue="participated"
                required
                className="min-h-11 border border-white/15 bg-black px-3 text-sm text-white"
              >
                <option value="participated">Participated</option>
                <option value="withdrew_after_start">Withdrew After Start</option>
                <option value="no_show">No Show</option>
                <option value="disqualified">Disqualified</option>
              </select>
            </label>

            <fieldset className="grid gap-2 text-sm text-neutral-300 sm:col-span-2">
              <legend className="text-sm text-neutral-300">
                AOY eligibility
              </legend>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 border border-white/15 bg-black px-3 py-2">
                  <input type="radio" name="aoyEligible" value="true" defaultChecked />
                  <span>Eligible</span>
                </label>
                <label className="flex items-center gap-2 border border-white/15 bg-black px-3 py-2">
                  <input type="radio" name="aoyEligible" value="false" />
                  <span>Not eligible</span>
                </label>
              </div>
            </fieldset>

            <label className="grid gap-2 text-sm text-neutral-300 sm:col-span-2">
              Eligibility reason
              <textarea
                name="eligibilityReason"
                required
                rows={4}
                defaultValue={row.reason}
                className="min-h-24 border border-white/15 bg-black px-3 py-2 text-sm text-white"
                placeholder="Explain why this registration matches the historical result"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-xs text-neutral-400">
              Resolve the ambiguous result using the active tournament roster.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className={adminButtonStyles("ghost", "min-h-10")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className={adminButtonStyles("primary", "min-h-10")}
              >
                {pending ? "Saving..." : "Save Historical Review"}
              </button>
            </div>
          </div>

          {state.status !== "idle" ? (
            <p
              role={state.status === "error" ? "alert" : "status"}
              className={`text-sm ${
                state.status === "error" ? "text-red-300" : "text-emerald-300"
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </form>
      </dialog>
    </>
  );
}
