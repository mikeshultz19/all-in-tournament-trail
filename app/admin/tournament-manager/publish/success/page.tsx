import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { getTournamentByIdentifier } from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";

interface PublishSuccessPageProps {
  searchParams: Promise<{
    tournament?: string | string[];
  }>;
}

export const dynamic = "force-dynamic";

export default async function PublishSuccessPage({
  searchParams,
}: PublishSuccessPageProps) {
  const params = await searchParams;

  const identifier = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;

  let tournament: Tournament | null = null;

  if (identifier) {
    try {
      tournament = await getTournamentByIdentifier(identifier);
    } catch {
      tournament = null;
    }
  }

  const publicResultsHref = identifier
    ? `/results/${encodeURIComponent(identifier)}`
    : "/results";

  const tournamentManagerHref = identifier
    ? `/admin/tournament-manager?tournament=${encodeURIComponent(identifier)}`
    : "/admin/tournament-manager";

  return (
    <section className="mx-auto mt-12 max-w-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
      <CheckCircle2
        aria-hidden="true"
        className="mx-auto size-12 text-emerald-400"
      />

      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
        Tournament Published
      </p>

      <h1 className="mt-2 text-3xl font-black uppercase text-white">
        {tournament?.name ?? "Results Are Live"}
      </h1>

      <p className="mt-4 text-sm text-neutral-300">
        The tournament results were published successfully and are now
        available on the public website.
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={publicResultsHref}
          className="inline-flex min-h-12 items-center justify-center bg-[#D4A017] px-6 text-xs font-black uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A017] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          View Public Results
        </Link>

        <Link
          href={tournamentManagerHref}
          className="inline-flex min-h-12 items-center justify-center border border-white/15 px-6 text-xs font-black uppercase tracking-[0.12em] text-white transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Return to Catalyst
        </Link>
      </div>
    </section>
  );
}