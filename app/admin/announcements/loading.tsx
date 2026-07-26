import { ArrowLeft, Plus } from "lucide-react";

export default function AdminAnnouncementsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading announcements">
      <div className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-600">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Admin Center
      </div>

      <div className="mt-8 flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
            Management
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            News
          </h1>
        </div>
        <span className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#D4A017]/30 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]/50">
          <Plus aria-hidden="true" className="size-4" />
          New Announcement
        </span>
      </div>

      <div className="mt-8 animate-pulse border border-white/10 bg-[#111111]">
        <div className="h-12 border-b border-white/10 bg-white/[0.02]" />
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="grid min-h-20 grid-cols-4 items-center gap-5 border-b border-white/10 px-5 last:border-b-0"
          >
            <span className="h-3 rounded bg-white/10" />
            <span className="h-3 rounded bg-white/10" />
            <span className="h-3 rounded bg-white/10" />
            <span className="h-3 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
