import PaymentAnnouncement from "@/components/PaymentAnnouncement";
import TournamentStatusAnnouncement from "@/components/TournamentStatusAnnouncement";
import type { Tournament } from "@/data/tournaments";
import type { Announcement } from "@/types/announcement";

export default function LatestTournamentNews({
  tournament,
  announcements,
}: {
  tournament: Tournament | undefined;
  announcements: readonly Announcement[];
}) {
  return (
    <section
      data-homepage-news
      className="border-b border-zinc-900 bg-black px-4 py-8 lg:px-8 lg:py-10"
      aria-labelledby="latest-news-heading"
    >
      <div className="mx-auto w-full max-w-[1700px]">
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

        {announcements.length > 0 && (
          <div className="mt-4 grid gap-3">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="border border-white/10 bg-[#111111] px-5 py-4"
              >
                <h3 className="text-base font-black uppercase tracking-tight text-red-500">
                  {announcement.title}
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-200">
                  {announcement.content}
                </p>
                <p className="mt-3 text-xs text-neutral-500">
                  Updated{" "}
                  <time dateTime={announcement.updated_at}>
                    {new Intl.DateTimeFormat("en-US", {
                      timeZone: "America/Chicago",
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(announcement.updated_at))}
                  </time>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
