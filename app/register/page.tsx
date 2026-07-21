import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import RegistrationForm from "@/components/RegistrationForm";
import { tournaments } from "@/data/tournaments";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

export const metadata: Metadata = {
  title: "Register | All-In Tournament Trail",
  description: "Register for an upcoming All-In Tournament Trail event.",
};

export default async function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  const requestedSlug = (await searchParams).tournament;
  const initialSlug = tournaments.some((tournament) => tournament.slug === requestedSlug)
    ? requestedSlug
    : tournaments[0]?.slug;
  const now = new Date();
  const operationsBySlug = Object.fromEntries(
    tournaments.map((tournament) => [
      tournament.slug,
      getTournamentOperationsViewModel(tournament, now),
    ]),
  );

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-[#F2F2F2]">
      <Header />
      <section className="bg-[#111111]">
        <div className="mx-auto max-w-[1400px] px-5 pt-6 sm:px-6 sm:pt-8">
          <div className="mb-6 border-b border-amber-500/30 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Tournament Registration
              </h1>
              <Link href="/registrations" className="text-xs font-black uppercase tracking-[0.12em] text-yellow-400 transition hover:text-yellow-300">
                Tournament Entries
              </Link>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              Select your tournament, choose your entry options, and complete your registration.
            </p>
          </div>
        </div>
      </section>
      <RegistrationForm operationsBySlug={operationsBySlug} initialSlug={initialSlug} />
    </main>
  );
}
