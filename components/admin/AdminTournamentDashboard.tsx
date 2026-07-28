"use client";

import { useMemo, useState } from "react";

import CurrentTournamentCard from "@/components/admin/CurrentTournamentCard";
import TournamentOperationCard from "@/components/admin/TournamentOperationCard";
import TournamentProgress from "@/components/admin/TournamentProgress";
import {
  getInitialAdminTournament,
} from "@/lib/admin-tournaments";
import { getTournamentOperationSteps } from "@/lib/admin-tournament-operations";
import type { Tournament } from "@/types/tournament";

interface AdminTournamentDashboardProps {
  tournaments: readonly Tournament[];
  initialTournamentId?: string;
  comparisonDate: string;
}

export default function AdminTournamentDashboard({
  tournaments,
  initialTournamentId,
  comparisonDate,
}: AdminTournamentDashboardProps) {
  const initialTournament = getInitialAdminTournament(
    tournaments,
    new Date(comparisonDate),
    initialTournamentId,
  );

  const [currentTournament, setCurrentTournament] =
    useState(initialTournament);

  const operationSteps = useMemo(
    () =>
      currentTournament
        ? getTournamentOperationSteps(
            currentTournament,
            new Date(comparisonDate),
          )
        : [],
    [comparisonDate, currentTournament],
  );

  if (!currentTournament) {
    return (
      <p className="border border-[#D4A017]/40 bg-[#D4A017]/10 p-5 text-sm text-neutral-200">
        No tournaments are available to manage.
      </p>
    );
  }

  return (
    <>
      <CurrentTournamentCard
        tournament={currentTournament}
        tournaments={tournaments}
        comparisonDate={comparisonDate}
        onChangeTournament={setCurrentTournament}
      />

      <TournamentProgress steps={operationSteps} />

      <div className="mt-8 space-y-5">
        {operationSteps.map((step) => (
          <TournamentOperationCard key={step.number} step={step} />
        ))}
      </div>
    </>
  );
}
