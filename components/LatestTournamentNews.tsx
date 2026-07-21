import TournamentStatusAnnouncement from "@/components/TournamentStatusAnnouncement";
import type { Tournament } from "@/data/tournaments";

export default function LatestTournamentNews({ tournament }: { tournament: Tournament | undefined }) {
  return (
    <section className="bg-black px-4 pb-6 pt-0 sm:px-6 lg:pb-8" aria-labelledby="tournament-status-heading">
      <div className="mx-auto max-w-[1300px]">
        <div className="mb-3 flex items-center gap-4">
          <h2 id="tournament-status-heading" className="shrink-0 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            Tournament Status &amp; Announcements
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-red-600 via-red-600/40 to-transparent" />
        </div>

        {tournament ? (
          <TournamentStatusAnnouncement tournament={tournament} />
        ) : (
          <div className="border border-white/10 bg-[#111111] p-6 text-sm text-neutral-400">
            No upcoming tournament is currently scheduled. Check the schedule for future announcements.
          </div>
        )}
      </div>
    </section>
  );
}
