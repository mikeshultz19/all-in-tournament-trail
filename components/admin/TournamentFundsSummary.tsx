"use client";

import { useState } from "react";
import type { TournamentCollectionSummary } from "@/lib/tournament-collection-calculator";

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function TournamentFundsSummary({ summary, className = "", collapsible = false }: { summary: TournamentCollectionSummary | null; className?: string; collapsible?: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const detailsVisible = !collapsible || expanded;
  const warningLines = summary ? [...summary.missing, ...(summary.membershipReconciliationWarnings ?? [])] : [];
  return (
    <section className={`rounded-md border border-[#D4A017]/35 bg-[#111] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.14)] sm:p-5 ${className}`} aria-labelledby="tournament-funds-summary-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4A017]">Financial Control</p>
          <h2 id="tournament-funds-summary-heading" className="mt-1 text-lg font-black uppercase text-white">Tournament Funds Summary</h2>
        </div>
        <div className="flex items-center gap-3">
          {summary && detailsVisible ? <p className="text-xs text-neutral-500">{summary.paidEntries} paid registration{summary.paidEntries === 1 ? "" : "s"} included</p> : null}
          {collapsible ? <button type="button" aria-expanded={expanded} aria-controls="tournament-funds-summary-details" onClick={() => setExpanded((value) => !value)} className="min-h-9 border border-white/15 px-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-300 hover:border-[#D4A017]/60 hover:text-[#D4A017]">{expanded ? "Collapse" : "Expand"}</button> : null}
        </div>
      </div>
      {!detailsVisible ? null : !summary ? <p id="tournament-funds-summary-details" className="mt-4 text-sm text-neutral-400">No tournament collection data is available.</p> : (
        <div id="tournament-funds-summary-details">
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {(["base", "big_bass", "bronze", "silver", "gold", "insurance"] as const).map((key) => summary.lines.find((line) => line.key === key)).filter((line): line is NonNullable<typeof line> => Boolean(line)).map((line) => <div key={line.key} className="border-t border-white/10 pt-3"><dt className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{line.label}</dt><dd className="mt-1 font-black tabular-nums text-white">{money(line.totalCents)}</dd><dd className="mt-1 text-xs text-neutral-500">{line.count} collected registration{line.count === 1 ? "" : "s"}</dd></div>)}
          </dl>
          <div className="mt-4 grid gap-3 border-t border-[#D4A017]/25 pt-4 text-sm sm:grid-cols-2">
            <SummaryValue label="Total Tournament Payout Funds" value={money(summary.totalTournamentPayoutFundsCents)} emphasized />
            <SummaryValue label="New Memberships Purchased" value={`${summary.lines.find((line) => line.key === "membership")?.count ?? 0} — ${money(summary.membershipRevenueCents)} collected`} />
            <SummaryValue label="Online Registration Funds" value={money(summary.onlineRegistrationFundsCents)} />
            <div className="border-t border-white/10 pt-3 sm:border-t-0 sm:pt-0"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Walk-Up Funds</p><dl className="mt-2 grid grid-cols-3 gap-2 text-xs"><WalkUpValue label="Cash" value={summary.walkUpFundsByMethod.cash} /><WalkUpValue label="Card" value={summary.walkUpFundsByMethod.card} /><WalkUpValue label="Other" value={summary.walkUpFundsByMethod.other} /></dl></div>
          </div>
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 border-l-2 border-[#D4A017] bg-[#D4A017]/5 px-3 py-3"><span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-300">TOTAL REGISTRATION FUNDS COLLECTED</span><span className="text-xl font-black tabular-nums text-[#D4A017]">{money(summary.totalRegistrationFundsCollectedCents)}</span></div>
          <p className="mt-2 text-xs text-neutral-500">Processing fees are excluded.</p>
          {summary.registrationsNeedingReview > 0 || warningLines.length ? <div className="mt-3 text-xs leading-5 text-amber-200" role="alert">{summary.registrationsNeedingReview ? <p>{summary.registrationsNeedingReview} paid registration{summary.registrationsNeedingReview === 1 ? "" : "s"} still need identity review.</p> : null}{warningLines.length ? <ul className="mt-1 list-disc space-y-1 pl-5">{warningLines.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}</div> : null}
        </div>
      )}
    </section>
  );
}

function SummaryValue({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return <div className="border-t border-white/10 pt-3"><dt className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</dt><dd className={`mt-1 font-black tabular-nums ${emphasized ? "text-[#D4A017]" : "text-white"}`}>{value}</dd></div>;
}

function WalkUpValue({ label, value }: { label: string; value: number }) {
  return <div><dt className="text-neutral-500">{label}</dt><dd className="mt-1 font-black tabular-nums text-white">{money(value)}</dd></div>;
}
