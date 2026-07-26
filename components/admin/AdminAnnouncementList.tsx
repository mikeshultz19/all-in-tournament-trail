import { ArrowLeft, FileText, Plus } from "lucide-react";
import Link from "next/link";

import type { Announcement } from "@/types/announcement";

interface AdminAnnouncementListProps {
  announcements: readonly Announcement[];
  loadFailed?: boolean;
  successMessage?: string;
}

function formatAnnouncementDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminAnnouncementList({
  announcements,
  loadFailed = false,
  successMessage,
}: AdminAnnouncementListProps) {
  return (
    <>
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Admin Center
      </Link>

      <div className="mt-8 flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
            News &amp; Announcements
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Announcements
          </h1>
        </div>

        <Link
          href="/admin/announcements/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#D4A017] px-5 text-xs font-black uppercase tracking-[0.12em] text-[#D4A017] transition-colors hover:bg-[#D4A017] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
        >
          <Plus aria-hidden="true" className="size-4" />
          New Announcement
        </Link>
      </div>

      {successMessage && (
        <p
          role="status"
          className="mt-8 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300"
        >
          {successMessage}
        </p>
      )}

      {loadFailed ? (
        <section
          data-announcements-state="error"
          className="mt-8 border border-red-500/30 bg-red-500/10 px-6 py-10 text-center"
        >
          <h2 className="text-lg font-black uppercase text-white">
            Announcements Unavailable
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-300">
            We could not load announcements. Check the Supabase migration and
            permissions, then try again.
          </p>
        </section>
      ) : announcements.length === 0 ? (
        <section
          data-announcements-state="empty"
          className="mt-8 border border-white/10 bg-[#111111] px-6 py-14 text-center sm:px-10"
        >
          <FileText
            aria-hidden="true"
            className="mx-auto size-8 text-[#D4A017]"
            strokeWidth={1.75}
          />
          <h2 className="mt-5 text-xl font-black uppercase text-white">
            No Announcements
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-400">
            Announcements will appear here after the first one is created.
          </p>
        </section>
      ) : (
        <div
          data-announcements-state="loaded"
          className="mt-8 overflow-x-auto border border-white/10 bg-[#111111]"
        >
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead className="bg-white/[0.025]">
              <tr className="border-b border-white/10">
                {["Title", "Last Updated"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-4 text-[0.65rem] font-black uppercase tracking-[0.16em] text-neutral-500"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr
                  key={announcement.id}
                  className="border-b border-white/10 last:border-b-0"
                >
                  <th
                    scope="row"
                    className="max-w-md px-5 py-5 text-sm font-bold text-white"
                  >
                    {announcement.title}
                    {announcement.is_pinned && (
                      <span className="ml-2 text-[0.6rem] font-black uppercase tracking-[0.12em] text-[#D4A017]">
                        Pinned
                      </span>
                    )}
                  </th>
                  <td className="px-5 py-5 text-sm text-neutral-300">
                    <time dateTime={announcement.updated_at}>
                      {formatAnnouncementDate(announcement.updated_at)}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
