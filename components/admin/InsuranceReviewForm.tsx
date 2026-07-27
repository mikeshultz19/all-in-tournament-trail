"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Shield } from "lucide-react";

import {
  saveInsuranceReviewAction,
  type InsuranceReviewFormState,
} from "@/app/admin/tournament-manager/insurance/actions";
import type { Tournament } from "@/types/tournament";

interface InsuranceReviewFormProps {
  tournament: Tournament;
}

const initialState: InsuranceReviewFormState = {
  status: "idle",
  message: "",
};

export default function InsuranceReviewForm({
  tournament,
}: InsuranceReviewFormProps) {
  const action = saveInsuranceReviewAction.bind(null, tournament.id);

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <section className="border border-white/10 bg-[#111111] p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-[#D4A017]" />

          <div>
            <h2 className="text-lg font-black uppercase text-white">
              Insurance Review
            </h2>

            <p className="text-sm text-neutral-400">
              Verify the insurance payout before publishing tournament
              results.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-neutral-300">
              Insurance Payout ($)
            </label>

            <input
              name="insurancePayout"
              type="number"
              step="0.01"
              defaultValue={tournament.insurance_payout ?? ""}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:border-[#D4A017] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-300">
              Notes
            </label>

            <textarea
              name="insuranceNotes"
              rows={5}
              defaultValue={tournament.insurance_notes ?? ""}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:border-[#D4A017] focus:outline-none"
              placeholder="Optional notes..."
            />
          </div>

          <label className="flex items-start gap-3 border border-white/10 p-4">
            <input
              type="checkbox"
              name="insuranceReviewed"
              defaultChecked={tournament.insurance_reviewed}
              className="mt-1 h-4 w-4 accent-[#D4A017]"
            />

            <div>
              <div className="font-semibold text-white">
                Insurance Review Complete
              </div>

              <div className="text-sm text-neutral-400">
                Check this box after confirming the insurance payout is
                correct.
              </div>
            </div>
          </label>
        </div>
      </section>

      {state.message && (
        <div
          className={`border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-green-600 bg-green-950/30 text-green-300"
              : "border-red-600 bg-red-950/30 text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 bg-red-700 px-6 py-3 font-black uppercase tracking-wide text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Save Insurance Review
          </>
        )}
      </button>
    </form>
  );
}