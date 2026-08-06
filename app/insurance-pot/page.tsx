import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "The AITT Insurance Pot | All In Tournament Trail",
  description: "Learn how the optional AITT Insurance Pot creates more payout opportunities for eligible tournament entries.",
};

const payoutRows = [["1–9", "1"], ["10–14", "2"], ["15–19", "3"], ["20–24", "4"], ["25–29", "5"], ["30–34", "6"]] as const;
const examples = [
  { title: "4 Insurance Pot Entries", pot: "$80", places: "1", payout: "$80", copy: "The first eligible entry outside the regular Tournament Entry payout receives the entire Insurance Pot." },
  { title: "9 Insurance Pot Entries", pot: "$180", places: "1", payout: "$180", copy: "The next payout position is not created until ten Insurance Pot entries are reached." },
  { title: "10 Insurance Pot Entries", pot: "$200", places: "2", payout: "$100", copy: "The first two eligible entries outside the regular Tournament Entry payout each receive an equal share of the Insurance Pot." },
  { title: "20 Insurance Pot Entries", pot: "$400", places: "4", payout: "$100", copy: "Each eligible winning entry receives an equal payout until the entire Insurance Pot has been distributed." },
] as const;
const headingClass = "text-3xl font-black uppercase tracking-tight text-white sm:text-4xl";
const copyClass = "mt-5 max-w-3xl space-y-4 text-base leading-7 text-neutral-300";
const secondaryButton = "inline-flex min-h-12 items-center justify-center border border-white/20 bg-black px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#d0ae4c] hover:text-[#d0ae4c]";

export default function InsurancePotPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="py-10 md:py-14"><div className={PUBLIC_PAGE_CONTAINER}><div className="max-w-4xl">
        <header className="border-b border-[#D4A017]/30 pb-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">All In Tournament Trail</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">The AITT Insurance Pot</h1>
          <p className="mt-4 text-xl font-black uppercase tracking-wide text-[#d0ae4c] sm:text-2xl">More Teams Get Paid.</p>
        </header>
        <div className="divide-y divide-white/10">
  <TextSection id="insurance-how-it-works" title="How It Works">
  <p>Participation in the AITT Insurance Pot is optional.</p>

  <p>
    AITT membership is required to qualify for an Insurance Pot payout.
    Only eligible members who entered the Insurance Pot may receive an
    Insurance Pot payout.
  </p>

  <p>
    After the regular Tournament Entry payouts have been determined,
    Insurance Pot payouts begin with the highest-finishing eligible entry
    that did not receive a regular Tournament Entry payout.
  </p>

  <p>
    If a higher-finishing entry did not enter the Insurance Pot, is not an
    eligible AITT member, or already received a main tournament Entry
    payout, that entry is skipped. The payout then moves to the next eligible
    Insurance Pot participant.
  </p>

  <p>
    The Insurance Pot follows a one-in-five payout structure. One payout
    place is guaranteed with fewer than ten entries, and an additional payout
    place is created each time the Insurance Pot reaches another group of five
    entries beginning with ten entries.
  </p>

  <p>
    The entire Insurance Pot is distributed. AITT does not retain any portion
    of the Insurance Pot.
  </p>

  <p>
    Every winning entry receives an equal share of the total Insurance Pot.
  </p>
</TextSection>
          <section className="py-10" aria-labelledby="payout-structure">
            <h2 id="payout-structure" className={headingClass}>Payout Structure</h2>
            <div className="mt-6 max-w-2xl overflow-hidden border border-white/10">
              <div className="grid grid-cols-2 bg-[#171717] text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]"><span className="px-4 py-3">Insurance Pot Entries</span><span className="px-4 py-3 text-right">Places Paid</span></div>
              <div className="divide-y divide-white/10 bg-[#111111]">{payoutRows.map(([entries, places]) => <div key={entries} className="grid grid-cols-2"><span className="px-4 py-3 text-neutral-300">{entries}</span><span className="px-4 py-3 text-right font-black text-white">{places}</span></div>)}</div>
            </div>
<div className={copyClass}>
  <p>
    The Insurance Pot uses a one-in-five payout structure. One place is paid
    with one through nine entries. At ten entries, two places are paid. An
    additional payout place is created for every five additional entries.
  </p>

  <p>
    Only eligible AITT members who entered the Insurance Pot may receive a
    payout.
  </p>

  <p>
    Each winning entry receives an equal share of the total Insurance Pot.
  </p>
</div>          </section>
          <section className="py-10" aria-labelledby="insurance-examples">
            <h2 id="insurance-examples" className={headingClass}>Insurance Pot Examples</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-300">The examples below illustrate how the AITT Insurance Pot is distributed.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">{examples.map((example, index) => <article key={example.title} className="border border-white/10 bg-[#111111] p-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Example {index + 1}</p><h3 className="mt-2 text-lg font-black uppercase text-white">{example.title}</h3><dl className="mt-4 divide-y divide-white/10 border-y border-white/10 text-sm"><ExampleRow label="Total Pot" value={example.pot} /><ExampleRow label="Places Paid" value={example.places} /><ExampleRow label="Payout Per Winner" value={example.payout} /></dl><p className="mt-4 text-sm leading-6 text-neutral-400">{example.copy}</p></article>)}</div>
          </section>
          <section className="py-10" aria-labelledby="more-winners">
            <h2 id="more-winners" className={headingClass}>One Tournament. More Winners.</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-300">The AITT Insurance Pot reflects our commitment to rewarding more competitors and creating additional opportunities for anglers to leave tournament day with money in their pocket.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><Link href="/rules#insurance-pot" className="inline-flex min-h-12 items-center justify-center border border-red-700 bg-red-800 px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700">View Official Rules</Link><Link href="/how-it-works" className={secondaryButton}>How AITT Works</Link><Link href="/schedule" className={secondaryButton}>View Tournament Schedule</Link></div>
          </section>
        </div>
      </div></div></section>
    </main>
  );
}

function TextSection({ id, title, children }: { id: string; title: string; children: ReactNode }) { return <section className="py-10" aria-labelledby={id}><h2 id={id} className={headingClass}>{title}</h2><div className={copyClass}>{children}</div></section>; }
function ExampleRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 py-2"><dt className="text-neutral-400">{label}</dt><dd className="font-black text-[#d0ae4c]">{value}</dd></div>; }
