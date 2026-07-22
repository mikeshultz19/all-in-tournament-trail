import Link from "next/link";
import Header from "@/components/Header";
import { REGISTRATION_PRICING } from "@/data/registration";

const price = (amount: number, additional = false) =>
  `${additional ? "+" : ""}$${amount}`;

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
      "Pays 1 in 5",
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
  },
  {
    title: "Silver Pot",
    description:
      "A separate higher-entry members-only payout competition. Pays 1 in 5 — one payout place for every five entries in the pot.",
    label: "Members",
  },
  {
    title: "Gold Pot",
    description:
      "The premium members-only payout competition for anglers seeking the largest potential reward. Pays 1 in 5 — one payout place for every five entries in the pot.",
    label: "Members",
  },
  {
    title: "Big Bass",
    description:
      "An optional add-on for the heaviest individual bass. Big Bass is not a standalone tournament entry.",
    label: "Bonus",
  },
  {
    title: "Insurance Pot",
    description:
      "Pays first out of the money from the Tournament Entry Pot until the available Insurance Pot money is exhausted.",
    label: `${price(REGISTRATION_PRICING.insurance)} Optional`,
  },
  {
    title: "AOY Points",
    description:
      "Eligible members earn season points toward the Angler of the Year standings.",
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
      "The Tournament Director uses AccuWeather and Weather Underground as primary weather references. Wind gusts of 30 MPH or greater will normally result in a delay or postponement. Lightning, severe storms, flooding, unsafe ramps, unsafe water, dense fog, closures, or other dangerous conditions may also affect the tournament. The Tournament Director has final authority over safety decisions. Tournament Status & Announcements on this website is the official source for public updates.",
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
      `The ${price(REGISTRATION_PRICING.insurance)} optional Insurance Pot pays first out of the money from the Tournament Entry Pot until the available Insurance Pot money is exhausted. Payment continues in finishing order until those funds are depleted.`,
  },
  {
    question: "How are AOY standings calculated?",
    answer:
      "Eligible member entries earn points based on their tournament finishes. Each entry's six highest point totals determine its final AOY score.",
  },
  {
    question: "How do I qualify for the Championship?",
    answer:
      "An eligible member entry must physically compete in at least six of the nine regular-season tournaments. Paying an entry fee without launching and competing does not count as participation.",
  },
  {
    question: "What does membership include?",
    answer:
      `The ${price(REGISTRATION_PRICING.annualMembership)} per angler Annual Membership provides access to AOY eligibility, Championship qualification, the Bronze, Silver, and Gold Pots, the Insurance Pot, tournament-week practice eligibility, and additional member opportunities.`,
  },
  {
    question: "When does the off-limits period begin?",
    answer:
      "Non-members: Tournament waters become off-limits beginning at 12:00 a.m. midnight on the Monday of tournament week and remain off-limits until the official tournament begins. Members: The only permitted practice day during tournament week is the Friday immediately preceding the tournament. Friday practice is an exclusive member benefit. See the Official Rules page for complete practice and off-limits regulations.",
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
      "No. Only legal live fish are eligible for the Big Bass award.",
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

      <section className="relative overflow-hidden border-b border-white/10 bg-[#0d0d0d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(185,154,63,0.12),transparent_35%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.8))]" />

        <div className="relative mx-auto max-w-[1300px] px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
            All-In Tournament Trail
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-7xl">
            How It Works
          </h1>

          <p className="mt-5 text-xl font-black uppercase tracking-wide text-[#d0ae4c] sm:text-2xl">
            Fish Your Way. Bet Your Way. Win Your Way.
          </p>

          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
            Tournament Entry is required for every registration. Add Big Bass or an
            eligible member-only pot to choose your competition level.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <span
              aria-disabled="true"
              className="inline-flex min-h-12 cursor-not-allowed items-center justify-center border border-red-950 bg-red-950 px-7 py-3 text-sm font-black uppercase tracking-wider text-zinc-400"
            >
              Register Now
            </span>

            <Link
              href="/rules"
              className="inline-flex min-h-12 items-center justify-center border border-white/20 bg-black px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#d0ae4c] hover:text-[#d0ae4c]"
            >
              View Official Rules
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-[1300px]">
          <SectionHeading
            eyebrow="Choose Your Entry"
            title="Choose How You Want to Fish"
            description={`Every registration includes the required ${price(REGISTRATION_PRICING.baseEntry)} Tournament Entry. Big Bass is optional, and eligible members may add one Bronze, Silver, or Gold bonus pot plus the Insurance Pot.`}
          />

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {entryOptions.map((option) => (
              <article
                key={option.name}
                className={`flex h-full flex-col border bg-[#111111] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.3)] ${option.accent}`}
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-500">
                    {option.eyebrow}
                  </p>

                  <div className="mt-3 flex items-end justify-between gap-3 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-black uppercase tracking-wide">
                      {option.name}
                    </h2>

                    <p
                      className={`shrink-0 text-2xl font-black ${option.priceColor}`}
                    >
                      {option.price}
                    </p>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-neutral-400">
                    {option.description}
                  </p>
                </div>

                <ul className="mt-5 space-y-3 border-t border-white/10 pt-5">
                  {option.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm font-semibold text-neutral-200"
                    >
                      <span className="mt-1 text-red-500">◆</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-5 border border-[#8f762f]/60 bg-[#14120d] px-5 py-4">
            <p className="text-sm font-bold leading-6 text-neutral-200">
              Bronze, Silver, and Gold do not stack. Eligible members may choose
              only one of those pots per tournament.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0d0d0d] px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-[1300px]">
          <SectionHeading
            eyebrow="Payout Opportunities"
            title="Multiple Ways to Win"
            description="Your entry choice determines which payout opportunities and season competitions you are eligible to enter."
          />

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {waysToWin.map((opportunity) => (
              <article
                key={opportunity.title}
                className="border border-white/10 bg-[#111111] p-5 transition hover:border-[#8f762f]/70"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  {opportunity.label}
                </p>

                <h2 className="mt-3 text-lg font-black uppercase tracking-wide">
                  {opportunity.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  {opportunity.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="frequently-asked-questions" className="scroll-mt-24 bg-black px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-[1000px]">
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

      <section className="border-t border-[#8f762f]/60 bg-[#13100a] px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto flex max-w-[1300px] flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
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

          <span
            aria-disabled="true"
            className="inline-flex min-h-14 w-full cursor-not-allowed items-center justify-center border border-red-950 bg-red-950 px-8 py-4 text-sm font-black uppercase tracking-wider text-zinc-400 sm:w-auto"
          >
            Register Now
          </span>
        </div>

        <div className="mx-auto mt-10 max-w-[1300px] border-t border-white/10 pt-7">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#d0ae4c] transition hover:text-red-500"
          >
            <span aria-hidden="true">←</span>
            Return to Home
          </Link>
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
    <div className="max-w-3xl">
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
