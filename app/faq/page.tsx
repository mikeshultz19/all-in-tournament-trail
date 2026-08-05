import Link from "next/link";
import {
  ChevronDown,
  CircleDollarSign,
  CloudSun,
  Fish,
  HelpCircle,
  Scale,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

type FaqItem = {
  question: string;
  answer: string;
  link?: {
    label: string;
    href: string;
  };
};

type FaqSection = {
  title: string;
  description: string;
  icon: typeof HelpCircle;
  items: FaqItem[];
};

const faqSections: FaqSection[] = [
  {
    title: "Tournament Entry & Membership",
    description:
      "Basic information about entering an AITT tournament, membership, and member-only benefits.",
    icon: Users,
    items: [
      {
        question: "Do I have to be an AITT member to fish a tournament?",
        answer:
          "No. AITT regular-season tournaments are open to eligible members and non-members. Membership is not required to purchase the required Tournament Entry. Member-only benefits and competitions remain restricted to eligible members.",
      },
      {
        question: "Is Tournament Entry required?",
        answer:
          "Yes. Tournament Entry is required for every solo or team registration. Optional add-ons cannot be entered without Tournament Entry.",
      },
      {
        question: "How much is an annual AITT membership?",
        answer:
          "Annual AITT membership is $40 per angler. Membership status is determined separately for each angler.",
      },
      {
        question: "What benefits are available to eligible members?",
        answer:
          "Eligible members may receive access to AOY points, Championship qualification, the Bronze, Silver, or Gold member bonus pots, the Insurance Pot, one official practice day immediately before an event, and other opportunities published by AITT.",
      },
      {
        question: "Do both anglers on a team have to be members?",
        answer:
          "Yes. Both registered anglers must be current members, or purchase membership during registration, for the team to receive member-only benefits.",
      },
      {
        question: "Can I register as a solo angler?",
        answer:
          "Yes. An entry may compete as one solo angler or as a team of two anglers. A solo angler competes against the same tournament field under the same tournament, safety, and fishing rules.",
      },
    ],
  },
  {
    title: "Registration & Payment",
    description:
      "How online registration, tournament-morning registration, payment, and confirmation work.",
    icon: CircleDollarSign,
    items: [
      {
        question: "When does Early Online Registration close?",
        answer:
          "Early Online Registration closes at 9:00 PM America/Chicago time on the evening before the tournament. A tournament may become unavailable earlier because of capacity, tournament status, or an official operational decision.",
      },
      {
        question: "Is a payment attempt considered a confirmed registration?",
        answer:
          "No. A draft, quote, payment attempt, browser message, payment redirect, or Square receipt by itself does not constitute a confirmed tournament registration. Payment must be verified and AITT must complete the registration workflow.",
      },
      {
        question: "Can I register on tournament morning?",
        answer:
          "Yes. Tournament-Morning Registration is a normal in-person registration period conducted by the Tournament Director. It is recorded in WeighFish and is not submitted through the AITT website.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "Online card and supported digital-wallet payments are processed through Square. Tournament-morning payments may be made by cash or through the Square reader. A 3% Card Processing Fee applies to payments processed through Square.",
      },
      {
        question: "Does paying an entry fee count as participating?",
        answer:
          "No. Paying an entry fee without physically launching and competing does not count as tournament participation for AOY or Championship qualification.",
      },
    ],
  },
  {
    title: "Team & Solo Competition",
    description:
      "How team identity, solo registration, partner absences, and season credit are handled.",
    icon: Users,
    items: [
      {
        question: "Can substitute partners be used?",
        answer:
          "No. Substitute partners are not permitted. AOY, Championship qualification, member side pots, and season-long awards are earned by the registered Competitive Record, not by interchangeable partners.",
      },
      {
        question: "What happens if one established team partner cannot fish?",
        answer:
          "The Team registration may continue to identify both established partners, with all season credit belonging to that Team Competitive Record. The remaining angler may instead register as Solo, but all season credit from that registration belongs only to the separate Solo Competitive Record.",
      },
      {
        question: "Do Team and Solo results transfer between each other?",
        answer:
          "No. Team and Solo Competitive Records are independent. Tournament results, AOY points, Championship qualification, and other season credit do not transfer between them.",
      },
      {
        question: "What if I fish with a different partner?",
        answer:
          "A pairing with a different partner is treated as a new team entry. That new team does not earn AOY points, Championship participation credit, or member-side-pot eligibility for the original team.",
      },
    ],
  },
  {
    title: "Insurance Pot & Big Bass",
    description:
      "How the optional Insurance Pot and Big Bass competition operate.",
    icon: CircleDollarSign,
    items: [
      {
        question: "How does the Insurance Pot work?",
        answer:
          "The Insurance Pot is optional and members-only. Payouts begin with the highest-finishing eligible Insurance Pot entry outside the regular Tournament Entry payout. Entries that did not join the Insurance Pot are skipped.",
        link: {
          label: "Learn About the Insurance Pot",
          href: "/insurance-pot",
        },
      },
      {
        question: "Is the entire Insurance Pot paid out?",
        answer:
          "Yes. The entire Insurance Pot is distributed. AITT retains none of the Insurance Pot, and every winning entry receives an equal payout, subject only to one-cent adjustments needed to distribute the exact total.",
      },
      {
        question: "How many places does the Insurance Pot pay?",
        answer:
          "One through nine entries pay one place. Ten through fourteen pay two places. Fifteen through nineteen pay three places. Twenty through twenty-four pay four places. Twenty-five through twenty-nine pay five places. One additional payout place is added for every additional group of five entries.",
      },
      {
        question: "How many places does the Big Bass side pot pay?",
        answer:
          "The optional Big Bass side pot pays two places. Big Bass is an optional add-on to Tournament Entry and is not a standalone entry.",
      },
      {
        question: "Are dead fish eligible for Big Bass?",
        answer:
          "No. Only legal live fish are eligible for a Big Bass payout. A fish presented dead at weigh-in is not eligible for either Big Bass payout.",
      },
    ],
  },
  {
    title: "Weigh-In & Fish Care",
    description:
      "Policies involving short fish, dead fish, official weights, and weigh-in procedures.",
    icon: Scale,
    items: [
      {
        question: "What happens if I bring a short fish to the scales?",
        answer:
          "A fish that does not meet the tournament's minimum legal length receives no tournament weight, does not count toward the legal tournament limit, and is not eligible for Big Bass.",
      },
      {
        question: "What is the penalty for a dead fish?",
        answer:
          "A one-pound penalty is deducted for each legal fish presented dead at weigh-in.",
      },
      {
        question: "Who controls official scoring and results?",
        answer:
          "WeighFish owns the tournament-day roster, check-in, weigh-in, scoring, and official results. Official results are published after weigh-in and the required review.",
      },
      {
        question: "What is the normal tournament fish limit?",
        answer:
          "The normal tournament limit is five legal fish. Designated Bass Stack events use the separate cumulative-weight format instead.",
      },
    ],
  },
  {
    title: "Check-In, Safety & Weather",
    description:
      "Late check-in penalties, official timekeeping, weather, and participant safety.",
    icon: CloudSun,
    items: [
      {
        question: "What happens if I am late to check-in?",
        answer:
          "A one-pound penalty is assessed for each minute an individual or team is late, up to fifteen minutes. An entry arriving more than fifteen minutes late forfeits that day's catch and may not weigh fish.",
      },
      {
        question: "Who determines the official check-in time?",
        answer:
          "Tournament Officials determine official check-in time using the tournament's designated official timekeeping device.",
      },
      {
        question: "Should I operate faster to avoid a late penalty?",
        answer:
          "No. Participants must never operate a vessel unsafely in an attempt to avoid a late penalty. Safety always takes precedence over tournament competition.",
      },
      {
        question: "Who makes weather and safety decisions?",
        answer:
          "The Tournament Director has final authority over safety, weather, delays, postponements, cancellations, and rescheduling.",
      },
      {
        question: "What weather sources does AITT use?",
        answer:
          "AccuWeather and Weather Underground are primary human decision references. Weather data does not automatically make a tournament decision.",
      },
      {
        question: "What happens when wind gusts reach 30 MPH?",
        answer:
          "Wind gusts of 30 MPH or greater will normally result in a delay or postponement. The Tournament Director makes the final operational decision.",
      },
    ],
  },
  {
    title: "Practice & Forward-Facing Sonar",
    description:
      "Tournament-week practice rules and AITT's traditional competition format.",
    icon: Shield,
    items: [
      {
        question: "When does the off-limits period begin for non-members?",
        answer:
          "Beginning at 12:00 AM midnight on Monday of tournament week, tournament waters are off-limits to non-member anglers registered to compete in that tournament.",
      },
      {
        question: "When may a registered member practice?",
        answer:
          "A current AITT member registered for that specific tournament may choose one official practice day immediately before the tournament. The member may practice either Friday or Saturday, but may not practice on both days.",
      },
      {
        question: "Does membership alone provide the practice privilege?",
        answer:
          "No. The angler must be both a current member and registered for the applicable tournament.",
      },
      {
        question: "Can someone scout tournament water for me?",
        answer:
          "No. A participant may not direct another person to scout tournament waters on the participant's behalf during an applicable off-limits period.",
      },
      {
        question: "Is forward-facing sonar allowed during competition?",
        answer:
          "No. Forward-facing sonar is prohibited during official AITT tournament competition.",
        link: {
          label: "Learn Why AITT Chose No FFS",
          href: "/no-forward-facing-sonar",
        },
      },
      {
        question: "Can forward-facing sonar be used during legal practice?",
        answer:
          "Yes. Forward-facing sonar may be used during legal practice periods unless another published event rule states otherwise.",
      },
    ],
  },
  {
    title: "Bass Stack Challenge",
    description:
      "AITT's cumulative-weight format used at selected tournaments.",
    icon: Fish,
    items: [
      {
        question: "What is the AITT Bass Stack Challenge?",
        answer:
          "Bass Stack is a cumulative-weight format used only at designated events. Every legal bass officially weighed contributes to the entry's cumulative tournament weight.",
        link: {
          label: "View Bass Stack Details",
          href: "/bass-stack",
        },
      },
      {
        question: "How is the Bass Stack winner determined?",
        answer:
          "Final placement is determined by cumulative official tournament weight after all penalties have been assessed.",
      },
      {
        question: "How many legal bass may be in the livewell?",
        answer:
          "A competitor may possess a maximum of three legal bass in the livewell at one time during a Bass Stack event.",
      },
      {
        question: "How many fish may be presented at one weigh-in?",
        answer:
          "No more than three legal bass may be presented during any single Bass Stack weigh-in.",
      },
      {
        question: "How often may competitors weigh fish?",
        answer:
          "Competitors may weigh fish as many times as desired during official tournament hours. Every official weigh-in becomes part of the cumulative tournament total.",
      },
      {
        question: "Which tournaments use Bass Stack?",
        answer:
          "For the 2026–2027 season, Bass Stack is designated for tournament #5 at Squaw Creek and tournament #8 at Lewisville.",
        link: {
          label: "View Tournament Schedule",
          href: "/schedule",
        },
      },
    ],
  },
  {
    title: "AOY & Championship",
    description:
      "Season points, dropped events, Competitive Records, and Championship qualification.",
    icon: Trophy,
    items: [
      {
        question: "Who is eligible to earn AOY points?",
        answer:
          "AOY points are available only to eligible member entries. Both anglers on a team must be members for the team to earn AOY points.",
        link: {
          label: "View AOY Information",
          href: "/aoy-points",
        },
      },
      {
        question: "How is the final AOY score calculated?",
        answer:
          "The regular season contains eight scheduled tournaments. Each Competitive Record's five highest point totals determine its final AOY score. The three lowest totals, including tournaments not fished, are dropped.",
      },
      {
        question: "How are eligible entries ranked for AOY points?",
        answer:
          "Official tournament results remain unchanged. Ineligible competitors are removed only from the AOY calculation, and eligible Competitive Records are reranked in their original relative finishing order.",
      },
      {
        question: "How many tournaments are required for Championship qualification?",
        answer:
          "An eligible Competitive Record must physically compete in at least five of the eight regular-season tournaments.",
      },
      {
        question: "Does a paid no-show count toward Championship qualification?",
        answer:
          "No. Payment without physically launching and competing does not count as participation.",
      },
      {
        question: "What membership rules apply to Championship qualification?",
        answer:
          "A Solo Competitive Record must satisfy the applicable membership and participation requirements. Both anglers on a Team Competitive Record must satisfy the membership requirements for the Team to receive Championship eligibility.",
      },
      {
        question: "Where can I see published AOY standings?",
        answer:
          "Published AOY standings are available on the Standings page after official tournament results and AOY points have been processed.",
        link: {
          label: "View Standings",
          href: "/standings",
        },
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header activeItem="FAQ" />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.13),transparent_38%)] py-10 md:py-16">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All-In Tournament Trail
            </p>

            <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
              Frequently Asked Questions
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-neutral-300 sm:text-lg">
              Quick answers about registration, membership, tournament rules,
              practice, payouts, weigh-in procedures, AOY, Championship
              qualification, and Bass Stack.
            </p>

            {/* Smaller Official Rules button */}
            <Link
              href="/rules"
              className="mt-6 inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-red-700 bg-red-800 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
            >
              View Official Rules
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="space-y-7">
            {faqSections.map((section) => {
              const Icon = section.icon;

              return (
                <section
                  key={section.title}
                  className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-7"
                >
                  <div className="flex items-start gap-4 border-b border-white/10 pb-5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#8f762f]/60 bg-[#15120b]">
                      <Icon
                        aria-hidden="true"
                        className="size-5 text-[#d0ae4c]"
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
                        {section.title}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-neutral-400">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 divide-y divide-white/10">
                    {section.items.map((item) => (
                      <details key={item.question} className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
                          <span className="text-sm font-black uppercase leading-6 tracking-[0.04em] text-white transition group-open:text-[#d0ae4c] sm:text-base">
                            {item.question}
                          </span>

                          <ChevronDown
                            aria-hidden="true"
                            className="size-5 shrink-0 text-[#d0ae4c] transition-transform duration-200 group-open:rotate-180"
                          />
                        </summary>

                        <div className="pb-5 pr-1 sm:pr-10">
                          <p className="text-sm leading-7 text-neutral-300 sm:text-base sm:leading-8">
                            {item.answer}
                          </p>

                          {item.link ? (
                            <Link
                              href={item.link.href}
                              className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.13em] text-[#d0ae4c] transition hover:text-red-500"
                            >
                              {item.link.label} →
                            </Link>
                          ) : null}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="rounded-xl border border-[#8f762f]/60 bg-[#13100a] px-6 py-8 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-red-500">
                  Still Have a Question?
                </p>

                <h2 className="mt-3 text-2xl font-black uppercase text-white sm:text-3xl">
                  Contact the AITT Team
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
                  Ask for clarification before tournament day so you understand
                  the applicable registration, membership, practice, and
                  competition requirements.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-red-700 bg-red-800 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-red-700 sm:w-auto"
              >
                Contact AITT
              </Link>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
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