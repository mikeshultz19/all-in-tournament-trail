"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminDisclosureToggle from "@/components/admin/AdminDisclosureToggle";
import ResetPayoutCalculations from "@/components/admin/ResetPayoutCalculations";
import { saveOnSiteCloseoutAction, type CloseoutState } from "@/app/admin/tournament-manager/closeout/actions";
import { isInsurancePotWinnerDraftComplete } from "@/lib/insurance-pot";
import { buildWeighfishChecks, ordinal, sortCloseoutChecks } from "@/lib/on-site-payout-calculator";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import type { OnSiteCloseoutCheck, OnSiteCloseoutRecord } from "@/types/on-site-closeout";
import type { Tournament } from "@/types/tournament";
import type { WeighfishResultRow } from "@/lib/weighfishParser";

const initialState: CloseoutState = { status: "idle", message: "" };

const payoutCategories = [
  "Base Tournament",
  "Bronze Pot",
  "Silver Pot",
  "Gold Pot",
  "Big Bass",
  "AITT Insurance Pot",
] as const;

function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function stringifyCheck(check: OnSiteCloseoutCheck) {
  return `${check.category}|${check.entryName.trim().toLocaleLowerCase("en-US")}|${check.finishingPlace}|${check.amountCents}`;
}

function areChecksCurrent(saved: readonly OnSiteCloseoutCheck[], current: readonly OnSiteCloseoutCheck[]) {
  const savedSnapshot = sortCloseoutChecks(saved).map(stringifyCheck);
  const currentSnapshot = sortCloseoutChecks(current).map(stringifyCheck);
  return savedSnapshot.length > 0 && savedSnapshot.join("||") === currentSnapshot.join("||");
}

function buildInsuranceChecks(insuranceResult: TournamentInsurancePotResultRecord | null): OnSiteCloseoutCheck[] {
  if (!insuranceResult || !isInsurancePotWinnerDraftComplete({
    entryCount: insuranceResult.entry_count,
    totalPotCents: insuranceResult.total_pot_cents,
    placesPaid: insuranceResult.places_paid,
    winners: insuranceResult.winners,
    published: insuranceResult.published,
  })) {
    return [];
  }

  return sortCloseoutChecks(
    insuranceResult.winners.map((winner, index) => ({
      id: `insurance-${index}-${winner.entryName.trim().toLowerCase().replace(/\s+/g, "-")}`,
      entryName: winner.entryName,
      finishingPlace:
        Number.isInteger(winner.finishingPosition) && (winner.finishingPosition ?? 0) > 0
          ? winner.finishingPosition!
          : index + 1,
      category: "AITT Insurance Pot" as const,
      amountCents: winner.amountCents,
      status: "not_written" as const,
    })),
  );
}

function sectionTotal(checks: readonly OnSiteCloseoutCheck[]) {
  return checks.reduce((sum, check) => sum + check.amountCents, 0);
}

function categoryLabel(category: string, index: number) {
  if (category === "Big Bass") {
    return `Big Bass — ${ordinal(index + 1)} Place`;
  }
  if (category === "AITT Insurance Pot") return "Insurance Pot";
  return category;
}

