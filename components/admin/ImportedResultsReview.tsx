"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetImportedResultsAction, verifyImportedResultsAction } from "@/app/admin/tournament-manager/import/workflow-actions";
import { clearInsurancePotDraftState } from "@/components/admin/insurance-pot-draft-storage";
import type { WeighfishResultRow } from "@/lib/weighfishParser";

export interface ImportedRow { id: string; place: number | null; team_name: string; total_weight: number; big_fish_weight: number | null; bronze_payout: number; silver_payout: number; gold_payout: number; original_import_data?: WeighfishResultRow | null; }

type ImportedResultsReviewProps = { tournamentId: string; tournamentSlug: string; rows: ImportedRow[]; verified: boolean; published: boolean };

export default function ImportedResultsReview(props: ImportedResultsReviewProps) {
  const { tournamentId, rows, verified, published } = props;
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(() => !verified);
  const [overridePublished, setOverridePublished] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function verify() {
    setMessage("");
    startTransition(async () => {
      try { await verifyImportedResultsAction(tournamentId); setResultsExpanded(false); setMessage("Results Verified"); router.refresh(); }
      catch (error) { setMessage(error instanceof Error ? error.message : "Results could not be verified."); }
    });
  }

  function reset() {
    setMessage("");
    startTransition(async () => {
      try { await resetImportedResultsAction(tournamentId, overridePublished); clearInsurancePotDraftState(tournamentId); setConfirmingReset(false); router.refresh(); }
      catch (error) { setMessage(error instanceof Error ? error.message : "Import could not be reset."); }
    });
  }

  return <section className="border border-white/10 bg-[#111111] p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">{verified ? "Import Complete" : "Review Imported Results"}</p><h2 className="mt-2 text-xl font-black uppercase text-white">{verified ? "Results Verified" : "Verify Against WeighFish"}</h2></div><button type="button" onClick={() => setConfirmingReset(true)} disabled={pending} className="text-xs font-black uppercase text-neutral-400 hover:text-red-400 disabled:opacity-50">Reset Import</button></div>
    <p className="mt-4 text-sm text-neutral-400"><strong className="text-neutral-200">{rows.length}</strong> imported {rows.length === 1 ? "entry" : "entries"}</p>
    {resultsExpanded ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-white/15 text-xs font-black uppercase text-neutral-500"><tr><th className="px-3 py-3">Final Place</th><th className="px-3 py-3">Team or Solo Entry</th><th className="px-3 py-3">Official Weight</th><th className="px-3 py-3">Big Bass</th><th className="px-3 py-3">Bronze Payout</th><th className="px-3 py-3">Silver Payout</th><th className="px-3 py-3">Gold Payout</th><th className="px-3 py-3">Validation</th></tr></thead><tbody className="divide-y divide-white/10">{rows.map((row) => <tr key={row.id}><td className="px-3 py-3 font-bold text-white">{row.place ?? "—"}</td><td className="px-3 py-3 text-white">{row.team_name}</td><td className="px-3 py-3 text-neutral-300">{row.total_weight}</td><td className="px-3 py-3 text-neutral-300">{row.big_fish_weight ?? "—"}</td><td className="px-3 py-3 text-neutral-300">{formatCurrency(row.bronze_payout)}</td><td className="px-3 py-3 text-neutral-300">{formatCurrency(row.silver_payout)}</td><td className="px-3 py-3 text-neutral-300">{formatCurrency(row.gold_payout)}</td><td className="px-3 py-3 text-neutral-400">No saved warning</td></tr>)}</tbody></table></div> : null}
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      {verified ? (
        <>
          <p className="font-black uppercase text-emerald-400">✓ Results Verified</p>
          <p className="text-sm text-neutral-400">{rows.length} Teams Imported</p>
        </>
      ) : (
        <button
          type="button"
          onClick={verify}
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center bg-[#D4A017] px-5 text-xs font-black uppercase text-black disabled:opacity-50"
        >
          {pending ? "Working…" : "Verify Imported Results"}
        </button>
      )}
      <button
        type="button"
        aria-expanded={resultsExpanded}
        onClick={() => setResultsExpanded((expanded) => !expanded)}
        className="inline-flex min-h-10 items-center justify-center border border-white/15 px-4 text-xs font-black uppercase text-neutral-300 hover:border-[#D4A017] hover:text-white"
      >
        {resultsExpanded ? "Collapse" : verified ? "Edit" : "Expand"}
      </button>
    </div>
    {message ? <p role="status" className="mt-4 text-sm text-neutral-300">{message}</p> : null}
    {confirmingReset ? <div role="dialog" aria-modal="true" aria-labelledby="reset-import-title" className="mt-6 border border-red-500/30 bg-black p-5"><h3 id="reset-import-title" className="font-black uppercase text-white">Reset imported results?</h3><p className="mt-3 text-sm leading-6 text-neutral-300">This will remove the current CSV import and imported result rows for this tournament so you can upload a new file.</p><p className="mt-2 text-sm leading-6 text-neutral-400">It will not delete the tournament, registration records, schedule, or unrelated website data.</p>{published ? <label className="mt-4 flex gap-3 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"><input type="checkbox" checked={overridePublished} onChange={(event) => setOverridePublished(event.target.checked)} />I understand published results and their derived AOY/public snapshots will also be withdrawn.</label> : null}<div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => setConfirmingReset(false)} disabled={pending} className="min-h-11 border border-white/15 px-5 text-xs font-black uppercase text-neutral-300">Cancel</button><button type="button" onClick={reset} disabled={pending || (published && !overridePublished)} className="min-h-11 bg-red-700 px-5 text-xs font-black uppercase text-white disabled:opacity-40">{pending ? "Resetting…" : "Reset and Start Over"}</button></div></div> : null}
  </section>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
