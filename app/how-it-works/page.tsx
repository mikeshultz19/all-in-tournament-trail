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

const price = (amount: number, additional = false) =>
  `${additional ? "+" : ""}$${amount}`;

const entryOptions = [
  {
    name: "Tournament Entry",
    price: price(REGISTRATION_PRICING.baseEntry),
    eyebrow: "Required Entry",
   description:
  "The required $60 Tournament Entry puts every angler into the main tournament. Fish for a traditional 1-in-5 payout, then decide if you want to add Bronze, Silver, or Gold.",
   features: [
  "Required $60 Tournament Entry",
  "Traditional 1-in-5 payout",
  "Compete against the full field",
  "Team or solo entry",
  "Optional Bronze, Silver & Gold",
],
    accent: "border-red-500/70",
    priceColor: "text-red-500",
    bestFor: "Low Risk • High Reward",
 },
  {
    name: "Bronze Pot",
    price: price(REGISTRATION_PRICING.bronze, true),
    eyebrow: "Members Only",
   description:
  "Perfect for anglers who want bigger payouts while keeping their investment modest.",

features: [
  "+$40 Optional Pot",
  "Unlimited payout growth",
  "Traditional 1-in-5 payout",
  "Tournament Entry required",
  "Excellent risk vs. reward",
],

bestFor: "Low Risk, Bigger Reward Potential",
  },
  {
    name: "Silver Pot",
    price: price(REGISTRATION_PRICING.silver, true),
    eyebrow: "Members Only",
    description:
  "A balanced option for anglers who want stronger payout potential without making the full Gold investment.",

features: [
  "+$100 Optional Pot",
  "Unlimited payout growth",
  "Traditional 1-in-5 payout",
  "Tournament Entry required",
  "Balanced risk and reward",
],

bestFor: "Balanced Risk, Strong Reward Potential",
    accent: "border-neutral-400/60",
    priceColor: "text-neutral-200",
  
  },
  {
    name: "Gold Pot",
    price: price(REGISTRATION_PRICING.gold, true),
    eyebrow: "Members Only",
  description:
  "For anglers ready to compete for the biggest payouts AITT has to offer.",

features: [
  "+$500 Optional Pot",
  "Unlimited payout growth",
  "Traditional 1-in-7 payout",
  "Tournament Entry required",
  "Maximum payout opportunity",
],


bestFor: "Maximum Opportunity",
    accent: "border-[#b99a3f]/80",
    priceColor: "text-[#d4b34f]",
    
  },
];

const keyBenefits = [
  {
   eyebrow: "Big Opportunity",
  title: "Unlimited Payout Potential",
description:
  "Bronze, Silver, and Gold payouts are never capped. As more anglers enter each optional pot, the payouts continue to grow.",
  },
  
   {
  eyebrow: "Your Choice",
  title: "Choose Your Risk",
  description:
    "Fish Gold on lakes you know well. Choose Silver, Bronze, or the Tournament Entry when you want to limit your investment.",

},
  {
    eyebrow: "One Tournament",
    title: "One Field. One Tournament.",
description:
  "Whether you fish Tournament Entry, Bronze, Silver, or Gold, every angler competes in the same tournament against the same field. Optional pots simply create additional payout opportunities.",
  },
 {
  eyebrow: "Flexible Season",
  title: "Drop Your Bad Finishes",
  description:
    "Life happens. Work, family, weather, and bad tournament days won't ruin your season. Fish the events that fit your schedule and still compete for AOY and Championship qualification.",
},

  {
    eyebrow: "Traditional Format",
    title: "No Forward-Facing Sonar",
    description:
      "AITT provides a home for anglers who want traditional tournament competition built around preparation, instinct, and decision-making.",
  },
  {
  eyebrow: "Unique Tournament Format",
   title: "Bass Stack Challenge",
  icon: Fish,
  description:
    "Selected events feature cumulative-weight competition where every legal fish counts toward your total.",
  label: "Unique Format",
  href: "/bass-stack",
  linkLabel: "LEARN MORE →",
  },

];

