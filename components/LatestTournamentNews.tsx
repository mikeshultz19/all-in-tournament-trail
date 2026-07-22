import PaymentAnnouncement from "@/components/PaymentAnnouncement";
import TournamentStatusAnnouncement from "@/components/TournamentStatusAnnouncement";
import type { Tournament } from "@/data/tournaments";

export default function LatestTournamentNews({ tournament }: { tournament: Tournament | undefined }) {
  return (
    <section
      className="overflow-x-hidden border-b border-zinc-900 bg-black px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      aria-labelledby="latest-news-heading"
    >
      <div className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:max-w-[1700px]">
        <div className="mb-4 flex items-center gap-4">
          <h2
            id="latest-news-heading"
            className="min-w-0 break-words font-serif text-xl font-bold uppercase tracking-tight text-white sm:shrink-0 sm:text-3xl"
          >
            Latest News &amp; Announcements
          </h2>
          <div
            aria-hidden="true"
            className="hidden h-px flex-1 bg-gradient-to-r from-red-600 via-red-600/40 to-transparent sm:block"
          />
        </div>

        {tournament ? (
          <TournamentStatusAnnouncement tournament={tournament} />
        ) : (
          <div className="border border-white/10 bg-[#111111] p-6 text-sm text-neutral-400">
            No upcoming tournament is currently scheduled. Check the schedule for future announcements.
          </div>
        )}
        <PaymentAnnouncement />
      </div>
    </section>
  );
}
