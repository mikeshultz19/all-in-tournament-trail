"use client";

import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import {
  saveTournamentRecapAction,
  type TournamentRecapFormState,
} from "@/app/admin/tournament-manager/photos/actions";
import { TOURNAMENT_RECAP_MAX_LENGTH } from "@/lib/tournament-recap";
import type { Tournament } from "@/types/tournament";

export default function TournamentRecapForm({
  tournament,
}: {
  tournament: Tournament;
}) {
  const action = saveTournamentRecapAction.bind(null, tournament.id);
  const initialRecap = tournament.tournament_recap ?? "";
  const initialState: TournamentRecapFormState = {
    status: "idle",
    message: "",
  };
  const [state, formAction, pending] = useActionState(action, initialState);
  const [recap, setRecap] = useState(initialRecap);

  return (
    <form action={formAction} className="mt-6">
      <section className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center border border-[#D4A017]/40 bg-[#D4A017]/10 text-[#D4A017]">
            <FileText aria-hidden="true" className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Tournament Recap
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutral-400">
              Add a short public recap. It can be updated or cleared after
              Official Results are published.
            </p>
          </div>
        </div>

        <label htmlFor="tournament-recap" className="sr-only">
          Tournament Recap
        </label>
        <textarea
          id="tournament-recap"
          name="tournamentRecap"
          value={recap}
          maxLength={TOURNAMENT_RECAP_MAX_LENGTH}
          onChange={(event) => setRecap(event.target.value)}
          className="mt-5 h-32 w-full resize-none overflow-y-auto border border-white/15 bg-black/40 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#D4A017]"
          placeholder="Share a brief tournament recap..."
        />

        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-xs leading-5 text-neutral-500">
            Optional editorial content. Saving does not republish results.
          </p>
          <output
            htmlFor="tournament-recap"
            className="shrink-0 text-xs font-bold tabular-nums text-neutral-400"
          >
            {recap.length} / {TOURNAMENT_RECAP_MAX_LENGTH}
          </output>
        </div>

        {state.message ? (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`mt-4 border px-4 py-3 text-sm font-semibold ${
              state.status === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-red-700 px-7 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Saving Recap…
            </>
          ) : (
            <>
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Save Recap
            </>
          )}
        </button>
      </section>
    </form>
  );
}
