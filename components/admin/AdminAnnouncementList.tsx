"use client";
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  ImageIcon,
  Pencil,
  Pin,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { deleteAnnouncementAction } from "@/app/admin/announcements/actions";
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

function getAnnouncementPreview(announcement: Announcement): string {
  const source = announcement.summary?.trim() || announcement.content.trim();

  if (source.length <= 240) {
    return source;
  }

  return `${source.slice(0, 237).trimEnd()}...`;
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
            Website Content
          </p>

          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Latest News &amp; Announcements
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            These announcements are global website content. They are not tied
            to an individual tournament and should match what visitors see on
            the homepage.
          </p>
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
            Create the first announcement to begin managing homepage news.
          </p>
        </section>
      ) : (
        <section
          data-announcements-state="loaded"
          className="mt-8"
          aria-label="Existing announcements"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
              Existing Homepage Content
            </p>

            <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
              {announcements.length}{" "}
              {announcements.length === 1
                ? "Announcement"
                : "Announcements"}
            </p>
          </div>

          <div className="space-y-5">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="border border-white/10 bg-[#111111] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {announcement.is_pinned && (
                        <span className="inline-flex items-center gap-1.5 border border-[#D4A017]/40 bg-[#D4A017]/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#D4A017]">
                          <Pin aria-hidden="true" className="size-3" />
                          Pinned
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center border px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] ${
                          announcement.is_published
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-white/[0.03] text-neutral-400"
                        }`}
                      >
                        {announcement.is_published ? "Published" : "Unpublished"}
                      </span>

                      {announcement.featured_image_url && (
                        <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-400">
                          <ImageIcon aria-hidden="true" className="size-3" />
                          Featured Image
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-xl font-black uppercase leading-tight text-white sm:text-2xl">
                      {announcement.title}
                    </h2>

                    <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-neutral-300">
                      {getAnnouncementPreview(announcement)}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-neutral-500">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock
                          aria-hidden="true"
                          className="size-4"
                        />
                        Updated{" "}
                        <time dateTime={announcement.updated_at}>
                          {formatAnnouncementDate(
                            announcement.updated_at,
                          )}
                        </time>
                      </span>

                      <span>
                        Publish date:{" "}
                        <span className="text-neutral-400">
                          {announcement.publish_date
                            ? formatAnnouncementDate(announcement.publish_date)
                            : "Not set"}
                        </span>
                      </span>

                      <span>
                        Display order:{" "}
                        <span className="text-neutral-400">
                          {announcement.display_order}
                        </span>
                      </span>
                    </div>

                  
                  </div>

<div className="flex shrink-0 flex-col gap-3 sm:flex-row">
  <Link
    href={`/admin/announcements/${announcement.id}/edit`}
    className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#D4A017] px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition-colors hover:bg-[#e2b22a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
  >
    <Pencil aria-hidden="true" className="size-4" />
    Edit Announcement
  </Link>

  <form
    action={deleteAnnouncementAction.bind(null, announcement.id)}
    onSubmit={(event) => {
      const confirmed = window.confirm(
        `Delete "${announcement.title}"? This cannot be undone.`,
      );

      if (!confirmed) {
        event.preventDefault();
      }
    }}
  >
    <button
      type="submit"
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-red-700 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500"
    >
      <Trash2 aria-hidden="true" className="size-4" />
      Delete
    </button>
  </form>
</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
