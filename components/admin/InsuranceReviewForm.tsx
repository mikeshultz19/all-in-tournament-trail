"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, PencilLine, X } from "lucide-react";
import { saveInsuranceCalculationAction, type InsuranceReviewFormState } from "@/app/admin/tournament-manager/insurance/actions";
import { readInsurancePotCalculationDraft, writeInsurancePotCalculationDraft } from "@/components/admin/insurance-pot-draft-storage";
import { expectedInsurancePotCents, getInsurancePotPlaces, INSURANCE_POT_ENTRY_FEE_CENTS, splitInsurancePotCents } from "@/lib/insurance-pot";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import type { Tournament } from "@/types/tournament";

const initialState: InsuranceReviewFormState = { status: "idle", message: "" };
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);

export default function InsuranceReviewForm({
  tournament,
  insuranceResult,
}: {
  tournament: Tournament;
  insuranceResult: TournamentInsurancePotResultRecord | null;
}) {
  const [state, action, pending] = useActionState(
    saveInsuranceCalculationAction.bind(null, tournament.id),
    initialState,
  );
  const savedEntryCount = insuranceResult?.entry_count ?? 0;
  const savedNoEntries = Boolean(insuranceResult && insuranceResult.entry_count === 0);
  const savedTotalPotCents = insuranceResult?.total_pot_cents ?? 0;
  const savedPlacesPaid = insuranceResult?.places_paid ?? 0;
  const savedPerTeam = useMemo(() => {
    const payouts = insuranceResult?.calculated_payouts ?? [];
    return payouts.length && new Set(payouts).size === 1
      ? money(payouts[0])
      : payouts.length
        ? "See exact amounts"
        : money(0);
  }, [insuranceResult?.calculated_payouts]);
  const savedWinners = insuranceResult?.winners.length ?? 0;

  const [isEditing, setIsEditing] = useState(() => !insuranceResult);
  const [entryCountInput, setEntryCountInput] = useState(() => {
    const restoredDraft = readInsurancePotCalculationDraft(tournament.id);
    return restoredDraft?.entryCountInput ?? String(savedEntryCount);
  });
  const [noEntries, setNoEntries] = useState(() => {
    const restoredDraft = readInsurancePotCalculationDraft(tournament.id);
    return typeof restoredDraft?.noEntries === "boolean"
      ? restoredDraft.noEntries
      : savedNoEntries;
  });

  const tournamentIdentifier = encodeURIComponent(tournament.slug || tournament.id);
  const membersHref = `/admin/members?tournament=${tournamentIdentifier}&returnTo=${encodeURIComponent(`/admin/tournament-manager?tournament=${tournamentIdentifier}&step=3`)}`;
  const entryCountValid = /^\d+$/.test(entryCountInput) && Number.isSafeInteger(Number(entryCountInput));
  const entryCount = entryCountValid ? Number(entryCountInput) : 0;
  const totalPotCents = expectedInsurancePotCents(entryCount);
  const placesPaid = getInsurancePotPlaces(entryCount);
  const payouts = splitInsurancePotCents(totalPotCents, placesPaid);
  const selectionValid = entryCountValid && (entryCount > 0 || noEntries);
  const currentMatchesSaved = Boolean(insuranceResult && insuranceResult.entry_count === entryCount && insuranceResult.total_pot_cents === totalPotCents && insuranceResult.places_paid === placesPaid);
  const savedSummaryVisible = Boolean(insuranceResult) && (!isEditing || state.status === "success");
  const canEdit = Boolean(insuranceResult) && !insuranceResult?.published;

  const resetToSaved = () => {
    setEntryCountInput(String(savedEntryCount));
    setNoEntries(savedNoEntries);
  };

  const handleStartEditing = () => {
    resetToSaved();
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    resetToSaved();
    setIsEditing(false);
  };

  useEffect(() => {
    writeInsurancePotCalculationDraft(tournament.id, { entryCountInput, noEntries });
  }, [entryCountInput, noEntries, tournament.id]);

  useEffect(() => {
    if (state.status === "success") {
      if (typeof window !== "undefined") window.location.reload();
    }
  }, [state.status]);

  if (savedSummaryVisible) {
    return (
      <section className="space-y-4">
        <div className="border border-white/10 bg-[#111111] p-6">
          <h2 className="text-lg font-black uppercase text-white">Insurance Pot Saved</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Entry count, payout totals, and winner rows remain editable until tournament payouts are completed or public results are published.
          </p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Summary label="Entries" value={String(savedEntryCount)} />
            <Summary label="Total Pot" value={money(savedTotalPotCents)} />
            <Summary label="Places Paid" value={String(savedPlacesPaid)} />
            <Summary label="Payout Per Team" value={savedPerTeam} />
          </dl>
          <p className="mt-4 text-sm text-neutral-300">
            {savedWinners} Winners Saved
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {canEdit ? (
              <button
                type="button"
                onClick={handleStartEditing}
                className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-[#D4A017] hover:text-[#D4A017]"
              >
                <PencilLine aria-hidden="true" className="size-4" />
                Edit Insurance Pot
              </button>
            ) : (
              <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-300">
                Use the protected correction workflow to edit published Insurance Pot results.
              </p>
            )}
          </div>
        </div>
        {state.message && state.status === "error" ? <p role="alert" className="text-sm text-red-300">{state.message}</p> : null}
      </section>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="border-l-2 border-[#D4A017] pl-4 text-sm leading-6 text-neutral-300">
        Compare the tournament member list with the final standings beginning with the first team outside the money. Manually determine eligible Insurance Pot winners.
      </div>
      <p className="text-xs leading-5 text-neutral-500">Do not attempt to select Insurance Pot winners automatically.</p>
      <Link href={membersHref} className="inline-flex text-xs font-black uppercase tracking-[0.12em] text-[#D4A017] transition hover:text-white">{tournament.name} Members List →</Link>

      <label className="block max-w-xs text-sm font-semibold text-neutral-300">
        Number of Insurance Pot Entries
        <input
          name="entryCount"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          value={entryCountInput}
          onChange={(event) => {
            setEntryCountInput(event.target.value);
            setNoEntries(false);
          }}
          className="mt-2 min-h-11 w-full border border-white/10 bg-black px-4 py-3 text-white focus:border-[#D4A017] focus:outline-none"
        />
        <span className="mt-2 block text-xs font-normal text-neutral-500">{money(INSURANCE_POT_ENTRY_FEE_CENTS)} per entry</span>
      </label>
      <label className="flex items-center gap-3 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={noEntries}
          onChange={(event) => {
            setNoEntries(event.target.checked);
            if (event.target.checked) setEntryCountInput("0");
          }}
          className="size-4 accent-[#D4A017]"
        />
        No Number of Insurance Pot Entries
      </label>
      {!selectionValid ? <p role="alert" className="text-sm text-red-300">Enter a whole-number entry count, or save No Number of Insurance Pot Entries.</p> : null}
      <dl className="grid gap-x-6 gap-y-4 border-y border-white/10 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Entries" value={String(entryCount)} />
        <Summary label="Total Pot" value={money(totalPotCents)} />
        <Summary label="Places Paid" value={String(placesPaid)} />
        <Summary label="Payout Per Team" value={payouts.length && new Set(payouts).size === 1 ? money(payouts[0]) : payouts.length ? "See exact amounts" : money(0)} />
      </dl>
      <input type="hidden" name="totalPot" value={(totalPotCents / 100).toFixed(2)} />
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending || !selectionValid || currentMatchesSaved}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-red-700 px-6 text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Save Results
        </button>
        {insuranceResult ? (
          <button
            type="button"
            onClick={handleCancelEditing}
            className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-5 text-xs font-black uppercase tracking-[0.12em] text-neutral-300 transition hover:border-[#D4A017] hover:text-white"
          >
            <X aria-hidden="true" className="size-4" />
            Cancel Editing
          </button>
        ) : null}
      </div>
      {state.message && state.status === "error" ? <p role="alert" className="text-sm text-red-300">{state.message}</p> : null}
      {insuranceResult && !isEditing ? (
        <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
          Insurance Pot Saved
        </div>
      ) : null}
    </form>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</dt>
      <dd className="mt-1 text-xl font-black text-white">{value}</dd>
    </div>
  );
}