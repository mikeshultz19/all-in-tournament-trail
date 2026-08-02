"use client";
import { useActionState, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { publishInsuranceResultsAction, type InsurancePublishState } from "@/app/admin/tournament-manager/insurance/results/actions";
import { insurancePotAssignedCents, type InsurancePotWinner } from "@/lib/insurance-pot";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import type { Tournament } from "@/types/tournament";

const initial: InsurancePublishState = { status: "idle", message: "" };
const input = "mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:border-[#D4A017] focus:outline-none";
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const toCents = (value: string) => Math.round((Number(value) || 0) * 100);
export default function InsuranceResultsPublisher({ tournament, insuranceResult }: { tournament: Tournament; insuranceResult: TournamentInsurancePotResultRecord }) {
  const [state, action, pending] = useActionState(publishInsuranceResultsAction.bind(null, tournament.id), initial);
  const defaults = insuranceResult.calculated_payouts.length === insuranceResult.places_paid ? insuranceResult.calculated_payouts : Array.from({ length: insuranceResult.places_paid }, () => 0);
  const [winners, setWinners] = useState<InsurancePotWinner[]>(Array.from({ length: insuranceResult.places_paid }, (_, i) => insuranceResult.winners[i] ?? { entryName: "", finishingPosition: undefined, amountCents: defaults[i] ?? 0 }));
  const assigned = insurancePotAssignedCents(winners); const difference = insuranceResult.total_pot_cents - assigned;
  const update = (index: number, changes: Partial<InsurancePotWinner>) => setWinners((current) => current.map((winner, i) => i === index ? { ...winner, ...changes } : winner));
  return <form action={action} className="space-y-6"><section className="border border-white/10 bg-[#111111] p-6">
    <h2 className="text-lg font-black uppercase text-white">Actual Insurance Pot Recipients</h2><p className="mt-2 text-sm text-neutral-400">This action publishes only this tournament’s Insurance Pot section.</p>
    {insuranceResult.published ? <div className="mt-5 border border-green-700/50 bg-green-950/20 p-4 text-sm text-green-300">Insurance Pot results were published {insuranceResult.published_at ? new Date(insuranceResult.published_at).toLocaleString() : ""}.</div> : null}
    <div className="mt-6 space-y-4">{winners.map((winner, index) => <fieldset key={index} disabled={insuranceResult.published} className="grid gap-4 border border-white/10 bg-black/30 p-4 sm:grid-cols-2 lg:grid-cols-4 disabled:opacity-60"><legend className="px-2 text-xs font-black uppercase text-neutral-400">Recipient {index + 1}</legend>
      <label className="text-xs font-semibold text-neutral-300">Team or Solo Entry<input name={`winnerName_${index}`} value={winner.entryName} onChange={(e) => update(index, { entryName: e.target.value })} className={input} /></label>
      <label className="text-xs font-semibold text-neutral-300">Final Finishing Position<input name={`winnerPosition_${index}`} type="number" min="1" value={winner.finishingPosition ?? ""} onChange={(e) => update(index, { finishingPosition: e.target.value ? Number(e.target.value) : undefined })} className={input} /></label>
      <label className="text-xs font-semibold text-neutral-300">Amount Paid<input name={`winnerAmount_${index}`} type="number" min="0" step="0.01" value={(winner.amountCents / 100).toFixed(2)} onChange={(e) => update(index, { amountCents: toCents(e.target.value) })} className={input} /></label>
      <label className="text-xs font-semibold text-neutral-300">Internal Note<input name={`winnerNote_${index}`} value={winner.note ?? ""} onChange={(e) => update(index, { note: e.target.value })} className={input} /></label>
    </fieldset>)}</div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[["Entries", String(insuranceResult.entry_count)], ["Total Pot", money(insuranceResult.total_pot_cents)], ["Places Paid", String(insuranceResult.places_paid)], ["Winners Entered", `${winners.filter((w) => w.entryName.trim()).length} / ${insuranceResult.places_paid}`], ["Amount Assigned", money(assigned)], ["Remaining Difference", money(difference)]].map(([label, value]) => <div key={label} className="border border-white/10 bg-black/30 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{label}</p><p className={`mt-2 font-black ${label === "Remaining Difference" && difference !== 0 ? "text-red-400" : "text-white"}`}>{value}</p></div>)}</div>
  </section>{state.message ? <div className={`border px-4 py-3 text-sm ${state.status === "success" ? "border-green-600 text-green-300" : "border-red-600 text-red-300"}`}>{state.message}</div> : null}<button type="submit" disabled={pending || insuranceResult.published || difference !== 0 || winners.filter((w) => w.entryName.trim()).length !== insuranceResult.places_paid} className="inline-flex items-center gap-2 bg-red-700 px-6 py-3 font-black uppercase text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">{pending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}Publish Insurance Pot Results</button></form>;
}
