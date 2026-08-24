"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Tournament } from "@/types/tournament";

export default function MembersTournamentFilter({
  tournaments,
  selectedTournamentId,
}: {
  tournaments: readonly Tournament[];
  selectedTournamentId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateTournament(nextTournamentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextTournamentId) params.set("tournament", nextTournamentId);
    else params.delete("tournament");
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">
        Tournament Filter
      </span>
      <select
        value={selectedTournamentId}
        onChange={(event) => updateTournament(event.target.value)}
        className="mt-2 min-h-11 w-full border border-white/15 bg-[#111111] px-3 text-sm text-white outline-none transition-colors focus:border-[#D4A017]"
      >
        <option value="">All Members</option>
        {tournaments.map((tournament) => (
          <option key={tournament.id} value={tournament.id}>
            {tournament.name}
          </option>
        ))}
      </select>
    </label>
  );
}
