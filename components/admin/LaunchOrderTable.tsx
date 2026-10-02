"use client";

import { useMemo, useState } from "react";

import type { TournamentRegistrationRosterRow } from "@/lib/tournament-registration-roster";
import { launchFlightLabel } from "@/lib/launch-order";

export default function LaunchOrderTable({ rows }: { rows: TournamentRegistrationRosterRow[] }) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rows;
    return rows.filter((row) => {
      const participants = [row.angler1.displayName, row.angler2?.displayName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return participants.includes(normalizedSearch)
        || row.registrationKey.toLowerCase().includes(normalizedSearch)
        || String(row.boatNumber ?? "").includes(normalizedSearch)
        || String(row.assignedBoatNumber ?? "").includes(normalizedSearch);
    });
  }, [normalizedSearch, rows]);

  return <div className="overflow-hidden">
    <div className="border-b border-white/10 p-4">
      <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => event.preventDefault()}>
        <label className="min-w-64 flex-1 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">
          Find participant, registration number, or boat number
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, registration #, or boat #"
            className="mt-2 block min-h-10 w-full border border-white/15 bg-black/30 px-3 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-neutral-600 focus:border-[#D4A017]"
          />
        </label>
        <button type="submit" className="min-h-10 border border-[#D4A017] px-4 text-[10px] font-black uppercase tracking-[0.1em] text-[#D4A017]">Search</button>
        {search ? <button type="button" onClick={() => setSearch("")} className="min-h-10 border border-white/15 px-4 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-300">Clear</button> : null}
      </form>
      {normalizedSearch ? <p className="mt-2 text-xs text-neutral-500">Showing {filteredRows.length} of {rows.length} assigned boat{rows.length === 1 ? "" : "s"}.</p> : null}
    </div>
    <table className="w-full text-left text-sm"><thead className="border-b border-white/15 bg-black/30 text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400"><tr><th className="px-4 py-3">Reg #</th><th className="px-4 py-3">Participants</th><th className="px-4 py-3">Flight</th><th className="px-4 py-3">Boat #</th><th className="px-4 py-3">Weight</th></tr></thead><tbody className="divide-y divide-white/10">{filteredRows.map((row) => <tr key={row.id}><td className="px-4 py-3 font-black text-[#D4A017]">#{row.boatNumber ?? "—"}</td><td className="px-4 py-3 font-bold text-white">{row.angler1.displayName}{row.angler2 ? ` / ${row.angler2.displayName}` : ""}</td><td className="px-4 py-3 font-bold text-white">{launchFlightLabel(row.assignedBoatNumber as number)}</td><td className="px-4 py-3 text-lg font-black text-white">{row.assignedBoatNumber}</td><td aria-label={`Blank weight for boat ${row.assignedBoatNumber}`} className="h-12 min-w-28 border-l border-white/10 px-4 py-3">&nbsp;</td></tr>)}{!filteredRows.length ? <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">{rows.length ? "No matching boat found." : "No Boat Numbers have been assigned yet."}</td></tr> : null}</tbody></table>
  </div>;
}
