import Link from "next/link";

const entryOptions = [
  {
    name: "Free Entry",
    price: "$0",
    eyebrow: "Open Entry",
    description:
      "Compete in the tournament without paying a tournament entry fee.",
    features: [
      "No tournament entry fee",
      "Eligible for Big Bass",
      "Not eligible for Base payouts",
      "Not eligible for Bronze, Silver, or Gold",
    ],
    accent: "border-white/25",
    priceColor: "text-white",
  },
  {
    name: "Base Entry",
    price: "$60",
    eyebrow: "Open Entry",
    description:
      "Enter the main tournament competition. Membership is not required.",
    features: [
      "Anyone can enter",
      "Pays 1 in 5",
      "Team or solo entry",
      "Eligible for Base payouts",
    ],
    accent: "border-red-500/70",
    priceColor: "text-red-500",
  },
  {
    name: "Bronze Pot",
    price: "+$40",
    eyebrow: "Members Only",
    description:
      "A separate payout competition for members choosing the Bronze Pot.",
    features: [
      "Separate payout pool",
      "Pays 1 in 5",
      "Base Entry required",
      "Choose one pot per event",
    ],
    accent: "border-[#9b6a3d]/70",
    priceColor: "text-[#c58b55]",
  },
  {
    name: "Silver Pot",
    price: "+$100",
    eyebrow: "Members Only",
    description:
      "A higher-entry competition with its own independent payout pool.",
    features: [
      "Separate payout pool",
      "Pays 1 in 5",
      "Base Entry required",
      "Choose one pot per event",
    ],
    accent: "border-neutral-400/60",
    priceColor: "text-neutral-200",
  },
  {
    name: "Gold Pot",
    price: "+$500",
    eyebrow: "Members Only",
    description:
      "The premium competition for anglers pursuing the largest potential payout.",
    features: [
      "Separate payout pool",
      "Pays 1 in 7",
      "Base Entry required",
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
      "The main tournament payout available to anglers and teams that pay the $60 Base Entry.",
    label: "Main Field",
  },
  {
    title: "Bronze Pot",
    description:
      "An independent members-only payout competition with its own payout pool.",
    label: "Members",
  },
  {
    title: "Silver Pot",
    description:
      "A separate higher-entry members-only payout competition.",
    label: "Members",
  },
  {
    title: "Gold Pot",
    description:
      "The premium members-only payout competition for anglers seeking the largest potential reward.",
    label: "Members",
  },
  {
    title: "Big Bass",
    description:
      "An additional opportunity for the heaviest individual bass. Free Entries may participate in Big Bass.",
    label: "Bonus",
  },
  {
    title: "Insurance Pot",
    description:
      "Pays starting with the first eligible Base entry out of the money and continues until the pot runs out.",
    label: "Optional",
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
    question: "Can I fish for free?",
    answer:
      "Yes. The Free Entry option allows an angler or team to compete without paying a tournament entry fee. A Free Entry may participate in Big Bass but is not eligible for Base Tournament payouts or the Bronze, Silver, or Gold Pots.",
  },
  {
    question: "What can a Free Entry win?",
    answer:
      "A Free Entry is eligible for Big Bass only. It is not eligible for Base payouts, Bronze, Silver, Gold, Insurance Pot payouts, AOY points, Championship qualification, or other member-only benefits.",
  },
  {
    question: "Do I have to be a member?",
    answer:
      "No. Membership is not required for the Free Entry option or the $60 Base Entry. Membership is required for AOY eligibility, Championship qualification, Bronze, Silver and Gold Pots, the Insurance Pot, and other member opportunities.",
  },
  {
    question: "What does the $60 Base Entry include?",
    answer:
      "The $60 Base Entry places an angler or team into the main tournament payout competition. Base entries are eligible for Base payouts and may also enter Big Bass. Eligible members may choose one additional Bronze, Silver, or Gold Pot.",
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
      "Eligible members who have paid the Base Entry may choose Bronze, Silver, or Gold based on their preferred entry level. Each pot is a separate competition with its own payout pool.",
  },
  {
    question: "Can I enter more than one pot?",
    answer:
      "No. Bronze, Silver, and Gold are mutually exclusive. An entry chooses only one of those pots for each tournament.",
  },
  {
    question: "Do I still compete in the Base Tournament when I choose a pot?",
    answer:
      "Yes. Bronze, Silver, and Gold are additional independent competitions. An entry must first pay the $60 Base Entry and then may choose one eligible pot.",
  },
  {
    question: "How does the Insurance Pot work?",
    answer:
      "The optional Insurance Pot begins paying with the first eligible entry that finishes immediately outside the Base payout. Payments continue through the next eligible positions until the Insurance Pot is exhausted.",
  },
  {
    question: "Can a Free Entry purchase the Insurance Pot?",
    answer:
      "No. The Insurance Pot is available only to eligible members who have entered the Base Tournament.",
  },
  {
    question: "How are AOY standings calculated?",
    answer:
      "Eligible member entries earn points based on their tournament finishes. Each entry's six highest point totals determine its final AOY score.",
  },
  {
    question: "Can a Free Entry earn AOY points?",
    answer:
      "No. A Free Entry does not earn AOY points and does not count toward Championship qualification.",
  },
  {
    question: "How do I qualify for the Championship?",
    answer:
      "An eligible member entry must physically compete in at least six of the nine regular-season tournaments. Paying an entry fee without launching and competing does not count as participation.",
  },
  {
    question: "What does membership include?",
    answer:
      "Membership provides access to AOY eligibility, Championship qualification, the Bronze, Silver, and Gold Pots, the Insurance Pot, tournament-week practice eligibility, and additional member opportunities.",
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
    question: "Where can I find the complete rules?",
    answer:
      "This page provides a general explanation of how the trail works. The official Rules page controls all tournament procedures, eligibility requirements, penalties, payouts, practice restrictions, and tie-breaking decisions.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0d0d0d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(185,154,63,0.12),transparent_35%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.8))]" />

        <div className="relative mx-auto max-w-[1300px] px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#d0ae4c] transition hover:text-red-500"
          >
            <span aria-hidden="true">←</span>
            Return to Home
          </Link>

          <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-red-500">
            All-In Tournament Trail
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-7xl">
            How It Works
          </h1>

          <p className="mt-5 text-xl font-black uppercase tracking-wide text-[#d0ae4c] sm:text-2xl">
            Fish Your Way. Bet Your Way. Win Your Way.
          </p>

          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
            Fish for free and compete for Big Bass, or enter the Base
            Tournament and choose the competition level that fits your budget.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <span
              aria-disabled="true"
              className="inline-flex min-h-12 cursor-not-allowed items-center justify-center border border-red-950 bg-red-950 px-7 py-3 text-sm font-black uppercase tracking-wider text-zinc-400"
            >
              Register Now
            </span>

            <span
              aria-disabled="true"
              className="inline-flex min-h-12 cursor-not-allowed items-center justify-center border border-white/10 bg-black px-7 py-3 text-sm font-black uppercase tracking-wider text-neutral-600"
            >
              View Official Rules
            </span>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-[1300px]">
          <SectionHeading
            eyebrow="Choose Your Entry"
            title="Choose How You Want to Fish"
            description="Enter for free and compete for Big Bass, or pay the $60 Base Entry for access to the main tournament payout. Eligible members may also choose one additional Bronze, Silver, or Gold Pot."
          />

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
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

      <section className="bg-black px-4 py-12 sm:px-6 lg:py-16">
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
              Fish for free or register for the Base Tournament and compete for
              additional payout opportunities.
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
