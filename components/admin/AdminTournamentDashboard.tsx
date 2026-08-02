"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
  showTournamentTools?: boolean;
}

export default function AdminTournamentDashboard({
  tournaments,
  initialTournamentId,
  comparisonDate,
  showTournamentTools = false,
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

      <div className="mt-6 space-y-4">
        {operationSteps.map((step) => (
          <TournamentOperationCard key={step.number} step={step} />
        ))}
      </div>

      {showTournamentTools && (
        <section className="mt-6" aria-labelledby="tournament-tools-heading">
          <h2
            id="tournament-tools-heading"
            className="text-xl font-black uppercase text-white"
          >
            Tournament Closeout Tools
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Tournament Information", `/admin/tournament?tournament=${encodeURIComponent(currentTournament.slug || currentTournament.id)}`],
              ["Tournament Conditions", "/admin/conditions"],
              ["Tournament Results", "/admin/results"],
              ["Import WeighFish", `/admin/tournament-manager/import?tournament=${encodeURIComponent(currentTournament.slug || currentTournament.id)}`],
              ["Insurance Pot Calculator", `/admin/tournament-manager/insurance?tournament=${encodeURIComponent(currentTournament.slug || currentTournament.id)}`],
              ["Publish Insurance Pot Results", `/admin/tournament-manager/insurance/results?tournament=${encodeURIComponent(currentTournament.slug || currentTournament.id)}`],
              ["Winner Photos", `/admin/tournament-manager/photos?tournament=${encodeURIComponent(currentTournament.slug || currentTournament.id)}`],
              ["Publish Tournament", `/admin/tournament-manager/publish?tournament=${encodeURIComponent(currentTournament.slug || currentTournament.id)}`],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="flex min-h-12 items-center border border-white/10 bg-[#111111] px-5 text-sm font-black uppercase text-white hover:border-[#D4A017] hover:text-[#D4A017]"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
