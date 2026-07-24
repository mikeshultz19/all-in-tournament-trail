"use client";

import { CalendarDays, CloudSun, Megaphone, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import CurrentTournamentCard from "@/components/admin/CurrentTournamentCard";
import ManagementCard from "@/components/admin/ManagementCard";
import WebsiteReadiness, {
  type ReadinessChecklistItem,
} from "@/components/admin/WebsiteReadiness";
import {
  formatAdminTournamentDate,
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

const staticCardDetails = {
  announcements: {
    title: "News & Announcements",
    description: "Create, edit, hide and remove homepage announcements.",
    icon: Megaphone,
    statusItems: [
      { label: "Active Announcements", value: "3" },
      { label: "Next Expiration", value: "August 15, 2026" },
      { label: "Status", value: "Reviewed" },
    ],
    lastUpdatedDate: "2026-07-22T18:14:00-05:00",
    lastUpdatedBy: "AITT Staff",
  },
  conditions: {
    title: "Tournament Conditions",
    description: "Update Safe Light and the optional tournament message.",
    icon: CloudSun,
    statusItems: [
      { label: "Safe Light", value: "6:18 AM" },
      {
        label: "Tournament Message",
        value: "Not Entered",
        needsAttention: true,
      },
      { label: "Status", value: "Needs Attention", needsAttention: true },
    ],
    lastUpdatedDate: "2026-07-20T12:00:00-05:00",
    lastUpdatedBy: "AITT Staff",
  },
} as const;

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
  const [currentTournament, setCurrentTournament] = useState(initialTournament);

  const contextualPreTournamentItems = useMemo(
    () =>
      preTournamentItems.map((item) => ({
        ...item,
        href: item.href
          ? withTournamentContext(item.href, currentTournament?.id ?? "")
          : undefined,
      })),
    [currentTournament?.id, preTournamentItems],
  );
  const contextualPostTournamentItems = useMemo(
    () =>
      postTournamentItems.map((item) => ({
        ...item,
        href: item.href
          ? withTournamentContext(item.href, currentTournament?.id ?? "")
          : undefined,
      })),
    [currentTournament?.id, postTournamentItems],
  );

  if (!currentTournament) {
    return (
      <p className="border border-[#D4A017]/40 bg-[#D4A017]/10 p-5 text-sm text-neutral-200">
        No tournaments are available to manage.
      </p>
    );
  }

  const tournamentId = currentTournament.id;
  const managementSections = [
    {
      title: "Tournament Information",
      description:
        "Manage the featured tournament information shown on the homepage and tournament schedule.",
      href: withTournamentContext("/admin/tournament", tournamentId),
      icon: CalendarDays,
      statusItems: [
        { label: "Featured Tournament", value: currentTournament.name },
        {
          label: "Tournament Date",
          value: formatAdminTournamentDate(currentTournament.tournament_date),
        },
        { label: "Status", value: currentTournament.status },
      ],
      lastUpdatedDate: currentTournament.updated_at,
      lastUpdatedBy: currentTournament.updated_by ?? "AITT Staff",
    },
    {
      ...staticCardDetails.announcements,
      href: withTournamentContext("/admin/announcements", tournamentId),
    },
    {
      ...staticCardDetails.conditions,
      href: withTournamentContext("/admin/conditions", tournamentId),
    },
    {
      title: "Tournament Results",
      description:
        "Import WeighFish results, upload winner photos, review the standings and publish the official tournament results.",
      href: withTournamentContext("/admin/results", tournamentId),
      icon: Trophy,
      statusItems: [
        { label: "Current Tournament", value: currentTournament.name },
        {
          label: "Publication Status",
          value:
            currentTournament.status === "Results Published"
              ? "Published"
              : "Not Published",
          needsAttention: currentTournament.status !== "Results Published",
        },
        {
          label: "Status",
          value:
            currentTournament.status === "Results Published"
              ? "Complete"
              : "Needs Attention",
          needsAttention: currentTournament.status !== "Results Published",
        },
      ],
      lastUpdatedDate: null,
      lastUpdatedBy: null,
    },
  ] as const;

  return (
    <>
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

      <nav
        aria-label="Admin management sections"
        className="mt-6 grid gap-5 sm:mt-8 md:grid-cols-2"
      >
        {managementSections.map((section) => (
          <ManagementCard key={section.href} {...section} />
        ))}
      </nav>
    </>
  );
}
