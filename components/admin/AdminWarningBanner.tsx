import { TriangleAlert } from "lucide-react";

export const ADMIN_WARNING_MESSAGE =
  "Changes made here update the live AITT website. Proofread all text, dates, times, names, weights and dollar amounts before selecting Save Changes.";

export default function AdminWarningBanner() {
  return (
    <aside
      aria-label="Important publishing warning"
      className="border border-[#D4A017]/50 bg-[#D4A017]/10 p-4 sm:p-5"
    >
      <div className="flex gap-3 sm:items-center">
        <TriangleAlert
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-[#D4A017] sm:mt-0"
          strokeWidth={2}
        />
        <p className="text-sm font-semibold leading-6 text-[#F2F2F2]">
          {ADMIN_WARNING_MESSAGE}
        </p>
      </div>
    </aside>
  );
}
