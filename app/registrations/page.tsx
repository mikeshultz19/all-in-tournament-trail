import type { Metadata } from "next";

import EarlyEntriesTable from "@/components/EarlyEntriesTable";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import TournamentEntrySummary from "@/components/TournamentEntrySummary";
import { getPublicEarlyEntriesForTournament } from "@/lib/tournament-registrations";
import { getFeaturedTournament, getNextUpcomingTournament } from "@/lib/tournaments";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";
import { getTournamentEntrySummary } from "@/lib/public-early-entry";

export const metadata: Metadata = {
  title: "Tournament Entries | All-In Tournament Trail",
  description: "View the current tournament field and optional pot participation.",
};

export const dynamic = "force-dynamic";

export default async function EarlyRegistrationsPage() {
  const dbTournament =
    (await getFeaturedTournament()) ?? (await getNextUpcomingTournament());

  if (!dbTournament) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <PageHeader title="Tournament Entries" compact />
        <p className="mx-auto max-w-7xl px-5 py-12 text-neutral-300 sm:px-6">
          No tournament is currently available.
        </p>
      </main>
    );
  }

  const tournament = toPublicTournament(dbTournament);
  const entries = await getPublicEarlyEntriesForTournament(dbTournament.id);
  const summary = getTournamentEntrySummary(entries);
  const operations = getTournamentOperationsViewModel(tournament);
  const registrationHref = `/register?tournament=${tournament.slug}`;

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <PageHeader
        title="Tournament Entries"
        subtitle={`View the current field and optional pot participation for ${tournament.name}.`}
        compact
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tournament Entries" }]}
      />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
        <TournamentEntrySummary
          summary={summary}
          registrationDeadline={operations.earlyRegistrationDeadline}
          registrationDeadlineIso={operations.earlyRegistrationDeadlineIso}
        />
        <EarlyEntriesTable
          entries={entries}
          registrationHref={registrationHref}
          registrationOpen={operations.registrationCanSubmit}
        />
      </section>
    </main>
  );
}
