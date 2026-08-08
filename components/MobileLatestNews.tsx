import { Pin } from "lucide-react";
import Link from "next/link";

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

function getExcerpt(announcement: Announcement): string {
  const source =
    announcement.summary?.trim() ||
    announcement.content
      .split(/\r?\n/)
      .map((paragraph) => paragraph.trim())
      .find(Boolean) ||
    "";

if (source.length <= 155) {
  return source;
}

return `${source.slice(0, 152).trimEnd()}...`;
}

export default function MobileLatestNews({
  announcements,
}: {
  announcements: readonly Announcement[];
}) {
  const announcement = announcements[0] ?? null;

  return (
    <section aria-labelledby="mobile-latest-news-heading">
      <div className="mb-3 flex items-center gap-3">
        <h2
          id="mobile-latest-news-heading"
          className="text-base font-black uppercase tracking-[0.08em] text-white"
        >
          Latest News
        </h2>

        <div
          aria-hidden="true"
          className="h-px flex-1 bg-gradient-to-r from-red-600/80 to-transparent"
        />
      </div>

      {!announcement ? (
        <div className="rounded-lg border border-white/10 bg-[#111111] p-4 text-sm text-neutral-400">
          No current news is available.
        </div>
      ) : (
        <article className="rounded-lg border border-white/10 border-l-2 border-l-[#D4A017] bg-[#111111] p-3">
          {announcement.is_pinned ? (
            <div className="flex items-center gap-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#D4A017]">
              <Pin aria-hidden="true" className="size-3" />
              Pinned
            </div>
          ) : null}

          <h3 className="mt-2 text-sm font-black uppercase leading-5 tracking-tight text-white">
            {announcement.title}
          </h3>

          <p className="mt-2 text-xs leading-5 text-neutral-300">
            {getExcerpt(announcement)}
          </p>

          <div className="mt-4 flex items-center justify-between gap-4">
            <time
              dateTime={
                announcement.publish_date ?? announcement.updated_at
              }
              className="text-[0.68rem] text-neutral-500"
            >
              {formatAnnouncementDate(
                announcement.publish_date ?? announcement.updated_at,
              )}
            </time>

            {announcement.link_label && announcement.link_url ? (
              announcement.link_url.startsWith("/") ? (
                <Link
                  href={announcement.link_url}
                  className="cursor-pointer text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#D4A017] transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
                >
                  {announcement.link_label}
                </Link>
              ) : (
                <a
                  href={announcement.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#D4A017] transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
                >
                  {announcement.link_label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )
            ) : null}
          </div>
        </article>
      )}
    </section>
  );
}
