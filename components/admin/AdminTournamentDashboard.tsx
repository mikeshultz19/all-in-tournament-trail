"use client";

import { Newspaper } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import CurrentTournamentCard from "@/components/admin/CurrentTournamentCard";
import WebsiteReadiness, {
  type ReadinessChecklistItem,
} from "@/components/admin/WebsiteReadiness";
import {
  getInitialAdminTournament,
  withTournamentContext,
} from "@/lib/admin-tournaments";
import type { Tournament } from "@/types/tournament";

interface AdminTournamentDashboardProps {
  tournaments: readonly Tournament[];
  initialTournamentId?: string;
  comparisonDate: string;
  preTournamentItems: readonly ReadinessChecklistItem[];
  postTournamentItems: readonly ReadinessChecklistItem[];
}

export default function AdminTournamentDashboard({
  tournaments,
  initialTournamentId,
  comparisonDate,
  preTournamentItems,
  postTournamentItems,
}: AdminTournamentDashboardProps) {
  const initialTournament = getInitialAdminTournament(
    tournaments,
    new Date(comparisonDate),
    initialTournamentId,
  );

  const [currentTournament, setCurrentTournament] =
    useState(initialTournament);

  const tournamentId = currentTournament?.id ?? "";

  const contextualPreTournamentItems = useMemo(
    () =>
      preTournamentItems.map((item) => ({
        ...item,
        href: item.href
          ? withTournamentContext(item.href, tournamentId)
          : undefined,
      })),
    [preTournamentItems, tournamentId],
  );

  const contextualPostTournamentItems = useMemo(
    () =>
      postTournamentItems.map((item) => ({
        ...item,
        href: undefined,
      })),
    [postTournamentItems],
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
      <section
        aria-labelledby="announcements-heading"
        className="border border-[#D4A017]/30 bg-[#111111] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center border border-[#D4A017]/40 bg-[#D4A017]/10 text-[#D4A017]">
              <Newspaper
                aria-hidden="true"
                className="size-6"
              />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
                Website Content
              </p>

              <h1
                id="announcements-heading"
                className="mt-1 text-xl font-black uppercase text-white sm:text-2xl"
              >
                Latest News &amp; Announcements
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                Manage the latest news and announcements displayed on the
                public homepage. This content applies to the entire website
                and is separate from individual tournament updates.
              </p>
            </div>
          </div>

          <Link
            href="/admin/announcements"
            className="inline-flex min-h-12 shrink-0 items-center justify-center bg-[#D4A017] px-5 py-3 text-center text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#e2b22a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
          >
            Manage Announcements
          </Link>
        </div>
      </section>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />

        <p className="shrink-0 text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
          Tournament Management
        </p>

        <div className="h-px flex-1 bg-white/10" />
      </div>

      <CurrentTournamentCard
        tournament={currentTournament}
        tournaments={tournaments}
        comparisonDate={comparisonDate}
        onChangeTournament={setCurrentTournament}
      />

      <div className="mt-6 sm:mt-8">
        <WebsiteReadiness
          preTournamentItems={contextualPreTournamentItems}
          postTournamentItems={contextualPostTournamentItems}
        />
      </div>
    </>
  );
}