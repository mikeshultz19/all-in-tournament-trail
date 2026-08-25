"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { rebuildTournamentAoyAction } from "@/app/admin/results/aoy-actions";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import type { AoyStanding } from "@/types/aoy-engine";
import type { ChampionshipQualification } from "@/types/championship-qualification";

export default function AoyCalculationPanel({
  tournamentId,
  available,
  standings,
  qualifications,
}: {
  tournamentId: string;
  available: boolean;
  standings: AoyStanding[];
  qualifications: ChampionshipQualification[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const qualificationByRecord = new Map(
    qualifications.map((item) => [item.competitiveRecordId, item]),
  );

  function calculate() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await rebuildTournamentAoyAction(tournamentId);
        setMessage(result.message);
        router.refresh();
      } catch (error) {
        console.error("AOY calculation failed.", error);
        setMessage(
          error instanceof Error
            ? error.message
            : "AOY calculation could not be completed.",
        );
      }
    });
  }

  if (!available) {
    return (
      <p className="max-w-3xl border-y border-white/10 py-4 text-sm text-neutral-400">
        Publish Official Results before calculating AOY.
      </p>
    );
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={calculate}
          disabled={pending}
          className={adminButtonStyles("primary", "min-h-11 disabled:opacity-50")}
        >
          {pending ? "Calculating AOY…" : standings.length ? "Recalculate AOY" : "Calculate AOY"}
        </button>
        <Link href="/standings" className={adminButtonStyles("secondary", "min-h-11")}>
          View Public Standings
        </Link>
      </div>

      {message ? <p role="status" className="text-sm text-[#d0ae4c]">{message}</p> : null}

      {standings.length ? (
        <div className="overflow-x-auto border border-white/10">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-black/40 text-xs font-black uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-3 py-3 text-left">Rank</th>
                <th className="px-3 py-3 text-left">Competitive Record</th>
                <th className="px-3 py-3 text-right">Events</th>
                <th className="px-3 py-3 text-right">AOY Points</th>
                <th className="px-3 py-3 text-left">Best Five / Dropped</th>
                <th className="px-3 py-3 text-left">Championship</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => {
                const qualification = qualificationByRecord.get(standing.competitiveRecordId);
                return (
                  <tr key={standing.competitiveRecordId} className="border-t border-white/10">
                    <td className="px-3 py-3 font-black text-[#c9aa4a]">{standing.rank}</td>
                    <td className="px-3 py-3 font-bold text-white">{standing.displayName}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-neutral-300">{standing.officialParticipationCount}</td>
                    <td className="px-3 py-3 text-right font-black tabular-nums text-[#c9aa4a]">{standing.totalCountedPoints}</td>
                    <td className="px-3 py-3 text-xs text-neutral-300">
                      Counted: {standing.countedPerformances.map((item) => `T${item.regularSeasonNumber} ${item.points}`).join(", ") || "—"}
                      <span className="mt-1 block text-neutral-500">Dropped: {standing.droppedPerformances.map((item) => `T${item.regularSeasonNumber} ${item.points}`).join(", ") || "—"}</span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold uppercase text-neutral-300">
                      {qualification?.qualificationStatus === "qualified"
                        ? "Qualified"
                        : `${qualification?.officialParticipations ?? 0} of 5`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border-y border-white/10 py-4 text-sm text-neutral-400">
          Official Results are ready. Run Calculate AOY to create the season projection.
        </p>
      )}
    </div>
  );
}
