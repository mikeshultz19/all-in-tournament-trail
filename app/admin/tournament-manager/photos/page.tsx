import { ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";

import WinnerPhotosForm from "@/components/admin/WinnerPhotosForm";
import {
  getNextUpcomingTournament,
  getTournamentByIdentifier,
} from "@/lib/tournaments";

interface WinnerPhotosPageProps {
  searchParams: Promise<{ tournament?: string | string[] }>;
}

export const dynamic = "force-dynamic";

export default async function WinnerPhotosPage({
  searchParams,
}: WinnerPhotosPageProps) {
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
        href={
          requestedTournament
            ? `/admin/tournament-manager?tournament=${encodeURIComponent(
                requestedTournament,
              )}`
            : "/admin/tournament-manager"
        }
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017]"
      >
        <ArrowLeft className="size-4" />
        Back to Tournament Manager
      </Link>

      <div className="mt-6 border-b border-white/10 pb-6">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-500">
          <Camera className="size-4" />
          Post Tournament Workflow
        </p>

        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
          Winner Photos
        </h1>

        {tournament && (
          <p className="mt-3 text-sm text-neutral-400">
            {tournament.name} — {tournament.lake}
          </p>
        )}
      </div>

      {tournament ? (
        <div className="mt-6">
          <WinnerPhotosForm
            key={tournament.id}
            tournament={tournament}
          />
        </div>
      ) : (
        <section className="mt-6 border border-white/10 bg-[#111111] p-6">
          <h2 className="text-xl font-black uppercase text-white">
            Tournament Not Found
          </h2>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Return to Tournament Manager and select a tournament.
          </p>
        </section>
      )}
    </>
  );
}