import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "Why We Chose No Forward-Facing Sonar | All In Tournament Trail",
  description:
    "Learn why All In Tournament Trail offers a traditional tournament competition option without forward-facing sonar.",
};

const sectionHeadingClass =
  "text-3xl font-black uppercase tracking-tight text-white sm:text-4xl";
const sectionCopyClass =
  "mt-5 max-w-3xl space-y-4 text-base leading-7 text-neutral-300";
const secondaryButtonClass =
  "inline-flex min-h-12 items-center justify-center border border-white/20 bg-black px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#d0ae4c] hover:text-[#d0ae4c]";

export default function NoForwardFacingSonarPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="max-w-4xl">
            <header className="border-b border-[#D4A017]/30 pb-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
                All In Tournament Trail
              </p>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
                Why We Chose No Forward-Facing Sonar
              </h1>
              <p className="mt-4 text-xl font-black uppercase tracking-wide text-[#d0ae4c] sm:text-2xl">
                A Traditional Competition Option
              </p>
            </header>

            <div className="divide-y divide-white/10">
              <section className="py-10" aria-labelledby="founded-by-fishermen">
                <h2 id="founded-by-fishermen" className={sectionHeadingClass}>
                  AITT Is Founded by Fishermen, Built for Fishermen
                </h2>
                <div className={sectionCopyClass}>
                  <p>Every major decision made by the All In Tournament Trail begins with one question:</p>
                  <p className="border-l-2 border-red-700 pl-4 font-semibold text-white">
                    What creates the best tournament experience for the anglers we serve?
                  </p>
                  <p>AITT was founded to increase participation through flexible entry options, balanced payouts, and a tournament schedule designed for real life. Our forward-facing sonar policy was developed using that same philosophy.</p>
                </div>
              </section>

              <section className="py-10" aria-labelledby="our-decision">
                <h2 id="our-decision" className={sectionHeadingClass}>Our Decision</h2>
                <div className={sectionCopyClass}>
                  <p>After careful consideration, AITT elected to prohibit the use of forward-facing sonar during official tournament competition.</p>
                  <p>AITT was founded to provide an alternative for anglers who prefer to compete using traditional fishing methods during tournament hours. This policy is intended to preserve that style of competition and provide every participant with a clear and consistent tournament environment.</p>
                </div>
              </section>

              <section className="py-10" aria-labelledby="practice-is-different">
                <h2 id="practice-is-different" className={sectionHeadingClass}>Practice Is Different from Competition</h2>
                <div className={sectionCopyClass}>
                  <p>AITT welcomes the use of forward-facing sonar during legal practice periods.</p>
                  <p>Competitors may use available technology to locate fish, study water, establish patterns, and prepare for tournament day.</p>
                  <p>Once official tournament hours begin, forward-facing sonar may not be used.</p>
                  <p>Our policy governs how AITT tournaments are conducted—not how anglers choose to prepare.</p>
                </div>
              </section>

              <section className="py-10" aria-labelledby="respect-for-every-organization">
                <h2 id="respect-for-every-organization" className={sectionHeadingClass}>Respect for Every Organization</h2>
                <div className={sectionCopyClass}>
                  <p>AITT respects tournament organizations that allow forward-facing sonar and the anglers who compete in those formats.</p>
                  <p>Those organizations have made decisions they believe best serve their participants. Our policy is not intended as criticism of another trail, organization, technology, or angler.</p>
                  <p>AITT simply offers a different competitive option.</p>
                </div>
              </section>

              <aside className="border-l-2 border-[#d0ae4c] py-5 pl-5 text-base font-semibold leading-7 text-[#e2c66f]">
                AITT is not built around opposing technology. We are providing another choice for anglers who prefer a traditional tournament format during competition.
              </aside>

              <section className="py-10" aria-labelledby="every-angler-choice">
                <h2 id="every-angler-choice" className={sectionHeadingClass}>Every Angler Deserves a Choice</h2>
                <div className={sectionCopyClass}>
                  <p>Some tournament organizations allow forward-facing sonar. Others limit or prohibit it.</p>
                  <p>AITT has chosen a traditional competition format during tournament hours while allowing competitors to prepare with forward-facing sonar during legal practice.</p>
                  <p>We respect every angler&apos;s right to select the tournament experience that best matches how they want to compete.</p>
                </div>
              </section>

              <section className="py-10" aria-labelledby="closing-statement">
                <h2 id="closing-statement" className={sectionHeadingClass}>Closing Statement</h2>
                <div className={sectionCopyClass}>
                  <p>AITT is not trying to tell anglers how they should fish or prepare.</p>
                  <p>We are creating a tournament trail where every competitor understands the conditions of competition before launching the boat.</p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/rules#forward-facing-sonar" className="inline-flex min-h-12 items-center justify-center border border-red-700 bg-red-800 px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700">
                    View Official Rules
                  </Link>
                  <Link href="/how-it-works" className={secondaryButtonClass}>How AITT Works</Link>
                  <Link href="/schedule" className={secondaryButtonClass}>View Tournament Schedule</Link>
                </div>

                <div className="mt-8 border-t border-white/10 pt-7">
                  <h3 className="text-lg font-black uppercase tracking-wide text-[#D4A017]">
                    Questions About the Policy?
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                    AITT welcomes respectful questions and discussion about our competition format.
                  </p>
                  <Link href="/contact" className="mt-3 inline-flex min-h-11 items-center text-sm font-black uppercase tracking-[0.12em] text-yellow-400 transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400">
                    Contact AITT
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
