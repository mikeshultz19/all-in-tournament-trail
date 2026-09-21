import type { Metadata } from "next";
import Link from "next/link";
import {
  Fish,
  Flag,
  Shield,
  Trophy,
} from "lucide-react";
import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

import { REGISTRATION_PRICING } from "@/data/registration";

export const metadata: Metadata = {
  title: "How AITT Works",
  description:
    "Learn how All-In Tournament Trail works, including the required Tournament Entry, optional Bronze, Silver and Gold pots, membership benefits, AOY points, Championship qualification, and tournament format.",
  alternates: {
    canonical: "/how-it-works",
  },
};

const price = (amount: number, additional = false) =>
  `${additional ? "+" : ""}$${amount}`;

const waysToWin = [
  {
    title: "Big Bass",
    icon: Fish,
    description:
      "The optional Big Bass side pot pays two places and is open to every registered team or solo angler.",
    label: "Bonus",
  },
  {
    title: "Insurance Pot",
    icon: Shield,
    description:
      "Uses a true 1-in-5 payout, with a minimum of one paid place whenever there are Insurance Pot entries. Payouts begin with the first participating entry outside Tournament Entry payout positions.",
    label: `${price(REGISTRATION_PRICING.insurance)} Optional`,
    href: "/insurance-pot",
  },
  {
    title: "AOY Points",
    icon: Trophy,
    description:
      "Registered anglers earn season points toward the Angler of the Year standings.",
    note:
      "Each entry’s five highest point totals from the eight regular-season tournaments determine its final AOY score.",
    label: "Season",
    href: "/aoy-points",
  },
  {
    title: "Championship Qualification",
    icon: Flag,
    description:
      "Compete in five regular-season events to qualify. Build your season around the tournaments that fit your schedule and earn your place in the AITT Championship.",
    label: "Season",
  },
];

export default async function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.13),transparent_38%)] py-14 md:py-20">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All In Tournament Trail
            </p>

            <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
              How AITT Works
            </h1>

            <p className="mt-5 max-w-3xl text-2xl font-black uppercase leading-tight tracking-wide text-[#d0ae4c] sm:text-3xl">
              Fish Your Way. Choose Your Risk. Chase Bigger Rewards.
            </p>

            <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-300 sm:text-lg">
              AITT is built around one simple idea: every angler should decide
              how much they are willing to risk. Every entry competes in the
              same tournament, while optional Bronze, Silver, and Gold pots let
              you increase your potential payout at the level that fits your
              confidence and goals.
            </p>

          </div>

   
        </div>
      </section>
