import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "Bass Stack Challenge | All In Tournament Trail",
  description:
    "Learn how the AITT Bass Stack Total Weight Challenge counts every legal bass at selected All In Tournament Trail events.",
  alternates: {
    canonical: "/bass-stack",
  },
};

const bassStackEvents = [
  {
    name: "Squaw Creek",
    date: "Feb 14, 2027",
    dateTime: "2027-02-14",
    href: "/register?tournament=squaw-creek-2027",
  },
  {
    name: "Lewisville",
    date: "May 16, 2027",
    dateTime: "2027-05-16",
    href: "/register?tournament=lewisville-may-2027",
  },
] as const;

export default function BassStackPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header activeItem="Bass Stack" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-700 to-transparent" />

          <header className="py-8 md:py-10">
            <span className="inline-flex whitespace-nowrap rounded border border-[#c9aa4a]/70 bg-black/70 px-2 py-1 text-[0.58rem] font-black uppercase leading-none tracking-[0.18em] text-[#c9aa4a]">
              BASS STACK
            </span>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All In Tournament Trail
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
              Bass Stack Total Weight Challenge
            </h1>
            <p className="mt-4 text-xl font-black uppercase tracking-wide text-[#d0ae4c] sm:text-2xl">
              Every Legal Bass Adds to Your Total.
            </p>
            <p className="mt-6 max-w-4xl text-base leading-7 text-neutral-300">
              The AITT Bass Stack Total Weight Challenge is a cumulative-weight tournament format used at selected All In Tournament Trail events. Instead of counting only a traditional five-fish limit, every legal bass officially weighed contributes to the angler&apos;s or team&apos;s tournament total.
            </p>
            <section className="mt-6 max-w-4xl" aria-labelledby="bass-stack-events">
              <h2 id="bass-stack-events" className="text-xs font-black uppercase tracking-[0.18em] text-[#D4A017]">
                Bass Stack Events
              </h2>
              <div className="mt-3 grid divide-y divide-white/10 md:mx-auto md:max-w-xl md:grid-cols-2 md:divide-x md:divide-y-0">
                {bassStackEvents.map((event) => (
                  <div
                    key={event.href}
                    className="py-3 md:px-4 md:text-center"
                  >
                    <span className="block text-sm font-black uppercase tracking-[0.08em] text-white">
                      {event.name}
                    </span>
                    <time dateTime={event.dateTime} className="mt-1 block text-xs text-neutral-400">
                      {event.date}
                    </time>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Link
                  href="/schedule"
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-5 py-3 text-sm font-black uppercase tracking-wider text-white transition active:scale-[0.96] hover:bg-red-600"
                >
                  View Schedule
                </Link>
              </div>
            </section>
          </header>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-700 to-transparent" />

          <section className="py-10 md:py-14" aria-labelledby="how-bass-stack-works">
            <h2 id="how-bass-stack-works" className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              How Bass Stack Works
            </h2>

            <div className="mt-6 space-y-6">
              <article className="border-t-2 border-red-700 bg-[#111111] p-5">
                <h3 className="text-lg font-black uppercase tracking-[0.1em] text-[#D4A017]">
                  Every Legal Bass Counts
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Unlike a traditional five-fish tournament, the AITT Bass Stack Total Weight Challenge rewards cumulative weight.
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Every legal bass officially weighed during tournament hours contributes to the angler&apos;s or team&apos;s cumulative tournament total.
                </p>
              </article>

              <article className="border-t-2 border-red-700 bg-[#111111] p-5">
                <h3 className="text-lg font-black uppercase tracking-[0.1em] text-[#D4A017]">
                  Three-Fish Livewell Limit
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Competitors may keep a maximum of three legal bass in their livewell at any one time.
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Once three legal fish are in the livewell, the competitor decides how to continue.
                </p>
              </article>

              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  It&apos;s Your Choice
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  When your livewell contains three legal bass, you have two options.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <article className="border border-white/10 bg-[#111111] p-5">
                    <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#D4A017]">
                      Option 1 — Weigh Immediately
                    </h4>
                    <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-300">
                      <p>Bring your fish to the weigh-in station.</p>
                      <p>A maximum of three legal fish may be weighed during each visit.</p>
                      <p>Those fish are immediately added to your cumulative tournament total.</p>
                      <p>After weighing, return to fishing with an empty livewell.</p>
                    </div>
                  </article>

                  <article className="border border-white/10 bg-[#111111] p-5">
                    <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#D4A017]">
                      Option 2 — Cull and Upgrade
                    </h4>
                    <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-300">
                      <p>Continue fishing and replace (cull) any of the three fish in your livewell with a larger legal bass before making your next trip to the scales.</p>
                      <p>Competitors decide when to weigh and when to continue upgrading.</p>
                      <p>Tournament strategy is entirely the angler&apos;s choice.</p>
                    </div>
                  </article>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <article className="border-t border-white/20 py-5">
                  <h3 className="text-base font-black uppercase tracking-[0.1em] text-[#D4A017]">
                    Multiple Weigh-Ins
                  </h3>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-300">
                    <p>Competitors may make as many trips to the weigh-in station as they choose during tournament hours.</p>
                    <p>Each weigh-in is limited to three legal bass maximum.</p>
                    <p>Every official weigh-in is added to the competitor&apos;s cumulative tournament weight.</p>
                  </div>
                </article>

                <article className="border-t border-white/20 py-5">
                  <h3 className="text-base font-black uppercase tracking-[0.1em] text-[#D4A017]">
                    Final Weigh-In
                  </h3>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-300">
                    <p>When tournament time expires, competitors must bring any remaining legal fish in their livewell (up to three) to the scales.</p>
                    <p>Those fish become the competitor&apos;s final official weigh-in.</p>
                  </div>
                </article>

                <article className="border-t border-white/20 py-5">
                  <h3 className="text-base font-black uppercase tracking-[0.1em] text-[#D4A017]">
                    The Winner
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-300">
                    After all official weigh-ins have been completed, the angler or team with the greatest cumulative official weight is declared the Bass Stack Total Weight Challenge Winner.
                  </p>
                </article>
              </div>

              <aside className="border-l-2 border-red-700 pl-4">
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                  Important
                </h3>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-400">
                  The Bass Stack Total Weight Challenge is an All In Tournament Trail competition format inspired by cumulative-weight professional bass fishing. All official tournament procedures, penalties, eligibility requirements, and tie-breaking procedures are governed exclusively by the Official Rules.
                </p>
              </aside>

              <p className="text-sm leading-6 text-neutral-400">
                View the Tournament Schedule to see which events use the Bass Stack format.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/rules#bass-stack"
                  className="inline-flex min-h-11 items-center justify-center border border-red-700 bg-red-800 px-5 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700"
                >
                  View Official Bass Stack Rules
                </Link>
                <Link
                  href="/schedule"
                  className="inline-flex min-h-11 items-center justify-center border border-white/20 px-5 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:border-[#D4A017] hover:text-[#D4A017]"
                >
                  View Tournament Schedule
                </Link>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-700 to-transparent" />
        </div>
      </section>
    </main>
  );
}
