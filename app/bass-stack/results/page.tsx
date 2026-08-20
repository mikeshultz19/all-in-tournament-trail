import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "Bass Stack Tournament Results | All In Tournament Trail",
  description:
    "View published Bass Stack tournament standings from All In Tournament Trail.",
  alternates: {
    canonical: "/bass-stack/results",
  },
};

export default function BassStackResultsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header activeItem="Bass Stack" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="border-b border-[#D4A017]/30 pb-6">
            <span className="inline-flex min-w-[54px] items-center justify-center rounded border border-[#c9aa4a]/70 bg-black/70 px-2.5 py-1 text-center text-[0.55rem] font-black uppercase leading-none tracking-[0.08em] text-[#c9aa4a]">
              Bass
              <br />
              Stack
            </span>

            <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-5xl">
              Bass Stack Tournament Results
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
              Full published tournament standings will appear here when Bass Stack results are available.
            </p>
          </div>

          <section className="mt-8 border border-white/10 bg-[#111111] px-5 py-8 text-center sm:px-8 sm:py-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">
              Coming Soon
            </p>
            <h2 className="mt-3 text-xl font-black uppercase text-white sm:text-2xl">
              No Published Results Yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-400">
              The complete Bass Stack tournament field will be posted here after results are official and published.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex min-h-11 items-center justify-center border border-[#D4A017]/70 px-5 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#D4A017] transition hover:border-yellow-300 hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
            >
              Return Home
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