function CheckGroup({
  title,
  category,
  checks,
}: {
  title: string;
  category: string;
  checks: OnSiteCloseoutCheck[];
}) {
  const total = sectionTotal(checks);

  return (
    <section className="rounded-sm border border-white/10 bg-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-5">
        <div>
          <h4 className="text-base font-black uppercase text-white">{title}</h4>
          <p className="mt-1 text-sm text-neutral-400">
            {checks.length} item{checks.length === 1 ? "" : "s"} · {money(total)} total
          </p>
        </div>
      </div>
      <div className="divide-y divide-white/10 p-4">
        {checks.map((check, index) => (
          <div key={check.id} className="grid gap-2 py-3 transition-colors hover:bg-white/[0.02] sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              {categoryLabel(category, index)}
            </span>
            <span className="min-w-0 font-semibold text-white">{check.entryName}</span>
            <span className="font-black tabular-nums text-white">{money(check.amountCents)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function OnSiteCloseoutCalculator({
  tournament,
  initialImportedRows,
  initialCloseout,
  insuranceResult,
  strongerResetWarning,
}: {
  tournament: Tournament;
  initialImportedRows: WeighfishResultRow[];
  initialCloseout: OnSiteCloseoutRecord | null;
  insuranceResult: TournamentInsurancePotResultRecord | null;
  strongerResetWarning: boolean;
}) {
  const [reviewExpanded, setReviewExpanded] = useState(true);
  const [reviewAcknowledged, setReviewAcknowledged] = useState(false);
  const [state, action, pending] = useActionState(saveOnSiteCloseoutAction.bind(null, tournament.id), initialState);
  const router = useRouter();

  const sourceRows = useMemo(() => initialImportedRows, [initialImportedRows]);
  const reviewChecks = useMemo(() => sortCloseoutChecks(buildWeighfishChecks(sourceRows)), [sourceRows]);
  const insuranceChecks = useMemo(() => buildInsuranceChecks(insuranceResult), [insuranceResult]);
  const insurancePayouts = insuranceResult?.calculated_payouts ?? [];
  const insuranceRecipients = insuranceResult?.winners.map((winner) =>
    winner.boatNumber ? `Boat #${winner.boatNumber} — ${winner.entryName}` : winner.entryName,
  ) ?? [];
  const currentFinalChecks = useMemo(
    () => sortCloseoutChecks([...reviewChecks, ...insuranceChecks]),
    [insuranceChecks, reviewChecks],
  );
  const savedCloseoutChecks = useMemo(
    () => sortCloseoutChecks(initialCloseout?.checks ?? []),
    [initialCloseout?.checks],
  );

  const closeoutApproved = Boolean(initialCloseout) || (state.status === "success" && state.savedIntent === "approve");
  const insuranceComplete = Boolean(insuranceResult) && isInsurancePotWinnerDraftComplete({
    entryCount: insuranceResult?.entry_count ?? 0,
    totalPotCents: insuranceResult?.total_pot_cents ?? 0,
    placesPaid: insuranceResult?.places_paid ?? 0,
    winners: insuranceResult?.winners ?? [],
    published: insuranceResult?.published ?? false,
  });
  const finalChecksCurrent = closeoutApproved && insuranceComplete && areChecksCurrent(savedCloseoutChecks, currentFinalChecks);
  const finalChecksStale = closeoutApproved && insuranceComplete && savedCloseoutChecks.length > 0 && !finalChecksCurrent;
  const approvalReady = reviewAcknowledged && insuranceComplete && reviewChecks.length > 0 && !finalChecksCurrent;
  const trailRetainedCents = initialCloseout?.trail_retained_cents ?? 0;
  const totalPaidCents = sectionTotal(currentFinalChecks);
  const totalCollectedCents = totalPaidCents + trailRetainedCents;
  const sourceFileName = "Final Tournament Checks";
  const insurancePerTeam = insurancePayouts.length && new Set(insurancePayouts).size === 1
    ? money(insurancePayouts[0])
    : insurancePayouts.length
      ? "See exact amounts"
      : money(0);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  if (!sourceRows.length) {
    return (
      <section className="border border-white/10 bg-[#111111] p-6">
        <h2 className="text-xl font-black uppercase text-white">Verified Results</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          Verified results are required before payout approval. Return to Import Results to upload and verify the WeighFish CSV.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <section className="rounded-md border border-white/10 bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Verified Results</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-300">
          <span><strong className="text-white">{sourceRows.length}</strong> Entries</span>
          {tournament.results_verified_at ? <span>Verified: {tournament.results_verified_at}</span> : null}
          {tournament.results_verified_by ? <span>Verified By: {tournament.results_verified_by}</span> : null}
          {insurancePayouts.length ? <span>Insurance: {insurancePerTeam}</span> : null}
        </div>
      </section>

      {insuranceResult ? (
        <section className="rounded-md border border-white/10 bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">Insurance Summary</p>
          <dl className="mt-4 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Entry Count</dt>
              <dd className="mt-1 font-black text-white">{insuranceResult.entry_count}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Total Pot</dt>
              <dd className="mt-1 font-black text-white">{money(insuranceResult.total_pot_cents)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Places Paid</dt>
              <dd className="mt-1 font-black text-white">{insuranceResult.places_paid}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Per Recipient</dt>
              <dd className="mt-1 font-black text-white">{money(insuranceResult.calculated_payouts[0] ?? 0)}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Recipients</p>
            <p className="mt-2 flex flex-wrap gap-2 text-sm text-neutral-200">
              {insuranceRecipients.length ? insuranceRecipients.map((recipient) => (
                <span key={recipient} className="rounded-sm border border-white/10 bg-black/20 px-2.5 py-1">
                  {recipient}
                </span>
              )) : <span className="text-neutral-500">No eligible recipients</span>}
            </p>
          </div>
        </section>
      ) : null}

      <section className="rounded-md border border-white/10 bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">Payout Summary</p>
            <h3 className="mt-2 text-xl font-black uppercase text-white">Review Payouts</h3>
            <p className="mt-2 text-sm text-neutral-400">
              {finalChecksCurrent
                ? "Closeout complete. Publish Results can proceed."
                : finalChecksStale
                  ? "Review the payouts below, acknowledge them, and approve the closeout to update the saved check package."
                  : "Review the calculated payouts below, acknowledge them, and approve the closeout."}
            </p>
          </div>
          <AdminDisclosureToggle
            expanded={reviewExpanded}
            controls="weighfish-payout-review"
            onToggle={() => setReviewExpanded((current) => !current)}
          />
        </div>

        <div id="weighfish-payout-review" className={reviewExpanded ? "mt-5 space-y-4" : "mt-5 hidden"}>
          <div className="space-y-3">
            {payoutCategories.map((category) => {
              const checks = reviewChecks.filter((check) => check.category === category);
              if (!checks.length) return null;
              return (
                <CheckGroup
                  key={category}
                  title={category}
                  category={category}
                  checks={checks}
                />
              );
            })}
          </div>

          <form action={action} className="space-y-4 border-t border-white/10 pt-5">
            <input type="hidden" name="intent" value="approve" />
            <input type="hidden" name="sourceFileName" value={sourceFileName} />
            <input type="hidden" name="sourceRows" value={JSON.stringify(sourceRows)} />
            <input type="hidden" name="checks" value={JSON.stringify(currentFinalChecks)} />
            <input type="hidden" name="totalCollected" value={(totalCollectedCents / 100).toFixed(2)} />
            <input type="hidden" name="trailRetained" value={(trailRetainedCents / 100).toFixed(2)} />
            <label className="flex items-start gap-3 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={reviewAcknowledged}
                onChange={(event) => setReviewAcknowledged(event.target.checked)}
                disabled={pending || finalChecksCurrent}
                className="mt-0.5 size-4 accent-[#D4A017]"
              />
              <span className="font-semibold text-white">I have reviewed these payouts against WeighFish and confirm they are correct.</span>
            </label>
            <button
              type="submit"
              disabled={pending || !approvalReady}
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#D4A017] px-5 text-xs font-black uppercase text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending && state.savedIntent === "approve" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              APPROVE PAYOUTS
            </button>
            {state.message ? (
              <p
                role={state.status === "error" ? "alert" : "status"}
                className={`text-sm ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}
              >
                {state.message}
              </p>
            ) : null}
            {finalChecksCurrent ? (
              <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-400">Closeout Complete</p>
            ) : finalChecksStale ? (
              <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-300">Saved closeout needs approval again because the payout totals changed.</p>
            ) : null}
          </form>
        </div>
      </section>

      <ResetPayoutCalculations tournamentId={tournament.id} strongerWarning={strongerResetWarning} />
    </section>
  );
}
