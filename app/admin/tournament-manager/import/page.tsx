import WeighfishCsvUploader from "@/components/admin/WeighfishCsvUploader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  getNextUpcomingTournament,
  getTournamentByIdentifier,
} from "@/lib/tournaments";

interface ImportPageProps {
  searchParams: Promise<{ tournament?: string | string[] }>;
}

export const dynamic = "force-dynamic";

export default async function WeighFishImportPage({
  searchParams,
}: ImportPageProps) {
  const params = await searchParams;

  const requestedTournament = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;

  const tournament = requestedTournament
    ? await getTournamentByIdentifier(requestedTournament)
    : await getNextUpcomingTournament();

  const weighfishImported = tournament?.weighfish_imported ?? false;

  return (
    <>
      <Link
        href={
          requestedTournament
            ? `/admin?tournament=${encodeURIComponent(requestedTournament)}`
            : "/admin"
        }
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-[#D4A017]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tournament Operations
      </Link>

      <header className="mt-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
          Step 2 of 5
        </p>

        <h1 className="mt-2 text-4xl font-black uppercase text-white">
          Import WeighFish
        </h1>

        <p className="mt-4 max-w-3xl text-neutral-400">
          Import the official WeighFish CSV file. This import becomes the
          official tournament standings and payout information.
        </p>
      </header>

      <section className="mt-8 border border-[#D4A017]/20 bg-[#D4A017]/5 p-6">
        <h2 className="text-lg font-black uppercase text-white">
          Tournament
        </h2>

        <p className="mt-2 text-neutral-300">
          {tournament ? (
            <>
              Ready to import results for{" "}
              <strong>{tournament.name}</strong>
            </>
          ) : (
            "No tournament selected."
          )}
        </p>
      </section>

      {tournament ? (
        <div className="mt-8">
     <WeighfishCsvUploader
  key={tournament.id}
  tournamentId={tournament.id}
  returnToDashboard
/>
        </div>
      ) : (
        <section className="mt-8 border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm font-semibold text-red-200">
            Select a tournament before importing results.
          </p>
        </section>
      )}

      <section className="mt-8 border border-white/10 bg-[#111111] p-6">
        <h2 className="text-lg font-black uppercase text-white">
          Import Checklist
        </h2>

        <ul className="mt-4 space-y-3 text-neutral-300">
          <li>{tournament ? "✓" : "•"} Tournament selected</li>
          <li>{weighfishImported ? "✓" : "•"} Upload WeighFish CSV</li>
          <li>{weighfishImported ? "✓" : "•"} Preview imported data</li>
          <li>{weighfishImported ? "✓" : "•"} Validate payouts</li>
          <li>{weighfishImported ? "✓" : "•"} Save to database</li>
          <li>{weighfishImported ? "✓" : "•"} Continue to the Insurance Pot Calculator</li>
        </ul>
      </section>
    </>
  );
}
