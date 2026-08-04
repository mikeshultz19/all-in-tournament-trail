"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, PencilLine, X } from "lucide-react";
import { saveInsuranceWinnerDraftAction, type InsuranceWinnerDraftState } from "@/app/admin/tournament-manager/insurance/results/actions";
import { insurancePotAssignedCents, isInsurancePotWinnerDraftComplete, type InsurancePotWinner } from "@/lib/insurance-pot";
import { readInsurancePotWinnerDraft, writeInsurancePotWinnerDraft } from "@/components/admin/insurance-pot-draft-storage";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import type { Tournament } from "@/types/tournament";

const initial: InsuranceWinnerDraftState = { status: "idle", message: "" };
const input = "mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:border-[#D4A017] focus:outline-none";
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const toCents = (value: string) => Math.round((Number(value) || 0) * 100);

export default function InsuranceResultsPublisher({
  tournament,
  insuranceResult,
  basePayoutCutoff = null,
  standingOptions = [],
}: {
  tournament: Tournament;
  insuranceResult: TournamentInsurancePotResultRecord;
  basePayoutCutoff?: number | null;
  standingOptions?: Array<{ entryName: string; finishingPosition: number }>;
}) {
  const [state, action, pending] = useActionState(
    saveInsuranceWinnerDraftAction.bind(null, tournament.id),
    initial,
  );
  const defaults = useMemo(
    () => insuranceResult.calculated_payouts.length === insuranceResult.places_paid
      ? insuranceResult.calculated_payouts
      : Array.from({ length: insuranceResult.places_paid }, () => 0),
    [insuranceResult.calculated_payouts, insuranceResult.places_paid],
  );
  const savedWinners = useMemo<InsurancePotWinner[]>(
    () => Array.from(
      { length: insuranceResult.places_paid },
      (_, index) => insuranceResult.winners[index] ?? {
        entryName: "",
        finishingPosition: undefined,
        amountCents: defaults[index] ?? 0,
      },
    ),
    [defaults, insuranceResult.places_paid, insuranceResult.winners],
  );
  const restoredDraft = readInsurancePotWinnerDraft(tournament.id);
  const [winners, setWinners] = useState<InsurancePotWinner[]>(() => {
    if (restoredDraft?.length === insuranceResult.places_paid) {
      return restoredDraft.map((winner, index) => ({
        entryName: winner.entryName ?? "",
        finishingPosition: Number.isInteger(winner.finishingPosition)
          ? winner.finishingPosition ?? undefined
          : undefined,
        amountCents: Number.isInteger(winner.amountCents)
          ? winner.amountCents ?? defaults[index] ?? 0
          : defaults[index] ?? 0,
      }));
    }

    return savedWinners;
  });
  const [isEditing, setIsEditing] = useState(() => !isInsurancePotWinnerDraftComplete({
    entryCount: insuranceResult.entry_count,
    totalPotCents: insuranceResult.total_pot_cents,
    placesPaid: insuranceResult.places_paid,
    winners: insuranceResult.winners,
    published: insuranceResult.published,
  }));

  const assigned = insurancePotAssignedCents(winners);
  const difference = insuranceResult.total_pot_cents - assigned;
  const normalizedNames = winners.map((winner) => winner.entryName.trim().toLocaleLowerCase("en-US"));
  const enteredNames = normalizedNames.filter(Boolean);
  const hasDuplicate = new Set(enteredNames).size !== enteredNames.length;
  const completeWinners = winners.length === insuranceResult.places_paid && winners.every((winner) => winner.entryName.trim() && Number.isInteger(winner.finishingPosition) && (winner.finishingPosition ?? 0) > 0 && Number.isInteger(winner.amountCents) && winner.amountCents >= 0);
  const cutoffUnavailable = insuranceResult.entry_count > 0 && basePayoutCutoff === null;
  const insideBaseMoney = basePayoutCutoff !== null && winners.some((winner) => Number.isInteger(winner.finishingPosition) && (winner.finishingPosition ?? 0) <= basePayoutCutoff);
  const roundingAdjustmentRequired = defaults.length > 1 && new Set(defaults).size > 1;
  const payoutPerTeam = defaults.length && defaults.every((amount) => amount === defaults[0]) ? money(defaults[0]) : "See exact winner amounts";
  const returnHref = `/admin/tournament-manager?tournament=${encodeURIComponent(tournament.slug || tournament.id)}&step=3`;
  const canEditPublished = !insuranceResult.published;
  const savedComplete = isInsurancePotWinnerDraftComplete({
    entryCount: insuranceResult.entry_count,
    totalPotCents: insuranceResult.total_pot_cents,
    placesPaid: insuranceResult.places_paid,
    winners: insuranceResult.winners,
    published: insuranceResult.published,
  });

  const update = (index: number, changes: Partial<InsurancePotWinner>) => setWinners((current) => current.map((winner, winnerIndex) => winnerIndex === index ? { ...winner, ...changes } : winner));
  const resetToSaved = () => setWinners(savedWinners.map((winner) => ({
    entryName: winner.entryName ?? "",
    finishingPosition: Number.isInteger(winner.finishingPosition) ? winner.finishingPosition ?? undefined : undefined,
    amountCents: Number.isInteger(winner.amountCents) ? winner.amountCents : 0,
  })));

  useEffect(() => {
    writeInsurancePotWinnerDraft(tournament.id, winners);
  }, [tournament.id, winners]);

  useEffect(() => {
    if (state.status === "success" && typeof window !== "undefined") {
      window.location.reload();
    }
  }, [state.status]);

  const startEditing = () => {
    resetToSaved();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    resetToSaved();
    setIsEditing(false);
  };

  const showSummary = savedComplete && (!isEditing || state.status === "success");

  if (showSummary) {
    return (
      <section className="space-y-4">
        <div className="border border-white/10 bg-[#111111] p-6">
          <h2 className="text-lg font-black uppercase text-white">Results Saved</h2>
          <p className="mt-2 text-sm text-neutral-400">The selected teams are saved as an unpublished draft and will flow into the public Results page when tournament results are published.</p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Insurance Pot Entries", String(insuranceResult.entry_count)], ["Total Pot", money(insuranceResult.total_pot_cents)], ["Places Paid", String(insuranceResult.places_paid)], ["Payout Per Team", payoutPerTeam]].map(([label, value]) => <div key={label} className="border border-white/10 bg-black/30 p-4"><dt className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{label}</dt><dd className="mt-2 font-black text-white">{value}</dd></div>)}
          </dl>
          <p className="mt-4 text-sm text-neutral-300">{winners.length} of {insuranceResult.places_paid} Winners Entered</p>
          <p className="text-sm text-neutral-300">{money(assigned)} Assigned</p>
          <p className={`text-sm ${difference === 0 ? "text-neutral-300" : "text-red-300"}`}>{money(difference)} Remaining</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {canEditPublished ? (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-[#D4A017] hover:text-[#D4A017]"
              >
                <PencilLine aria-hidden="true" className="size-4" />
                Edit Results
              </button>
            ) : (
              <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-300">Use the protected edit workflow before changing published Insurance Pot winners.</p>
            )}
            <Link href={returnHref} className="inline-flex min-h-11 items-center justify-center border border-white/20 px-5 text-xs font-black uppercase text-white hover:border-[#D4A017]">Return to Insurance Pot</Link>
          </div>
        </div>
        {state.message && state.status === "error" ? <p role="alert" className="text-sm text-red-300">{state.message}</p> : null}
      </section>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <section className="border border-white/10 bg-[#111111] p-6">
        {insuranceResult.published ? <div className="mb-5 border border-amber-600/50 bg-amber-950/20 p-4 text-sm text-amber-200">These Insurance Pot winners are published. Use the protected results correction workflow before making changes.</div> : null}
        <h2 className="text-lg font-black uppercase text-white">Insurance Pot Winners</h2>
        <p className="mt-2 text-sm text-neutral-400">Enter the teams receiving Insurance Pot checks.</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[["Insurance Pot Entries", String(insuranceResult.entry_count)], ["Total Pot", money(insuranceResult.total_pot_cents)], ["Places Paid", String(insuranceResult.places_paid)], ["Payout Per Team", payoutPerTeam]].map(([label, value]) => <div key={label} className="border border-white/10 bg-black/30 p-4"><dt className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{label}</dt><dd className="mt-2 font-black text-white">{value}</dd></div>)}
        </dl>
        <div className="mt-6 space-y-4">
          {winners.map((winner, index) => <fieldset key={index} disabled={insuranceResult.published} className="grid gap-4 border border-white/10 bg-black/30 p-4 sm:grid-cols-3 disabled:opacity-60"><legend className="px-2 text-xs font-black uppercase text-neutral-400">Winner {index + 1}</legend>
            <label className="text-xs font-semibold text-neutral-300">Team<input name={`winnerName_${index}`} list={`insurance-standings-${tournament.id}`} value={winner.entryName} onChange={(event) => { const option = standingOptions.find((standing) => standing.entryName === event.target.value); update(index, { entryName: event.target.value, ...(option ? { finishingPosition: option.finishingPosition } : {}) }); }} className={input} /></label>
            <label className="text-xs font-semibold text-neutral-300">Place<input name={`winnerPosition_${index}`} type="number" min="1" step="1" value={winner.finishingPosition ?? ""} onChange={(event) => update(index, { finishingPosition: event.target.value ? Number(event.target.value) : undefined })} className={input} /></label>
            <label className="text-xs font-semibold text-neutral-300">Amount<input name={`winnerAmount_${index}`} type="number" min="0" step="0.01" readOnly={!roundingAdjustmentRequired} value={(winner.amountCents / 100).toFixed(2)} onChange={(event) => update(index, { amountCents: toCents(event.target.value) })} className={`${input} ${!roundingAdjustmentRequired ? "cursor-default bg-neutral-900 text-neutral-300" : ""}`} /></label>
          </fieldset>)}
        </div>
        <datalist id={`insurance-standings-${tournament.id}`}>{standingOptions.map((standing) => <option key={`${standing.finishingPosition}-${standing.entryName}`} value={standing.entryName}>{standing.finishingPosition}</option>)}</datalist>
        {hasDuplicate ? <p role="alert" className="mt-4 text-sm text-red-300">Insurance Pot winners cannot contain duplicate teams.</p> : null}
        {cutoffUnavailable ? <p role="alert" className="mt-4 text-sm text-red-300">The Base Tournament payout cutoff could not be determined from the verified standings.</p> : null}
        {insideBaseMoney ? <p role="alert" className="mt-4 text-sm text-red-300">Every Insurance Pot winner must finish outside the Base Tournament payout positions.</p> : null}
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">{[["Amount Assigned", money(assigned)], ["Remaining Difference", money(difference)]].map(([label, value]) => <div key={label} className="border border-white/10 bg-black/30 p-4"><dt className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{label}</dt><dd className={`mt-2 font-black ${label === "Remaining Difference" && difference !== 0 ? "text-red-400" : "text-white"}`}>{value}</dd></div>)}</dl>
      </section>
      {state.message ? <div role="status" className={`border px-4 py-3 text-sm ${state.status === "success" ? "border-green-600 text-green-300" : "border-red-600 text-red-300"}`}>{state.message}</div> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={pending || insuranceResult.published || !completeWinners || hasDuplicate || cutoffUnavailable || insideBaseMoney || difference !== 0} className="inline-flex items-center justify-center gap-2 bg-red-700 px-6 py-3 font-black uppercase text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">{pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Save Results</button>
        <button type="button" onClick={cancelEditing} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/15 px-5 text-xs font-black uppercase tracking-[0.12em] text-neutral-300 transition hover:border-[#D4A017] hover:text-white"><X aria-hidden="true" className="size-4" />Cancel Editing</button>
        <Link href={returnHref} className="inline-flex min-h-11 items-center justify-center border border-white/20 px-5 text-xs font-black uppercase text-white hover:border-[#D4A017]">Return to Insurance Pot</Link>
      </div>
    </form>
  );
}