import { ArrowLeft, FileSpreadsheet, Upload } from "lucide-react";
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

  return (
    <>
      <Link
        href="/admin/tournament-manager"
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-[#D4A017]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tournament Manager
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
              Ready to import results for <strong>{tournament.name}</strong>
            </>
          ) : (
            "No tournament selected."
          )}
        </p>

      </section>

      <section className="mt-8 border border-white/10 bg-[#111111] p-8">

        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-[#D4A017]" />

          <div>
            <h2 className="text-xl font-black uppercase text-white">
              Upload WeighFish CSV
            </h2>

            <p className="text-sm text-neutral-400">
              Drag and drop or browse for your exported WeighFish CSV.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border-2 border-dashed border-neutral-700 p-12 text-center">

          <Upload className="mx-auto h-12 w-12 text-neutral-500" />

          <p className="mt-4 text-lg font-bold text-white">
            Upload coming next...
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Sprint 2 will connect the CSV parser and preview screen.
          </p>

        </div>

      </section>

      <section className="mt-8 border border-white/10 bg-[#111111] p-6">

        <h2 className="text-lg font-black uppercase text-white">
          Import Checklist
        </h2>

        <ul className="mt-4 space-y-3 text-neutral-300">

          <li>✓ Tournament selected</li>

          <li>• Upload WeighFish CSV</li>

          <li>• Preview imported data</li>

          <li>• Validate payouts</li>

          <li>• Save to database</li>

          <li>• Continue to Insurance Review</li>

        </ul>

      </section>
    </>
  );
}