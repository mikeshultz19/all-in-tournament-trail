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
  pendingRegistrationReviews?: number;
  registrationReviewSummaries?: Record<
    string,
    { total: number; verified: number; pending: number; resolved: number }
  >;
}

export default function AdminTournamentDashboard({
  tournaments,
  initialTournamentId,
  comparisonDate,
  pendingRegistrationReviews = 0,
  registrationReviewSummaries = {},
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
      <Link
        href="/admin/registration-review"
        className="mb-6 flex items-center justify-between border border-[#D4A017]/30 bg-[#D4A017]/5 px-5 py-4 transition hover:border-[#D4A017]/60"
      >
        <span className="font-black uppercase text-white">
          Registration Review
        </span>
        <span className="text-sm font-black uppercase text-[#D4A017]">
          Pending: {pendingRegistrationReviews}
        </span>
      </Link>

      <CurrentTournamentCard
        tournament={currentTournament}
        tournaments={tournaments}
        comparisonDate={comparisonDate}
        onChangeTournament={setCurrentTournament}
      />

      <TournamentProgress steps={operationSteps} />

      {registrationReviewSummaries[currentTournament.id] && (
        <section className="mt-6 border border-white/10 bg-[#111] p-5">
          <h2 className="text-sm font-black uppercase text-white">
            Registration Identity Review
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {[
              ["Completed", registrationReviewSummaries[currentTournament.id].total],
              ["Verified", registrationReviewSummaries[currentTournament.id].verified],
              ["Pending", registrationReviewSummaries[currentTournament.id].pending],
              ["Resolved", registrationReviewSummaries[currentTournament.id].resolved],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <p className="text-xs font-bold uppercase text-neutral-500">{label}</p>
                <p className="mt-1 text-xl font-black text-[#D4A017]">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 space-y-5">
        {operationSteps.map((step) => (
          <TournamentOperationCard key={step.number} step={step} />
        ))}
      </div>
    </>
  );
}
