"use client";

import { useActionState, useState } from "react";

import {
  publishTournamentAction,
  type PublishTournamentState,
} from "@/app/admin/tournament-manager/publish/actions";

interface PublishTournamentFormProps {
  tournamentId: string;
  identifier: string;
}

const initialState: PublishTournamentState = {
  status: "idle",
  message: "",
};

export default function PublishTournamentForm({
  tournamentId,
  identifier,
}: PublishTournamentFormProps) {
  const [confirmed, setConfirmed] = useState(false);

  const [state, formAction, pending] = useActionState(
    publishTournamentAction,
    initialState,
  );

  return (
    <section className="border border-[#D4A017]/40 bg-[#D4A017]/10 p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]">
        Final Approval
      </p>

      <h2 className="mt-1 text-xl font-black uppercase text-white">
        Publish Tournament Results
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300">
        Review the imported standings and payout totals before publishing.
      </p>

      <form action={formAction} className="mt-5">
        <input
          type="hidden"
          name="tournamentId"
          value={tournamentId}
        />

        <input
          type="hidden"
          name="identifier"
          value={identifier}
        />

        <label className="flex items-start gap-3 border border-white/10 bg-black/30 p-4">
          <input
            type="checkbox"
            name="confirmed"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1"
          />

          <span className="text-sm text-neutral-200">
            I have reviewed the imported tournament results.
          </span>
        </label>

        {state.message && (
          <p className="mt-4 text-sm text-red-400">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !confirmed}
          className="mt-5 inline-flex min-h-12 items-center justify-center bg-[#D4A017] px-6 font-black uppercase text-black disabled:bg-neutral-700 disabled:text-neutral-400"
        >
          {pending ? "Publishing..." : "Publish Results"}
        </button>
      </form>
    </section>
  );
}