import { Pin } from "lucide-react";

import type { Announcement } from "@/types/announcement";

function formatAnnouncementDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
  }).format(date);
}

export default function LatestTournamentNews({
  announcements,
}: {
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

        {announcements.length === 0 ? (
          <div className="border border-white/10 bg-[#111111] p-6 text-sm text-neutral-400">
            No current news or announcements are available.
          </div>
        ) : (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="overflow-hidden border border-white/10 border-l-4 border-l-[#D4A017] bg-[#111111] px-5 py-5 sm:px-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {announcement.is_pinned && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">
                      <Pin aria-hidden="true" className="size-3.5" />
                      Pinned Announcement
                    </span>
                  )}
                </div>

                <h3 className="mt-2 break-words text-lg font-black uppercase tracking-tight text-white sm:text-2xl">
                  {announcement.title}
                </h3>

                {announcement.summary && (
                  <p className="mt-3 text-sm font-semibold leading-6 text-neutral-200">
                    {announcement.summary}
                  </p>
                )}

                <div className="mt-4 whitespace-pre-line text-sm leading-6 text-neutral-300">
                  {announcement.content}
                </div>

                {announcement.link_label && announcement.link_url && (
                  <a
                    href={announcement.link_url}
                    target={
                      announcement.link_url.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      announcement.link_url.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.12em] text-[#D4A017] transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
                  >
                    {announcement.link_label}
                  </a>
                )}

                <p className="mt-4 text-xs text-neutral-500">
                  Updated{" "}
                  <time dateTime={announcement.publish_date ?? announcement.updated_at}>
                    {formatAnnouncementDate(
                      announcement.publish_date ?? announcement.updated_at,
                    )}
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
