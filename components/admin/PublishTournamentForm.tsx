"use client";

import { useActionState } from "react";

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
  const [state, formAction, pending] = useActionState(
    publishTournamentAction,
    initialState,
  );

  return (
    <section className="border border-[#D4A017]/40 bg-[#D4A017]/10 p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]">
        Final Step
      </p>

      <h2 className="mt-1 text-xl font-black uppercase text-white">
        Publish Results
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300">
        Everything is complete. Publish the tournament to the website.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
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

        {state.message && (
  <div
    className={`rounded border px-4 py-3 text-sm ${
      state.status === "error"
        ? "border-red-700 bg-red-950/20 text-red-300"
        : "border-green-700 bg-green-950/20 text-green-300"
    }`}
  >
    {state.message}
  </div>
)}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center bg-[#D4A017] px-6 font-black uppercase text-black transition hover:brightness-110 disabled:bg-neutral-700 disabled:text-neutral-400"
        >
          {pending
            ? "Publishing..."
            : "Publish Results"}
        </button>
      </form>
    </section>
  );
}