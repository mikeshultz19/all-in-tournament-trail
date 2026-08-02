"use client";

import { useActionState, useState } from "react";
import { Calculator, CheckCircle2, Loader2 } from "lucide-react";
import { saveInsuranceCalculationAction, type InsuranceReviewFormState } from "@/app/admin/tournament-manager/insurance/actions";
import { expectedInsurancePotCents, getInsurancePotPlaces, splitInsurancePotCents } from "@/lib/insurance-pot";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import type { Tournament } from "@/types/tournament";

const initialState: InsuranceReviewFormState = { status: "idle", message: "" };
const inputClassName = "mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:border-[#D4A017] focus:outline-none";
const cents = (value: string) => Number.isFinite(Number(value)) && Number(value) >= 0 ? Math.round(Number(value) * 100) : 0;
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);

export default function InsuranceReviewForm({ tournament, insuranceResult }: { tournament: Tournament; insuranceResult: TournamentInsurancePotResultRecord | null }) {
  const [state, action, pending] = useActionState(saveInsuranceCalculationAction.bind(null, tournament.id), initialState);
  const [entryCount, setEntryCount] = useState(insuranceResult?.entry_count ?? 0);
  const [totalPot, setTotalPot] = useState(insuranceResult ? (insuranceResult.total_pot_cents / 100).toFixed(2) : "0.00");
  const totalPotCents = cents(totalPot);
  const expectedPotCents = expectedInsurancePotCents(entryCount);
  const placesPaid = getInsurancePotPlaces(entryCount);
  const checks = splitInsurancePotCents(totalPotCents, placesPaid);
  const mismatch = totalPotCents !== expectedPotCents;
  const allEqual = checks.length > 0 && new Set(checks).size === 1;

  return (
    <form action={action} className="space-y-6">
      <section className="border border-white/10 bg-[#111111] p-6">
        <div className="flex items-center gap-3"><Calculator className="size-6 text-[#D4A017]" /><div><h2 className="text-lg font-black uppercase text-white">Insurance Pot Payout Calculator</h2><p className="text-sm text-neutral-400">Calculate tournament-day checks only. This does not publish results.</p></div></div>
        <p className="mt-4 text-xs leading-5 text-neutral-500">The optional, members-only Insurance Pot is $20 per eligible team or solo entry.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-neutral-300">Insurance Pot Entry Count<input name="entryCount" type="number" min="0" step="1" value={entryCount} onChange={(event) => setEntryCount(Math.max(0, Math.floor(Number(event.target.value) || 0)))} className={inputClassName} /></label>
          <label className="text-sm font-semibold text-neutral-300">Total Insurance Pot Dollars<input name="totalPot" type="number" min="0" step="0.01" value={totalPot} onChange={(event) => setTotalPot(event.target.value)} className={inputClassName} /></label>
        </div>
        {mismatch ? <div role="alert" className="mt-5 border border-amber-600/60 bg-amber-950/25 p-4 text-sm text-amber-200"><strong>Pot amount does not match the entry count.</strong><span className="mt-1 block text-amber-100/80">Expected {money(expectedPotCents)} from {entryCount} × $20.00; entered {money(totalPotCents)}. An administrator may save the entered amount when a manual correction is required.</span></div> : null}
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Summary label="Insurance Pot Entries" value={String(entryCount)} /><Summary label="Total Pot" value={money(totalPotCents)} /><Summary label="Places Paid" value={String(placesPaid)} /><Summary label="Pay Each Team" value={!checks.length ? money(0) : allEqual ? money(checks[0]) : "See exact checks"} /></div>
        {checks.length > 0 ? <div className="mt-6 border border-[#D4A017]/50 bg-black p-5 text-center"><p className="text-lg font-black uppercase tracking-wide text-white">{allEqual ? `Write ${checks.length} ${checks.length === 1 ? "check" : "checks"} for ${money(checks[0])} ${checks.length === 1 ? "" : "each"}` : "Write the following exact checks"}</p>{!allEqual ? <div className="mt-4 flex flex-wrap justify-center gap-3">{checks.map((amount, index) => <span key={index} className="border border-white/10 px-4 py-2 font-black text-[#D4A017]">Check {index + 1}: {money(amount)}</span>)}</div> : null}<p className="mt-3 text-xs text-neutral-500">Check total: {money(checks.reduce((sum, amount) => sum + amount, 0))}</p></div> : null}
      </section>
      {state.message ? <div className={`border px-4 py-3 text-sm ${state.status === "success" ? "border-green-600 text-green-300" : "border-red-600 text-red-300"}`}>{state.message}</div> : null}
      <div className="flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-2 bg-red-700 px-6 py-3 font-black uppercase tracking-wide text-white hover:bg-red-600 disabled:opacity-60">{pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Save Payout Calculation</button><a href={`/admin/tournament-manager/insurance/results?tournament=${encodeURIComponent(tournament.slug || tournament.id)}`} className="inline-flex items-center justify-center border border-white/20 px-6 py-3 text-sm font-black uppercase text-white hover:border-[#D4A017] hover:text-[#D4A017]">Enter Results Later</a></div>
    </form>
  );
}

function Summary({ label, value }: { label: string; value: string }) { return <div className="border border-white/10 bg-black/30 p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p><p className="mt-2 text-xl font-black text-white">{value}</p></div>; }
