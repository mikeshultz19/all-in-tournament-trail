"use client";

import { useState } from "react";
import type { OnSiteCloseoutCheck, OnSiteCloseoutRecord } from "@/types/on-site-closeout";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import { CLOSEOUT_PAYOUT_CATEGORY_ORDER, sortCloseoutChecks } from "@/lib/on-site-payout-calculator";
import AdminDisclosureToggle from "@/components/admin/AdminDisclosureToggle";

const categories = CLOSEOUT_PAYOUT_CATEGORY_ORDER;

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function ordinal(place: number) {
  const mod100 = place % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${place}th`;
  return `${place}${place % 10 === 1 ? "st" : place % 10 === 2 ? "nd" : place % 10 === 3 ? "rd" : "th"}`;
}

function categoryTitle(category: OnSiteCloseoutCheck["category"]) {
  return category;
}

function checkLineLabel(category: OnSiteCloseoutCheck["category"]) {
  if (category === "Base Tournament") return "Tournament";
  return category;
}

export default function TournamentPayoutReport({ closeout, insuranceResult }: { closeout?: OnSiteCloseoutRecord; insuranceResult?: TournamentInsurancePotResultRecord }) {
  const [expanded, setExpanded] = useState(true);
  const [checksExpanded, setChecksExpanded] = useState(true);
  if (!closeout?.checks.length) return null;

  const groupedRecipients = new Map<string, OnSiteCloseoutCheck[]>();
  const orderedChecks = sortCloseoutChecks(closeout.checks);
  for (const check of orderedChecks) {
    const key = check.entryName.trim().toLocaleLowerCase();
    groupedRecipients.set(key, [...(groupedRecipients.get(key) ?? []), check]);
  }

  const payoutTotal = orderedChecks.reduce((sum, check) => sum + check.amountCents, 0);
  return <div className="mt-6 border-t border-white/10 pt-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-xl font-black uppercase text-white">Tournament Payout Summary</h3><p className="mt-2 text-sm text-neutral-400">{orderedChecks.length} payouts <span aria-hidden="true">•</span> {money(payoutTotal)} total</p></div><AdminDisclosureToggle expanded={expanded} controls="tournament-payout-summary-details" onToggle={() => setExpanded((current) => !current)} /></div>
    {expanded ? <div id="tournament-payout-summary-details" className="mt-4 space-y-5">
      {categories.map((category) => {
        const checks = orderedChecks.filter((check) => check.category === category);
        if (!checks.length) return null;
        return <section key={category}>
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/10 pb-2">
            <h4 className="font-black uppercase text-[#D4A017]">{categoryTitle(category)}</h4>
            {category === "AITT Insurance Pot" && insuranceResult ? <p className="text-xs text-neutral-400">{insuranceResult.entry_count} entries · {insuranceResult.places_paid} places</p> : null}
          </div>
          <div className="divide-y divide-white/10">{checks.map((check, index) => <div key={check.id} className="grid gap-1 py-2.5 transition-colors hover:bg-white/[0.02] sm:grid-cols-[8rem_1fr_auto] sm:items-center sm:gap-4">
            <span className="text-xs font-black uppercase text-neutral-500">{category === "Big Bass" ? `${ordinal(index + 1)} Big Bass` : category === "Base Tournament" ? ordinal(check.finishingPlace) : check.finishingPlace > 0 ? `${ordinal(check.finishingPlace)} overall` : ""}</span>
            <span className="font-semibold text-white">{check.entryName}</span>
            <span className="font-black tabular-nums text-white">{money(check.amountCents)}</span>
          </div>)}</div>
        </section>;
      })}
    </div> : null}

    <section className="mt-6 border-t border-white/15 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-xl font-black uppercase text-white">Checks To Write</h3><p className="mt-2 text-sm text-neutral-400">{orderedChecks.length} {orderedChecks.length === 1 ? "check" : "checks"} <span aria-hidden="true">•</span> {money(payoutTotal)} total</p></div><AdminDisclosureToggle expanded={checksExpanded} controls="saved-check-summary-details" onToggle={() => setChecksExpanded((current) => !current)} /></div>
      {checksExpanded ? <div id="saved-check-summary-details" className="mt-4 divide-y divide-white/10 border-y border-white/10">
        {[...groupedRecipients.values()].sort((left, right) => Math.min(...left.map((check) => check.finishingPlace)) - Math.min(...right.map((check) => check.finishingPlace))).map((checks) => <article key={checks[0].entryName} className="py-4 transition-colors hover:bg-white/[0.02]">
          <h4 className="font-black text-white">{checks[0].entryName}</h4>
          <dl className="mt-3 max-w-xl space-y-2">{sortCloseoutChecks(checks).map((check) => <div key={check.id} className="flex justify-between gap-4 text-sm"><dt className="text-neutral-400">{checkLineLabel(check.category)}</dt><dd className="font-semibold text-white">{money(check.amountCents)}</dd></div>)}</dl>
          <div className="mt-3 flex max-w-xl justify-between gap-4 border-t border-white/10 pt-3 text-sm font-black uppercase"><span>Total Checks</span><span>{money(checks.reduce((sum, check) => sum + check.amountCents, 0))}</span></div>
        </article>)}
      </div> : null}
    </section>
  </div>;
}
