"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetImportedResultsAction, setImportedResultDisqualificationAction, verifyImportedResultsAction } from "@/app/admin/tournament-manager/import/workflow-actions";
import { clearInsurancePotDraftState } from "@/components/admin/insurance-pot-draft-storage";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import type { WeighfishResultRow } from "@/lib/weighfishParser";

export interface ImportedRow {
  id: string; place: number | null; team_name: string; total_weight: number;
  big_fish_weight: number | null; bronze_payout: number; silver_payout: number;
  gold_payout: number;
  participation_status?: "participated" | "withdrew_after_start" | "no_show" | "disqualified";
  original_import_data?: WeighfishResultRow | null;
}

type Props = { tournamentId: string; tournamentSlug: string; rows: ImportedRow[]; verified: boolean; published: boolean };

export default function ImportedResultsReview({ tournamentId, rows, verified, published }: Props) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(() => !verified);
  const [overridePublished, setOverridePublished] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [confirmingUndoId, setConfirmingUndoId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const disqualifiedRows = rows.filter((row) => row.participation_status === "disqualified");

  function verify() { setMessage(""); startTransition(async () => { try { await verifyImportedResultsAction(tournamentId); setResultsExpanded(false); setMessage("Results Verified"); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Results could not be verified."); } }); }
  function reset() { setMessage(""); startTransition(async () => { try { await resetImportedResultsAction(tournamentId, overridePublished); clearInsurancePotDraftState(tournamentId); setConfirmingReset(false); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Import could not be reset."); } }); }
  function setDisqualified(resultEntryId: string, disqualified: boolean) { setMessage(""); startTransition(async () => { try { await setImportedResultDisqualificationAction(tournamentId, resultEntryId, disqualified); setSelectedEntryId(""); setConfirmingUndoId(null); setMessage(disqualified ? "Entry marked Disqualified." : "Disqualification removed."); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Disqualification status could not be changed."); } }); }
  function toggleResults() { setResultsExpanded((expanded) => !expanded); }

  return <AdminPanel className="p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">{verified ? "Import Complete" : "Review Imported Results"}</p><h2 className="mt-2 text-xl font-bold text-white">{verified ? "Results Verified" : "Verify Against WeighFish"}</h2></div><div className="flex items-center gap-3"><button type="button" aria-expanded={resultsExpanded} onClick={toggleResults} className={adminButtonStyles("secondary")}>{resultsExpanded ? "Collapse" : verified ? "Edit" : "Expand"}</button><button type="button" onClick={() => setConfirmingReset(true)} disabled={pending} className={adminButtonStyles("ghost", "hover:text-red-400")}>Reset Import</button></div></div>
    {confirmingReset ? <div role="dialog" aria-modal="true" aria-labelledby="reset-import-title" className="mt-6 border border-red-500/30 bg-black p-5"><h3 id="reset-import-title" className="font-black uppercase text-white">Reset imported results?</h3><p className="mt-3 text-sm leading-6 text-neutral-300">This will remove the current CSV import and imported result rows for this tournament so you can upload a new file.</p><p className="mt-2 text-sm leading-6 text-neutral-400">It will not delete the tournament, registration records, schedule, or unrelated website data.</p>{published ? <label className="mt-4 flex gap-3 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"><input type="checkbox" checked={overridePublished} onChange={(event) => setOverridePublished(event.target.checked)} />I understand published results and their derived AOY/public snapshots will also be withdrawn.</label> : null}<div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => setConfirmingReset(false)} disabled={pending} className="min-h-11 border border-white/15 px-5 text-xs font-black uppercase text-neutral-300">Cancel</button><button type="button" onClick={reset} disabled={pending || (published && !overridePublished)} className="min-h-11 bg-red-700 px-5 text-xs font-black uppercase text-white disabled:opacity-40">{pending ? "Resetting…" : "Reset and Start Over"}</button></div></div> : null}
    <p className="mt-4 text-sm text-neutral-400"><strong className="text-neutral-200">{rows.length}</strong> imported {rows.length === 1 ? "entry" : "entries"}</p>
    {verified && !published ? <div className="mt-5 border border-red-500/25 bg-black/40 p-4"><h3 className="text-sm font-black uppercase text-white">Disqualify Entry</h3><div className="mt-3 flex flex-col gap-3 sm:flex-row"><select aria-label="Select imported team or solo angler" value={selectedEntryId} onChange={(event) => setSelectedEntryId(event.target.value)} className="min-h-11 flex-1 border border-white/15 bg-black px-3 text-sm text-white"><option value="">Select imported team / solo angler</option>{rows.filter((row) => row.participation_status !== "disqualified").map((row) => <option key={row.id} value={row.id}>{row.team_name}</option>)}</select><button type="button" disabled={pending || !selectedEntryId} onClick={() => setDisqualified(selectedEntryId, true)} className="min-h-11 bg-red-700 px-5 text-xs font-black uppercase text-white disabled:opacity-40">Mark Disqualified</button></div><p className="mt-3 text-xs text-neutral-500">DQ is always an explicit Admin action. Blank weight alone does not disqualify an entry.</p></div> : null}
    {disqualifiedRows.length ? <section className="mt-5 border border-white/10 bg-black/30 p-4"><h3 className="text-sm font-black uppercase text-white">Disqualified Entries</h3><div className="mt-3 divide-y divide-white/10">{disqualifiedRows.map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span className="font-semibold text-red-300">{row.team_name}</span>{!published ? confirmingUndoId === row.id ? <div className="flex items-center gap-3"><button type="button" disabled={pending} onClick={() => setDisqualified(row.id, false)} className="text-xs font-black uppercase text-amber-300 disabled:opacity-40">Confirm Remove DQ</button><button type="button" disabled={pending} onClick={() => setConfirmingUndoId(null)} className="text-xs uppercase text-neutral-400">Cancel</button></div> : <button type="button" disabled={pending} onClick={() => setConfirmingUndoId(row.id)} className="min-h-10 border border-white/15 px-4 text-xs font-black uppercase text-white hover:border-[#D4A017] disabled:opacity-40">Remove DQ</button> : <span className="text-xs font-black uppercase text-neutral-500">Locked</span>}</div>)}</div></section> : null}
    {resultsExpanded ? <div className="mt-5 overflow-x-auto rounded-sm border border-white/10"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-white/15 bg-black/40 text-xs font-black uppercase tracking-[0.06em] text-neutral-400"><tr><th className="px-3 py-3">Final Place</th><th className="px-3 py-3">Team or Solo Entry</th><th className="px-3 py-3">Official Weight</th><th className="px-3 py-3">Big Bass</th><th className="px-3 py-3">Bronze Payout</th><th className="px-3 py-3">Silver Payout</th><th className="px-3 py-3">Gold Payout</th><th className="px-3 py-3">Internal Status</th></tr></thead><tbody className="divide-y divide-white/10">{rows.map((row) => <ResultRow key={row.id} row={row} />)}</tbody></table></div> : null}
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">{verified ? <><p><AdminStatusBadge tone="positive">✓ Results Verified</AdminStatusBadge></p><p className="text-sm text-neutral-400">{rows.length} Teams Imported</p></> : <button type="button" onClick={verify} disabled={pending} className={adminButtonStyles("primary", "min-h-11 px-5")}>{pending ? "Working…" : "Verify Imported Results"}</button>}<button type="button" aria-expanded={resultsExpanded} onClick={toggleResults} className={adminButtonStyles("secondary")}>{resultsExpanded ? "Collapse" : verified ? "Edit" : "Expand"}</button></div>
    {message ? <p role="status" className="mt-4 text-sm text-neutral-300">{message}</p> : null}
  </AdminPanel>;
}

function ResultRow({ row }: { row: ImportedRow }) {
  const dq = row.participation_status === "disqualified";
  return <tr className={`transition-colors hover:bg-white/[0.025] ${dq ? "bg-red-950/20" : ""}`}><td className="px-3 py-3 font-bold tabular-nums text-white">{row.place ?? "—"}</td><td className="px-3 py-3 text-white">{row.team_name}</td><td className="px-3 py-3 tabular-nums text-neutral-300">{row.total_weight}</td><td className="px-3 py-3 tabular-nums text-neutral-300">{row.big_fish_weight ?? "—"}</td><td className="px-3 py-3 tabular-nums text-neutral-300">{formatCurrency(row.bronze_payout)}</td><td className="px-3 py-3 tabular-nums text-neutral-300">{formatCurrency(row.silver_payout)}</td><td className="px-3 py-3 tabular-nums text-neutral-300">{formatCurrency(row.gold_payout)}</td><td className="px-3 py-3">{dq ? <AdminStatusBadge tone="critical">Disqualified</AdminStatusBadge> : <AdminStatusBadge tone="neutral">Eligible</AdminStatusBadge>}</td></tr>;
}

function formatCurrency(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value); }
