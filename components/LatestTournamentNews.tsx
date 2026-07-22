import type { Tournament } from "@/data/tournaments";
import { getEffectiveTournamentDate } from "@/data/tournaments";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-operations";
import { formatTournamentDate } from "@/lib/tournament-time";

export default function LatestTournamentNews({ tournament }: { tournament: Tournament | undefined }) {
  return (
    <section className="w-full overflow-hidden border-b border-[#4A3A12] bg-[#111111]" aria-labelledby="tournament-status-heading">
      <div className="flex min-h-10 w-full items-center gap-3 overflow-hidden px-4 text-xs sm:px-6">
        <h2 id="tournament-status-heading" className="shrink-0 font-black uppercase tracking-[0.12em] text-[#D4A017]">
          Latest News &amp; Announcements
        </h2>
        <span aria-hidden="true" className="h-4 w-px shrink-0 bg-red-700" />
        <p className="min-w-0 truncate text-neutral-300">
          {tournament ? (
            <><strong className="uppercase text-white">{TOURNAMENT_STATUS_LABELS[tournament.tournamentStatus]}:</strong>{" "}{tournament.name} · {formatTournamentDate(getEffectiveTournamentDate(tournament))} · {tournament.statusMessage}</>
          ) : (
            "No upcoming tournament is currently scheduled."
          )}
        </p>
      </div>
    </section>
  );
}
