"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface TournamentOption {
  id: string;
  label: string;
}

export default function TournamentInformationSelector({
  tournaments,
  selectedTournamentId,
}: {
  tournaments: readonly TournamentOption[];
  selectedTournamentId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
      Select Tournament
      <select
        value={selectedTournamentId}
        disabled={pending}
        onChange={(event) => {
          const tournamentId = event.target.value;
          startTransition(() => {
            router.push(
              `/admin/tournament?tournament=${encodeURIComponent(tournamentId)}`,
            );
          });
        }}
        className="mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-white outline-none transition focus:border-[#D4A017] focus-visible:ring-2 focus-visible:ring-[#D4A017]/40 disabled:cursor-wait disabled:opacity-60"
      >
        {tournaments.map((tournament) => (
          <option key={tournament.id} value={tournament.id}>
            {tournament.label}
          </option>
        ))}
      </select>
    </label>
  );
}
