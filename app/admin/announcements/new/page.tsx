import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import AnnouncementForm from "@/components/admin/AnnouncementForm";

export const dynamic = "force-dynamic";

export default function NewAnnouncementPage() {
  return (
    <>
      <Link
        href="/admin/announcements"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Announcements
      </Link>

      <div className="mt-8 border-b border-white/10 pb-7">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
          Homepage Content
        </p>

        <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          New Announcement
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
          Create a global news item for the Latest News &amp; Announcements
          section on the public homepage.
        </p>
      </div>

      <AnnouncementForm />
    </>
  );
}