"use client";

import {
  formatAdminLastUpdated,
  getAdminUpdateStatus,
  type AdminUpdateStatus,
} from "@/lib/admin-last-updated";

interface AdminLastUpdatedProps {
  lastUpdatedDate: string | Date | null;
  lastUpdatedBy?: string | null;
}

const statusStyles: Record<AdminUpdateStatus, string> = {
  recent: "bg-emerald-500",
  aging: "bg-[#D4A017]",
  old: "bg-red-500",
  never: "bg-neutral-600",
};

const statusLabels: Record<AdminUpdateStatus, string> = {
  recent: "Recent update",
  aging: "Aging update",
  old: "Old update",
  never: "Never updated",
};

export default function AdminLastUpdated({
  lastUpdatedDate,
  lastUpdatedBy,
}: AdminLastUpdatedProps) {
  const formattedDate = formatAdminLastUpdated(lastUpdatedDate);
  const status = getAdminUpdateStatus(lastUpdatedDate);
  const showAdministrator = formattedDate !== "Never" && lastUpdatedBy;

  return (
    <div className="mt-auto border-t border-white/10 pt-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`size-1.5 shrink-0 rounded-full ${statusStyles[status]}`}
        />
        <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-neutral-500">
          Last Updated
          <span className="sr-only"> — {statusLabels[status]}</span>
        </p>
      </div>
      <p
        suppressHydrationWarning
        className="mt-2 text-sm font-semibold text-neutral-300"
      >
        {formattedDate}
      </p>
      {showAdministrator && (
        <p className="mt-0.5 text-xs text-neutral-500">by {lastUpdatedBy}</p>
      )}
    </div>
  );
}
