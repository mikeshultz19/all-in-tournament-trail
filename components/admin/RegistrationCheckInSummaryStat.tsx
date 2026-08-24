"use client";

import { useRouter } from "next/navigation";

type RosterFilter = "all" | "needs_review" | "walk_ups" | "check_ins";

export default function RegistrationCheckInSummaryStat({
  tournamentId,
  filter,
  search,
  pageSize,
  count,
}: {
  tournamentId: string;
  filter: RosterFilter;
  search: string;
  pageSize: 25 | 50 | 100;
  count: number;
}) {
  const router = useRouter();

  function selectCheckIns() {
    const params = new URLSearchParams({ tournament: tournamentId, filter: "check_ins" });
    if (search.trim()) params.set("search", search.trim());
    if (pageSize !== 25) params.set("pageSize", String(pageSize));
    router.replace(`/admin/registration-review?${params.toString()}`, { scroll: false });
  }

  return (
    <button
      type="button"
      onClick={selectCheckIns}
      aria-pressed={filter === "check_ins"}
      className="text-left"
    >
      <span className="block text-[10px] uppercase text-neutral-500">CHECK-INS</span>
      <span className="mt-1 block font-black tabular-nums text-white">{count}</span>
    </button>
  );
}
