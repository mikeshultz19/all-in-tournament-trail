"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetImportedResultsAction } from "@/app/admin/tournament-manager/import/workflow-actions";

export default function StaleOfficialResultsReset({ tournamentId }: { tournamentId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setMessage("");
    startTransition(async () => {
      try {
        await resetImportedResultsAction(tournamentId, true);
        setConfirming(false);
        setConfirmed(false);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Tournament results could not be reset.");
      }
    });
  }

  return <section className="border border-[#D4A017]/30 bg-[#D4A017]/5 p-4">
    <p className="text-sm leading-6 text-neutral-300">This tournament is marked official, but no imported result rows or publication record are available. An authorized reset is required before a new CSV can be imported.</p>
    <button type="button" onClick={() => setConfirming(true)} className="mt-4 inline-flex min-h-11 items-center border border-red-500/40 px-4 text-xs font-black uppercase text-red-300 hover:bg-red-950/30">Reset Tournament Results and Start Over</button>
    {message ? <p role="alert" className="mt-3 text-sm text-red-300">{message}</p> : null}
    {confirming ? <div role="dialog" aria-modal="true" aria-labelledby="stale-results-reset-title" className="mt-5 border border-red-500/40 bg-black p-5">
      <h3 id="stale-results-reset-title" className="font-black uppercase text-white">Reset official tournament state?</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-300">This authorized reset clears imported results and import-derived payout, publication, and AOY state for this tournament only. Tournament Details, schedule, registrations, and payments remain intact.</p>
      <label className="mt-4 flex items-start gap-3 text-sm text-red-200"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />I understand this removes the selected tournament’s official-results lock and starts its operational results workflow over.</label>
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={pending} onClick={() => setConfirming(false)} className="min-h-11 border border-white/15 px-5 text-xs font-black uppercase text-neutral-300">Cancel</button><button type="button" disabled={pending || !confirmed} onClick={reset} className="min-h-11 bg-red-700 px-5 text-xs font-black uppercase text-white disabled:opacity-40">{pending ? "Resetting…" : "Reset and Start Over"}</button></div>
    </div> : null}
  </section>;
}
