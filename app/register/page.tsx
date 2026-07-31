import type { Metadata } from "next";

import Header from "@/components/Header";
import RegistrationForm from "@/components/RegistrationForm";
import { getActiveSeasonSchedule } from "@/lib/tournaments";
import {
  toPublicTournament,
  type PublicTournamentRecord,
} from "@/lib/tournament-record-adapter";
import { loadPolicyDocument } from "@/lib/policy-documents";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

export const metadata: Metadata = {
  title: "Register | All-In Tournament Trail",
  description: "Register for an upcoming All-In Tournament Trail event.",
};

function RegistrationClosedBanner() {
  return (
    <section
      aria-labelledby="soft-launch-registration-heading"
      className="border-b border-[#D4A017]/40 bg-[#D4A017]/10"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-5 sm:px-6 sm:py-6">
        <h1
          id="soft-launch-registration-heading"
          className="text-xl font-black uppercase text-[#D4A017] sm:text-2xl"
        >
          Registration is Currently Closed
        </h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-200">
          Thank you for your interest in the All In Tournament Trail! Feel free
          to explore the registration process and review the information that
          will be required. Official registration dates for our inaugural
          season will be announced soon.
        </p>
      </div>
    </section>
  );
}

export default async function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  const requestedSlug = (await searchParams).tournament;
  const [rules, waiver] = await Promise.all([
    loadPolicyDocument("rules"),
    loadPolicyDocument("liability-waiver"),
  ]);
  let tournaments: PublicTournamentRecord[] = [];

  try {
    tournaments = (await getActiveSeasonSchedule()).map(toPublicTournament);
  } catch (error) {
    console.error("Registration tournament load failed.", error);
  }

  if (tournaments.length === 0) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] text-[#F2F2F2]">
        <Header />
        <RegistrationClosedBanner />
        <p className="mx-auto max-w-4xl px-5 py-12 text-neutral-300 sm:px-6">
          No tournaments are currently available for registration.
        </p>
      </main>
    );
  }
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
      <RegistrationClosedBanner />
      <RegistrationForm
        tournaments={tournaments}
        operationsBySlug={operationsBySlug}
        initialSlug={initialSlug}
        policyVersions={{ rulesVersion: rules.version, waiverVersion: waiver.version }}
      />
    </main>
  );
}
