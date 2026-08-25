"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";

import type { PublicDetailedAoyStanding } from "@/lib/aoy-standings";

export default function AoyStandingsTable({
  standings,
}: {
  standings: PublicDetailedAoyStanding[];
}) {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto border border-[#8f762f]/60 bg-[#111111]">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-[#8f762f]/60 bg-[#171717]">
            {[
              ["Rank", "text-left"],
              ["Team / Angler", "text-left"],
              ["AOY Points", "text-right"],
              ["Events Fished", "text-right"],
              ["Championship Progress", "text-left"],
              ["", "text-right"],
            ].map(([heading, alignment], index) => (
              <th
                key={`${heading}-${index}`}
                scope="col"
                className={`whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-[0.1em] text-[#c9aa4a] ${alignment}`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => {
            const expanded = expandedRecordId === standing.competitiveRecordId;
            const tournamentResults = [
              ...standing.countedResults.map((result) => ({ ...result, dropped: false })),
              ...standing.droppedResults.map((result) => ({ ...result, dropped: true })),
            ].sort((left, right) => left.tournamentNumber - right.tournamentNumber);

            return (
              <Fragment key={standing.competitiveRecordId}>
                <tr className="border-b border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-4 text-sm font-black text-[#c9aa4a]">{standing.place}</td>
                  <td className="px-4 py-4 text-sm font-bold uppercase tracking-wide text-white">{standing.angler}</td>
                  <td className="px-4 py-4 text-right text-sm font-black tabular-nums text-[#c9aa4a]">{standing.points.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-sm tabular-nums text-neutral-300">{standing.events}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-bold uppercase text-neutral-300">
                    {standing.championshipStatus === "qualified" ? "Qualified" : `${standing.qualifyingEvents} of 5`}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setExpandedRecordId(expanded ? null : standing.competitiveRecordId)}
                      className="inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap border border-white/15 px-2.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[#c9aa4a] transition hover:border-[#c9aa4a]/60 hover:text-white"
                    >
                      View Results
                      <ChevronDown aria-hidden="true" className={`size-3.5 transition ${expanded ? "rotate-180" : ""}`} />
                    </button>
                  </td>
                </tr>
                {expanded ? (
                  <tr className="border-b border-[#8f762f]/40 bg-black/35">
                    <td colSpan={6} className="px-4 py-4 sm:px-6">
                      <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-500">Tournament Points</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {tournamentResults.map((result) => (
                          <div key={`${result.tournamentNumber}-${result.tournament}`} className="flex items-center justify-between gap-4 border-b border-white/10 py-2 text-sm">
                            <span className="font-semibold text-white">{result.tournament}</span>
                            <span className="flex items-center gap-2 whitespace-nowrap font-black tabular-nums text-[#c9aa4a]">
                              {result.points}
                              {result.dropped ? <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wide text-neutral-500">Dropped</span> : null}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