const waysToWin = [
  {
    title: "Big Bass",
      icon: Fish,
    description:
      "The optional Big Bass side pot pays two places and is open to eligible tournament entries.",
    label: "Bonus",
  },
  {
    title: "Insurance Pot",
     icon: Shield,
    description:
      "Pays eligible participants beginning with the first eligible entry outside the regular Tournament Entry payout.",
    label: `${price(REGISTRATION_PRICING.insurance)} Optional`,
    href: "/insurance-pot",
  },
  {
    title: "AOY Points",
    icon: Trophy,
    description:
      "Eligible members earn season points toward the Angler of the Year standings.",
    note:
      "Each entry's highest point totals determine its final AOY score under the current season rules.",
    label: "Season",
    href: "/aoy-points",
  },
  {
    title: "Championship Qualification",
    icon: Flag,
    description:
      "Build your season around the events that fit your schedule while working toward Championship eligibility.",
    note:
      "See the Official Rules for the current participation requirement and all controlling eligibility details.",
    label: "Season",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.13),transparent_38%)] py-14 md:py-20">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All-In Tournament Trail
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center border border-red-700 bg-red-800 px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700"
              >
                Registration Closed
              </Link>

              <Link
                href="/schedule"
                className="inline-flex min-h-12 items-center justify-center border border-white/20 bg-black px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#d0ae4c] hover:text-[#d0ae4c]"
              >
                View Tournament Schedule
              </Link>
            </div>
          </div>

   
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className={PUBLIC_PAGE_CONTAINER}>
<SectionHeading
  eyebrow="Tournament Strategy"
  title="One Tournament. Four Ways to Compete."
  description={`Every team or solo angler enters the required ${price(
    REGISTRATION_PRICING.baseEntry,
  )} Tournament Entry and competes against the full tournament field. Eligible members may then choose Bronze (+$40), Silver (+$100), or Gold (+$500) based on how much they want to risk. There isn't a right choice—only the one that fits your strategy.`}
/>

          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {entryOptions.map((option) => (
              <article
                key={option.name}
                className={`flex h-full flex-col rounded-xl border bg-[#111111] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#D4A017]/60 ${option.accent}`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                  {option.eyebrow}
                </p>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <h2 className="text-2xl font-black uppercase tracking-wide text-white">
                    {option.name}
                  </h2>
                  <span className={`text-3xl font-black ${option.priceColor}`}>
                    {option.price}
                  </span>
                </div>

<p className="mt-5 text-sm leading-7 text-neutral-300">
  {option.description}
</p>

       <div className="mt-5 border-l-2 border-[#D4A017] pl-4">
  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4A017]">
    Best For
  </p>

  <p className="mt-2 text-sm font-bold uppercase text-white">
    {option.bestFor}
  </p>
</div>

                <ul className="mt-6 space-y-3 text-sm text-neutral-300">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
              <span aria-hidden="true" className="text-[#D4A017]">
  •
</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-[#D4A017]/30 bg-[#13100a] px-6 py-5">
  <p className="text-xs font-black uppercase tracking-[0.22em] text-red-500">
    SIMPLE STRATEGY
  </p>

  <p className="mt-3 text-base leading-8 text-neutral-300">
    Every angler enters the <strong className="text-white">$60 Tournament Entry</strong> and
    competes against the full field. Then, if you're an eligible member,
    choose <strong className="text-white">Bronze</strong>,
    <strong className="text-white"> Silver</strong>, or
    <strong className="text-white"> Gold</strong> to match your confidence,
    budget, and tournament strategy.
  </p>
</div>
        </div>
      </section>

      <section className="py-12 md:py-16">
  <div
    className={`${PUBLIC_PAGE_CONTAINER} rounded-xl border border-white/10 bg-[#0d0d0d] px-6 py-10 sm:px-8 md:py-12`}
  >
<div className="max-w-3xl">
  <SectionHeading
    eyebrow="Why AITT Is Different"
    title="More Flexibility. More Strategy. More Opportunity."
    description="Whether you're chasing big payouts, fishing on a budget, short on practice time, or simply prefer a traditional tournament format, AITT gives you the flexibility to compete your way. There are no caps on optional pot payouts, so as participation grows, so do the winnings."
  />
</div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {keyBenefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-xl border border-white/10 bg-[#111111] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#D4A017]/60"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-500">
                  {benefit.eyebrow}
                </p>
                <h3 className="mt-4 text-xl font-black uppercase text-white">
                  {benefit.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-neutral-300">
                  {benefit.description}
                </p>
                {"href" in benefit && typeof benefit.href === "string" ? (
  <Link
    href={benefit.href}
    className="mt-5 inline-flex text-xs font-black uppercase tracking-[0.18em] text-[#D4A017] transition hover:text-red-500"
  >
    {"linkLabel" in benefit ? benefit.linkLabel : "Learn More →"}
  </Link>
) : null}
              </article>

            ))}
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
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  {opportunity.label}
                </p>

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
            Whether you're looking for low-risk competition, chasing the biggest
            payouts, or simply want to fish a traditional tournament trail,
            AITT gives you the flexibility to compete on your terms.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/register"
            className="inline-flex min-h-14 items-center justify-center border border-red-700 bg-red-800 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700"
          >
            Registration Closed
          </Link>

          <Link
            href="/schedule"
            className="inline-flex min-h-14 items-center justify-center border border-white/20 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#d0ae4c] hover:text-[#d0ae4c]"
          >
            View Tournament Schedule
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