<section className="py-10 md:py-12">
  <div className={PUBLIC_PAGE_CONTAINER}>
    <div className="mx-auto max-w-5xl">
      <div className="mb-7 text-center">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">Keep It Simple</p>
        <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">AITT 101</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <article className="rounded-xl border border-white/15 bg-[#111111] p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Join the Trail</p>
          <h3 className="mt-2 text-2xl font-black uppercase text-white">Every angler must have a current AITT membership.</h3>
          <p className="mt-4 text-sm leading-6 text-neutral-400">Membership is $40 per person and is paid once for the entire season.</p>
        </article>
        <article className="rounded-xl border border-[#D4A017]/50 bg-[#13100a] p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">Enter the Tournament</p>
          <h3 className="mt-2 text-2xl font-black uppercase text-white">The $60 Tournament Entry</h3>
          <p className="mt-4 text-sm leading-6 text-neutral-400">Gets your solo or team into the tournament.</p>
        </article>
        <article className="rounded-xl border border-white/15 bg-[#111111] p-6 md:col-span-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">Choose Your Risk. Choose Your Reward.</p>
          <p className="mt-4 text-sm leading-6 text-neutral-300">
            Side pots are optional. Fish with only the $60 Tournament Entry, or
            select one pot to increase your payout potential. You compete only
            against entries in the same pot.
          </p>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
            Select One Pot:
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div><p className="font-black uppercase text-white">Bronze Pot — $40</p><p className="mt-1 text-sm text-neutral-400">Pays 1 out of every 5 entries.</p></div>
            <div><p className="font-black uppercase text-white">Silver Pot — $100</p><p className="mt-1 text-sm text-neutral-400">Pays 1 out of every 5 entries.</p></div>
            <div><p className="font-black uppercase text-white">Gold Pot — $500</p><p className="mt-1 text-sm text-neutral-400">Pays 1 out of every 7 entries.</p></div>
          </div>
        </article>
        <article className="rounded-xl border border-[#D4A017]/50 bg-[#13100a] p-6 md:col-span-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">Optional Ways to Win</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div><h3 className="text-xl font-black uppercase text-white">Big Bass — $20</h3><p className="mt-1 text-sm leading-6 text-neutral-400">Open to every team and solo angler. Pays two places.</p></div>
            <div><h3 className="text-xl font-black uppercase text-white">Insurance Pot — $20</h3><p className="mt-1 text-sm leading-6 text-neutral-400">Optional protection using the approved 1-in-5 payout table, beginning with the first participating entry outside Tournament Entry payout positions.</p><Link href="/insurance-pot" className="mt-3 inline-flex text-xs font-black uppercase tracking-wide text-[#D4A017] underline underline-offset-4 hover:text-white">Learn more about the Insurance Pot</Link></div>
          </div>
        </article>
      </div>
      <div className="mt-8 rounded-xl border border-[#D4A017]/30 bg-[#13100a] px-6 py-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-red-500">
          SIMPLE STRATEGY
        </p>
        <p className="mt-3 text-base leading-8 text-neutral-300">
          Every team or solo angler enters the <strong className="text-white">$60 Tournament Entry</strong>{" "}and competes against the full field. Then, if you want to increase your payout potential,
          choose <strong className="text-white">Bronze</strong>,
          <strong className="text-white"> Silver</strong>, or
          <strong className="text-white"> Gold</strong> to match your confidence,
          budget, and tournament strategy.
        </p>
      </div>      <p className="mt-8 text-center text-lg font-black uppercase tracking-[0.12em] text-[#D4A017]">Done. Go Fish.</p>
    </div>
  </div>
</section>


   <section className="py-12 md:py-16">
  <div
    className={`${PUBLIC_PAGE_CONTAINER} rounded-xl border border-white/10 bg-[#0d0d0d] px-6 py-10 sm:px-8 md:py-12`}
  >
          <SectionHeading
            eyebrow="More Ways to Win"
            title="More Ways to Win and Build Your Season"
            description="Optional payout opportunities and season-long competitions add more ways to compete beyond the four primary entry levels."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {waysToWin.map((opportunity) => {
  const Icon = opportunity.icon;

  return (
              <article
                key={opportunity.title}
                className="flex h-full flex-col rounded-xl border border-white/10 bg-[#111111] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#D4A017]/60"
              >
<Icon
  size={38}
  strokeWidth={2}
  className="mb-5 text-[#D4A017]"
/>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                    {opportunity.label}
                  </p>

                </div>

                <h3 className="mt-3 text-lg font-black uppercase tracking-wide text-white">
                  {opportunity.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  {opportunity.description}
                </p>

                {"href" in opportunity && typeof opportunity.href === "string" ? (
                  <Link
                    href={opportunity.href}
                    className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#d0ae4c] transition hover:text-red-500"
                  >
                    Learn More →
                  </Link>
                ) : null}

                {"note" in opportunity ? (
                  <p className="mt-auto pt-5 text-xs leading-5 text-neutral-500">
                    {opportunity.note}
                  </p>
                ) : null}
       </article>
  );
})}
</div>
</div>

</section>
<section className="py-12 md:py-16">
  <div className={PUBLIC_PAGE_CONTAINER}>
    <div className="rounded-xl border border-[#8f762f]/60 bg-[#13100a] px-6 py-10 sm:px-8 md:py-12">
      <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
            Ready to Fish AITT?
          </p>

          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Fish Your Way. Win Your Way.
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-300">
            Whether you&apos;re looking for low-risk competition, chasing the biggest
            payouts, or simply want to fish a traditional tournament trail,
            AITT gives you the flexibility to compete on your terms.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/register" className="inline-flex min-h-14 w-full items-center justify-center rounded-md border border-red-700 bg-red-800 px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400 sm:w-auto">
            REGISTER
          </Link>
          <Link
            href="/schedule"
            className="inline-flex min-h-14 w-full items-center justify-center rounded-md border border-red-700 bg-red-800 px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400 sm:w-auto"
          >
            VIEW TOURNAMENT SCHEDULE
          </Link>
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-7">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#d0ae4c] transition hover:text-red-500"
        >
          <span aria-hidden="true">←</span>
          Return to Home
        </Link>
      </div>
    </div>
  </div>
</section>
      
    </main>
  );
}



type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl border-b border-[#D4A017]/30 pb-6">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
        {description}
      </p>
    </div>
  );

}
