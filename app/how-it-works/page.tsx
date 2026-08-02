import Link from "next/link";
import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";
import { REGISTRATION_PRICING } from "@/data/registration";

const price = (amount: number, additional = false) =>
  `${additional ? "+" : ""}$${amount}`;

const PAYBACK_BADGE_TITLES = new Set([
  "Bronze Pot",
  "Silver Pot",
  "Gold Pot",
  "Big Bass",
  "Insurance Pot",
]);

const entryOptions = [
  {
    name: "Tournament Entry",
    price: price(REGISTRATION_PRICING.baseEntry),
    eyebrow: "Open Entry",
    description:
      "Required for every solo and team tournament registration. Membership is not required.",
    features: [
      "Anyone can enter",
      "Pays 1 in 5",
      "Team or solo entry",
      "Eligible for Base payouts",
      "Required to register",
    ],
    accent: "border-red-500/70",
    priceColor: "text-red-500",
  },
  {
    name: "Bronze Pot",
    price: price(REGISTRATION_PRICING.bronze, true),
    eyebrow: "Members Only",
    description:
      "A separate payout competition for members choosing the Bronze Pot.",
    features: [
      "Separate payout pool",
      "Pays 1 in 5",
      "Tournament Entry required",
      "Choose one pot per event",
    ],
    accent: "border-[#9b6a3d]/70",
    priceColor: "text-[#c58b55]",
  },
  {
    name: "Silver Pot",
    price: price(REGISTRATION_PRICING.silver, true),
    eyebrow: "Members Only",
    description:
      "A higher-entry competition with its own independent payout pool.",
    features: [
      "Separate payout pool",
      "Pays 1 in 5",
      "Tournament Entry required",
      "Choose one pot per event",
    ],
    accent: "border-neutral-400/60",
    priceColor: "text-neutral-200",
  },
  {
    name: "Gold Pot",
    price: price(REGISTRATION_PRICING.gold, true),
    eyebrow: "Members Only",
    description:
      "The premium competition for anglers pursuing the largest potential payout.",
    features: [
      "Separate payout pool",
      "Pays 1 in 7",
      "Tournament Entry required",
      "Choose one pot per event",
    ],
    accent: "border-[#b99a3f]/80",
    priceColor: "text-[#d4b34f]",
  },
];

const waysToWin = [
  {
    title: "Base Tournament",
    description:
      `The main tournament payout available to anglers and teams with the required ${price(REGISTRATION_PRICING.baseEntry)} Tournament Entry.`,
    label: "Main Field",
  },
  {
    title: "Bronze Pot",
    description:
      "An independent members-only payout competition with its own payout pool. Pays 1 in 5 — one payout place for every five entries in the pot.",
    label: "Members",
    chooseOnlyOne: true,
  },
  {
    title: "Silver Pot",
    description:
      "A separate higher-entry members-only payout competition. Pays 1 in 5 — one payout place for every five entries in the pot.",
    label: "Members",
    chooseOnlyOne: true,
  },
  {
    title: "Gold Pot",
    description:
      "The premium members-only payout competition for anglers seeking the largest potential reward. Pay 1 in 7 — one payout place for every seven entries in the pot.",
    label: "Members",
    chooseOnlyOne: true,
  },
  {
    title: "Big Bass",
    description:
      "The optional Big Bass side pot pays two places.",
    label: "Bonus",
  },
  {
    title: "Insurance Pot",
    description:
      "Pays eligible participants beginning with the first eligible entry outside the regular Tournament Entry payout.",
    label: `${price(REGISTRATION_PRICING.insurance)} Optional`,
    href: "/insurance-pot",
  },
  {
    title: "AOY Points",
    description:
      "Eligible members earn season points toward the Angler of the Year standings.",
    note: "As participation and sponsorship grow, AITT intends to increase AOY Winner Bonus Bucks.",
    label: "Season",
    href: "/aoy-points",
  },
  {
    title: "Championship Qualification",
    description:
      "Compete in 5 of the 8 regular season tournaments to qualify for the Championship.",
    note: "As participation and sponsorship grow, AITT intends to increase Championship Winner Bonus Bucks.",
    label: "Season",
  },
];

