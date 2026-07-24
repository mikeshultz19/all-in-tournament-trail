import type { Metadata } from "next";

import Header from "@/components/Header";
import RegistrationForm from "@/components/RegistrationForm";
import { getTournaments } from "@/lib/tournaments";
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
    tournaments = (await getTournaments()).map(toPublicTournament);
  } catch (error) {
    console.error("Registration tournament load failed.", error);
  }

  if (tournaments.length === 0) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] text-[#F2F2F2]">
        <Header />
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
      <RegistrationForm
        tournaments={tournaments}
        operationsBySlug={operationsBySlug}
        initialSlug={initialSlug}
        policyVersions={{ rulesVersion: rules.version, waiverVersion: waiver.version }}
      />
    </main>
  );
}
