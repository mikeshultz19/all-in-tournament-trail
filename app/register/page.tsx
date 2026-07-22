import type { Metadata } from "next";

import Header from "@/components/Header";
import RegistrationForm from "@/components/RegistrationForm";
import { tournaments } from "@/data/tournaments";
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
        operationsBySlug={operationsBySlug}
        initialSlug={initialSlug}
        policyVersions={{ rulesVersion: rules.version, waiverVersion: waiver.version }}
      />
    </main>
  );
}