const faqs = [
  {
    question: "How do Early Online Registration payments work?",
    answer:
      "Early Online Registration requires immediate payment through Square. Credit and debit cards are accepted, and Apple Pay is available on supported devices and browsers. A 3% Card Processing Fee applies to every card and digital-wallet payment. Registration is not confirmed until Square reports a successful payment. Production online checkout remains unavailable until secure registration persistence and server-side payment confirmation are complete.",
  },
  {
    question: "How can I pay on tournament morning?",
    answer:
      "Tournament-morning registration is completed with a Tournament Director at the registration table. You may pay with cash or use a credit card, debit card, Apple Pay, or another supported contactless wallet through the Square reader. A 3% Card Processing Fee applies to card and digital-wallet payments. Cash is accepted only during tournament-morning registration and has no processing fee. The Tournament Director records the registration and payment method in WeighFish.",
  },
  {
    question: "What time should I arrive, and what is Estimated Safe Light?",
    answer:
      "Estimated Safe Light is the official Fort Worth sunrise for the tournament date minus 30 minutes. It is an approximation for planning. Be on the water and prepared to launch before that time; Tournament Officials determine final launch timing.",
  },
  {
    question: "How are weather decisions made?",
    answer:
      "The Tournament Director uses Open-Meteo and Weather Underground as primary weather references. Wind gusts of 30 MPH or greater will normally result in a delay or postponement. Lightning, severe storms, flooding, unsafe ramps, unsafe water, dense fog, closures, or other dangerous conditions may also affect the tournament. The Tournament Director has final authority over safety decisions. Tournament Status & Announcements on this website is the official source for public updates.",
  },
  {
    question: "Do I have to be a member?",
    answer:
      `No. Membership is not required for the ${price(REGISTRATION_PRICING.baseEntry)} Tournament Entry. Annual Membership is ${price(REGISTRATION_PRICING.annualMembership)} per angler and is required for AOY eligibility, Championship qualification, Bronze, Silver and Gold Pots, the Insurance Pot, and other member opportunities. Both team members must be current members for team benefits.`,
  },
  {
    question: `What does the ${price(REGISTRATION_PRICING.baseEntry)} Tournament Entry include?`,
    answer:
      `The required ${price(REGISTRATION_PRICING.baseEntry)} Tournament Entry places an angler or team into the main tournament payout competition. Big Bass is optional. Eligible members may also choose one Bronze, Silver, or Gold bonus pot and the Insurance Pot.`,
  },
  {
    question: "Can I compete by myself?",
    answer:
      "Yes. An entry may compete as a solo angler or as a team. The entry price applies per entry, not per angler.",
  },
  {
    question: "Can I compete with a partner?",
    answer:
      "Yes. Two anglers may compete together as one team entry. The team shares its tournament finish, payouts, and season points.",
  },
  {
    question: "Can I fish with a substitute partner?",
    answer:
      "No.\n\nIf your partner cannot attend, you may fish the tournament by yourself.\n\nFishing alone continues to count toward:\n\n• AOY\n• Championship Qualification\n• Member Side Pots (if eligible)\n\nIf you fish with another partner, that pairing is considered a new team entry.\n\nThe event will not count toward your original team's AOY standings, Championship qualification, or Member Side Pot eligibility.",
  },
  {
    question: "Can I choose any pot?",
    answer:
      "Eligible members with Tournament Entry may choose Bronze, Silver, or Gold based on their preferred entry level. Each bonus pot is a separate competition with its own payout pool and pays 1 in 5 — one payout place for every five entries in that pot.",
  },
  {
    question: "Can I enter more than one pot?",
    answer:
      "No. Bronze, Silver, and Gold are mutually exclusive. An entry chooses only one of those pots for each tournament.",
  },
  {
    question: "Do I still compete in the Base Tournament when I choose a pot?",
    answer:
      `Yes. Bronze, Silver, and Gold are additional independent competitions. An entry must include the ${price(REGISTRATION_PRICING.baseEntry)} Tournament Entry and may then choose one eligible bonus pot.`,
  },
  {
    question: "How does the Insurance Pot work?",
    answer:
      `The ${price(REGISTRATION_PRICING.insurance)} Insurance Pot is optional. Only participating entries are eligible. Payouts begin with the highest-finishing eligible entry outside the regular Tournament Entry payout, skip entries that did not join, and divide the entire pot equally among the winning places. AITT retains none of the Insurance Pot.`,
  },
  {
    question: "How are AOY standings calculated?",
    answer:
      "Eligible member entries earn points based on their tournament finishes. Each entry's five highest point totals determine its final AOY score.",
  },
  {
    question: "How do I qualify for the Championship?",
    answer:
      "An eligible member entry must physically compete in at least five of the nine regular-season tournaments. Paying an entry fee without launching and competing does not count as participation.",
  },
  {
    question: "What does membership include?",
    answer:
      `The ${price(REGISTRATION_PRICING.annualMembership)} per angler Annual Membership provides access to AOY eligibility, Championship qualification, the Bronze, Silver, and Gold Pots, the Insurance Pot, and additional member opportunities. A current member who is registered for a specific tournament may use one official practice day immediately before that event, choosing either Friday or Saturday, but not both. Membership alone does not provide the practice privilege.`,
  },
  {
    question: "What is the AITT Bass Stack Challenge?",
    answer:
      "The AITT Bass Stack Challenge is an MLF-inspired cumulative-weight tournament format used at selected AITT events. The angler or team with the greatest cumulative weight of all legal fish officially weighed wins. Competitors may weigh as many legal fish as they catch, but no more than three fish may be presented at one time. Culling up to three fish is allowed. The format applies only to events identified as Bass Stack Challenge tournaments.",
  },
  {
    question: "Which tournaments use the Bass Stack Challenge format?",
    answer:
      "The 2026–2027 Bass Stack Challenge events are tournament #5 at Squaw Creek and tournament #8 at Lewisville.",
  },
  {
    question: "When can I practice before a tournament?",
    answer:
      "Beginning at 12:00 AM on Monday of tournament week, tournament waters are off-limits to non-member anglers competing in the event. A current All-In Tournament Trail member who is registered for that specific tournament may use one official practice day, choosing either Friday or Saturday immediately before the tournament. Practice on both days is not permitted. See the Official Rules page for the controlling Practice and Off-Limits Policy.",
  },
  {
    question: "Is forward-facing sonar allowed?",
    answer:
      "No. Forward-facing sonar is not permitted during All-In Tournament Trail competition.",
  },
  {
    question: "When are standings updated?",
    answer:
      "Tournament results are posted after each event. AOY calculations and standings will update from those posted results.",
  },
  {
    question: "What happens if I bring a short fish to the scales?",
    answer:
      "Any fish that does not meet the tournament’s minimum legal length will not be counted toward the tournament catch. A short fish receives no tournament weight, does not count toward the legal tournament limit, and is not eligible for Big Bass.",
  },
  {
    question: "What is the penalty for a dead fish?",
    answer:
      "A one-pound penalty will be deducted for each legal fish presented dead at weigh-in. For example, if a catch weighs 18.42 pounds and includes two legal dead fish, the two-pound penalty results in an official tournament weight of 16.42 pounds.",
  },
  {
    question: "Are dead fish eligible for Big Bass?",
    answer:
      "No. Only legal live fish are eligible for either of the two Big Bass payouts.",
  },
  {
    question: "What happens if I am late to check-in?",
    answer:
      "A one-pound penalty will be assessed for each minute an individual or team is late checking in, up to 15 minutes. Any individual or team arriving more than 15 minutes after its assigned check-in time will forfeit that day’s catch and will not be permitted to weigh fish. Tournament Officials determine the official check-in time using the tournament’s designated official timekeeping device. Participants are responsible for knowing their assigned flight and check-in time. Participants must never operate a vessel unsafely to avoid a late penalty. Safety always takes precedence over tournament competition.",
  },
  {
    question: "Where can I find the complete rules?",
    answer:
      "This page provides a general explanation of how the trail works. The official Rules page controls all tournament procedures, eligibility requirements, penalties, payouts, practice restrictions, and tie-breaking decisions.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />


      <section className="py-10 md:py-14">
  <div className={PUBLIC_PAGE_CONTAINER}>
    <div className="max-w-3xl">
      <header className="border-b border-[#D4A017]/30 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
          All-In Tournament Trail
        </p>

        <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
          How It Works
        </h1>

        <p className="mt-4 text-xl font-black uppercase tracking-wide text-[#d0ae4c] sm:text-2xl">
          Fish Your Way. Bet Your Way. Win Your Way.
        </p>
      </header>

      <p className="mt-8 max-w-2xl text-base leading-7 text-neutral-300">
        Every registration requires a Tournament Entry. Add Big Bass or an
        eligible{" "}
        <span className="whitespace-nowrap">members-only</span> pot to compete
        at your preferred level.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/schedule"
          className="inline-flex min-h-12 items-center justify-center border border-red-700 bg-red-800 px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700"
        >
          View Tournament Schedule
        </Link>

        <Link
          href="/rules"
          className="inline-flex min-h-12 items-center justify-center border border-white/20 bg-black px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#d0ae4c] hover:text-[#d0ae4c]"
        >
          View Official Rules
        </Link>
      </div>
    </div>
  </div>
</section>

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <SectionHeading
            eyebrow="Payout Opportunities"
            title="Multiple Ways to Win"
            description="Your entry choice determines which payout opportunities and season competitions you are eligible to enter."
          />

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {waysToWin.map((opportunity) => (
              <article
                key={opportunity.title}
                className="relative flex flex-col border border-white/10 bg-[#111111] p-5 transition hover:border-[#8f762f]/70"
              >
                {PAYBACK_BADGE_TITLES.has(opportunity.title) && (
                  <span className="absolute right-4 top-4 inline-flex whitespace-nowrap rounded border border-[#c9aa4a]/70 bg-black/70 px-2 py-0.5 text-[0.58rem] font-black uppercase leading-none tracking-[0.18em] text-[#c9aa4a]">
                    100% Payback
                  </span>
                )}
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  {opportunity.label}
                </p>

                <h2 className="mt-3 text-lg font-black uppercase tracking-wide">
                  {opportunity.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  {opportunity.description}
                </p>

                {"href" in opportunity && typeof opportunity.href === "string" && (
                  <Link
                    href={opportunity.href}
                    className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#d0ae4c] transition hover:text-red-500"
                  >
                    Learn More →
                  </Link>
                )}

                {"note" in opportunity && (
                  <p className="mt-auto pt-4 text-center text-xs text-neutral-500">
                    {opportunity.note}
                  </p>
                )}

                {"chooseOnlyOne" in opportunity && opportunity.chooseOnlyOne && (
                  <p className="mt-auto pt-4 text-center text-xs text-neutral-500">
                    Choose Only One
                  </p>
                )}
              </article>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-black uppercase tracking-[0.22em] text-red-500">
              <span className="inline-flex whitespace-nowrap rounded border border-[#c9aa4a]/70 bg-black/70 px-2 py-0.5 text-[0.58rem] font-black uppercase leading-none tracking-[0.18em] text-[#c9aa4a]">
                BASS STACK
              </span>
              <span>Bass Stack Challenge</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-300">
              Selected events use an AITT Bass Stack Challenge format. It is
              an MLF-inspired cumulative-weight competition in which every
              legal fish officially weighed contributes to the angler or team
              total.
            </p>
            <p className="text-xs leading-5 text-neutral-400">
              See the Official Rules page for the controlling policy.
            </p>
          </div>
        </div>
      </section>

      <section id="frequently-asked-questions" className="scroll-mt-24 py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <SectionHeading
            eyebrow="Questions & Answers"
            title="Frequently Asked Questions"
            description="Open any question for a direct explanation of the tournament format, eligibility, membership, payouts, practice rules, AOY, and Championship qualification."
          />

          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group border border-white/10 bg-[#111111] open:border-[#8f762f]/70"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-left">
                  <span className="text-sm font-black uppercase tracking-wide text-white sm:text-base">
                    {faq.question}
                  </span>

                  <span
                    aria-hidden="true"
                    className="text-xl font-light text-red-500 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>

                <div className="border-t border-white/10 px-5 py-5">
                  <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-neutral-300 sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

    <section className="py-10 md:py-14">
  <div className={PUBLIC_PAGE_CONTAINER}>
    <div className="border-t border-[#8f762f]/60 bg-[#13100a] px-6 py-10 sm:px-8 md:py-12">
      <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
            Ready to Compete?
          </p>

          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Choose Your Entry. Take Your Shot.
          </h2>

          <p className="mt-3 max-w-2xl text-neutral-400">
            Register with the required Tournament Entry and choose any eligible
            optional payout opportunities.
          </p>
        </div>
<Link
  href="/register"
  className="inline-flex min-h-14 w-full items-center justify-center border border-red-700 bg-red-800 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700 sm:w-auto"
>
  Register Now
</Link>
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
