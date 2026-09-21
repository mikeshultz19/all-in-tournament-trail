import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "AOY Points Race | All In Tournament Trail",
  description:
    "Learn how All In Tournament Trail awards Angler of the Year points throughout the season.",
  alternates: {
    canonical: "/aoy-points",
  },
};

const sectionHeadingClass =
  "text-3xl font-black uppercase tracking-tight text-white sm:text-4xl";
const sectionCopyClass =
  "mt-5 max-w-3xl space-y-4 text-base leading-7 text-neutral-300";
const secondaryButtonClass =
  "inline-flex min-h-12 items-center justify-center border border-white/20 bg-black px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#d0ae4c] hover:text-[#d0ae4c]";

const exampleRows = [
  ["1st", "200"],
  ["2nd", "199"],
  ["3rd", "198"],
] as const;

export default function AoyPointsPage() {
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
                AOY Points Race
              </h1>
              <p className="mt-4 text-xl font-black uppercase tracking-wide text-[#d0ae4c] sm:text-2xl">
                Official Finish Position Drives the Race.
              </p>
            </header>

            <div className="divide-y divide-white/10">
              <section className="py-10" aria-labelledby="how-aoy-points-work">
                <h2 id="how-aoy-points-work" className={sectionHeadingClass}>
                  How AOY Points Work
                </h2>
                <div className={sectionCopyClass}>
                  <p>AOY points are awarded based on each angler&apos;s official finishing position at every regular-season tournament.</p>
                </div>
              </section>

              <section className="py-10" aria-labelledby="aoy-example">
                <h2 id="aoy-example" className={sectionHeadingClass}>Example</h2>
                <div className="mt-6 max-w-2xl overflow-hidden border border-white/10">
                  <div className="grid grid-cols-2 bg-[#171717] text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">
                    <span className="px-4 py-3">Tournament Finish</span>
                    <span className="px-4 py-3 text-right">AOY Points</span>
                  </div>
                  <div className="divide-y divide-white/10 bg-[#111111]">
                    {exampleRows.map(([finish, points]) => (
                      <div key={finish} className="grid grid-cols-2 text-sm">
                        <span className="px-4 py-3 text-neutral-300">{finish}</span>
                        <span className="px-4 py-3 text-right font-black text-white">{points}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-300">
                  Official tournament finish position determines AOY points.
                </p>
              </section>

              <section className="py-10" aria-labelledby="built-around-flexibility">
                <h2 id="built-around-flexibility" className={sectionHeadingClass}>
                  Built Around Flexibility
                </h2>
                <div className={sectionCopyClass}>
                  <p>Fish the regular-season tournaments that fit your schedule.</p>
                  <p>Only the best 5 of 8 point totals count toward the final AOY standings. The three lowest scores are automatically dropped.</p>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/rules#angler-of-the-year" className="inline-flex min-h-12 items-center justify-center border border-red-700 bg-red-800 px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700">View Official Rules</Link>
                  <Link href="/schedule" className={secondaryButtonClass}>Tournament Schedule</Link>
                  <Link href="/standings" className={secondaryButtonClass}>Current AOY Standings</Link>
                  <Link href="/how-it-works" className={secondaryButtonClass}>How AITT Works</Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
