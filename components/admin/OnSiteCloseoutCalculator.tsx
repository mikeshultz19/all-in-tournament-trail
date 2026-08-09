"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
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

const finalCheckDisplayOrder = [
  "Base Tournament",
  "Bronze Pot",
  "Silver Pot",
  "Gold Pot",
  "Big Bass — 1st Place",
  "Big Bass — 2nd Place",
  "Insurance Pot",
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

function finalChecksForDisplay(
  title: (typeof finalCheckDisplayOrder)[number],
  checks: readonly OnSiteCloseoutCheck[],
): OnSiteCloseoutCheck[] {
  if (title === "Big Bass — 1st Place") return checks.filter((check) => check.category === "Big Bass").slice(0, 1);
  if (title === "Big Bass — 2nd Place") return checks.filter((check) => check.category === "Big Bass").slice(1, 2);
  if (title === "Insurance Pot") return checks.filter((check) => check.category === "AITT Insurance Pot");
  return checks.filter((check) => check.category === title);
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
  const [finalExpanded, setFinalExpanded] = useState(true);
  const [reviewAcknowledged, setReviewAcknowledged] = useState(false);
  const [state, action, pending] = useActionState(saveOnSiteCloseoutAction.bind(null, tournament.id), initialState);

  const sourceRows = useMemo(() => initialImportedRows, [initialImportedRows]);
  const reviewChecks = useMemo(() => sortCloseoutChecks(buildWeighfishChecks(sourceRows)), [sourceRows]);
  const insuranceChecks = useMemo(() => buildInsuranceChecks(insuranceResult), [insuranceResult]);
  const insurancePayouts = insuranceResult?.calculated_payouts ?? [];
  const currentFinalChecks = useMemo(
    () => sortCloseoutChecks([...reviewChecks, ...insuranceChecks]),
    [insuranceChecks, reviewChecks],
  );
  const savedCloseoutChecks = useMemo(
    () => sortCloseoutChecks(initialCloseout?.checks ?? []),
    [initialCloseout?.checks],
  );

  const reviewConfirmed = Boolean(initialCloseout) || (state.status === "success" && state.savedIntent === "review");
  const insuranceComplete = Boolean(insuranceResult) && isInsurancePotWinnerDraftComplete({
    entryCount: insuranceResult?.entry_count ?? 0,
    totalPotCents: insuranceResult?.total_pot_cents ?? 0,
    placesPaid: insuranceResult?.places_paid ?? 0,
    winners: insuranceResult?.winners ?? [],
    published: insuranceResult?.published ?? false,
  });
  const finalChecksCurrent = reviewConfirmed && insuranceComplete && areChecksCurrent(savedCloseoutChecks, currentFinalChecks);
  const finalChecksStale = reviewConfirmed && insuranceComplete && savedCloseoutChecks.length > 0 && !finalChecksCurrent;
  const canGenerateFinalChecks = reviewConfirmed && insuranceComplete && reviewChecks.length > 0;
  const finalChecksActionLabel = savedCloseoutChecks.length > 0 ? "Regenerate Checks" : "Generate Checks";
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
      window.location.reload();
    }
  }, [state.status]);

  if (!sourceRows.length) {
    return (
      <section className="border border-white/10 bg-[#111111] p-6">
        <h2 className="text-xl font-black uppercase text-white">Verified Results</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          Verified results are required before checks can be generated. Return to Import Results to upload and verify the WeighFish CSV.
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
          {insurancePayouts.length ? <span>Insurance Pot: {insurancePerTeam}</span> : null}
        </div>
      </section>

      <section className="rounded-md border border-white/10 bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">Tournament Payouts</p>
            <h3 className="mt-2 text-xl font-black uppercase text-white">Payout Summary</h3>
            <p className="mt-2 text-sm text-neutral-400">Review who will be paid and the amount for each payout category.</p>
            <p className="mt-3 text-sm font-black uppercase text-white">Tournament Payout Total: {money(totalPaidCents)}</p>
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
            <input type="hidden" name="intent" value="review" />
            <input type="hidden" name="sourceFileName" value="Verified Tournament Payouts" />
            <input type="hidden" name="sourceRows" value={JSON.stringify(sourceRows)} />
            <input type="hidden" name="checks" value="[]" />
            <input type="hidden" name="totalCollected" value="0" />
            <input type="hidden" name="trailRetained" value="0" />
            <label className="flex items-start gap-3 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={reviewConfirmed || reviewAcknowledged}
                onChange={(event) => setReviewAcknowledged(event.target.checked)}
                disabled={pending || reviewConfirmed}
                className="mt-0.5 size-4 accent-[#D4A017]"
              />
              <span className="font-semibold text-white">I have reviewed these payouts against WeighFish and confirm they are correct.</span>
            </label>
            {reviewConfirmed ? <p className="font-black uppercase text-emerald-400">Payout Review Confirmed</p> : null}
            <button
              type="submit"
              disabled={pending || reviewConfirmed || !reviewAcknowledged}
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#D4A017] px-5 text-xs font-black uppercase text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending && state.savedIntent === "review" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Confirm Payout Review
            </button>
          </form>
          <div className="flex justify-end border-t border-white/10 pt-5">
            <AdminDisclosureToggle
              expanded={reviewExpanded}
              controls="weighfish-payout-review"
              onToggle={() => setReviewExpanded((current) => !current)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-white/10 bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Generate Checks</p>
            <h3 className="mt-2 text-xl font-black uppercase text-white">
              {finalChecksCurrent ? "Checks to Write" : finalChecksActionLabel}
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              {reviewConfirmed
                ? insuranceComplete
                  ? finalChecksStale
                    ? "Insurance Pot changes were saved. Regenerate checks to include the latest Insurance Pot payouts."
                    : finalChecksCurrent
                      ? "Work down this list to write and distribute each check."
                      : "Generate checks from the confirmed payout review."
                  : "Complete the Insurance Pot before generating checks."
                : "Confirm the payout review before generating checks."}
            </p>
          </div>
          <AdminDisclosureToggle
            expanded={finalExpanded}
            controls="final-checks"
            onToggle={() => setFinalExpanded((current) => !current)}
          />
        </div>

        <div id="final-checks" className={finalExpanded ? "mt-5 space-y-4" : "mt-5 hidden"}>
          {reviewConfirmed && insuranceComplete && finalChecksCurrent ? (
            <>
              <div className="space-y-3">
                {finalCheckDisplayOrder.map((title) => {
                  const checks = finalChecksForDisplay(title, currentFinalChecks);
                  if (!checks.length) return null;
                  return (
                    <CheckGroup
                      key={`final-${title}`}
                      title={title}
                      category={
                        title === "Insurance Pot"
                          ? "AITT Insurance Pot"
                          : title.startsWith("Big Bass")
                            ? "Big Bass"
                            : title
                      }
                      checks={checks}
                    />
                  );
                })}
              </div>

              <p className="text-sm font-black uppercase text-emerald-400">Checks are ready to write.</p>
            </>
          ) : (
            <form action={action} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="intent" value="final" />
              <input type="hidden" name="sourceFileName" value={sourceFileName} />
              <input type="hidden" name="sourceRows" value={JSON.stringify(sourceRows)} />
              <input type="hidden" name="checks" value={JSON.stringify(currentFinalChecks)} />
              <input type="hidden" name="totalCollected" value={(totalCollectedCents / 100).toFixed(2)} />
              <input type="hidden" name="trailRetained" value={(trailRetainedCents / 100).toFixed(2)} />
              <button
                type="submit"
                disabled={pending || !canGenerateFinalChecks}
                className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#D4A017] px-5 text-xs font-black uppercase text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending && state.savedIntent === "final" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                {finalChecksActionLabel}
              </button>
              {!reviewConfirmed ? <p className="text-xs text-neutral-500">Confirm the payout review to enable check generation.</p> : null}
            </form>
          )}

          {state.message ? (
            <p
              role={state.status === "error" ? "alert" : "status"}
              className={`text-sm ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}
            >
              {state.message}
            </p>
          ) : null}
          <div className="flex justify-end border-t border-white/10 pt-5">
            <AdminDisclosureToggle
              expanded={finalExpanded}
              controls="final-checks"
              onToggle={() => setFinalExpanded((current) => !current)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-white/10 bg-gradient-to-br from-[#171717] to-[#0d0d0d] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Complete Tournament</p>
            <p className="mt-2 text-sm text-neutral-400">
              {finalChecksCurrent
                ? "Tournament payouts are ready."
                : reviewConfirmed
                  ? insuranceComplete
                    ? "Generate checks before completing tournament payouts."
                    : "Complete the Insurance Pot before completing tournament payouts."
                  : "Confirm the WeighFish payouts before completing tournament payouts."}
            </p>
          </div>
          <form action={action}>
            <input type="hidden" name="intent" value="complete" />
            <input type="hidden" name="sourceFileName" value={sourceFileName} />
            <input type="hidden" name="sourceRows" value={JSON.stringify(sourceRows)} />
            <input type="hidden" name="checks" value={JSON.stringify(currentFinalChecks)} />
            <input type="hidden" name="totalCollected" value={(totalCollectedCents / 100).toFixed(2)} />
            <input type="hidden" name="trailRetained" value={(trailRetainedCents / 100).toFixed(2)} />
            <button
              type="submit"
              disabled={pending || !finalChecksCurrent || !insuranceComplete}
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#D4A017] px-5 text-xs font-black uppercase text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending && state.savedIntent === "complete" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Complete Tournament
            </button>
          </form>
        </div>
        {finalChecksCurrent ? (
          <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-emerald-400">Checks Generated</p>
        ) : finalChecksStale ? (
          <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-amber-300">Insurance Pot changes were saved. Regenerate checks to include the latest Insurance Pot payouts.</p>
        ) : null}
      </section>

      <ResetPayoutCalculations tournamentId={tournament.id} strongerWarning={strongerResetWarning} />
    </section>
  );
}
