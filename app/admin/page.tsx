import AdminTournamentDashboard from "@/components/admin/AdminTournamentDashboard";
import type { ReadinessChecklistItem } from "@/components/admin/WebsiteReadiness";
import {
  getNextUpcomingTournament,
  getTournaments,
} from "@/lib/tournaments";
import {
  getTournamentLocalDate,
  tournamentDateTimeToUtc,
} from "@/lib/tournament-time";
import type { Tournament } from "@/types/tournament";

const preTournamentItems: ReadinessChecklistItem[] = [
  {
    label: "Tournament Information Updated",
    complete: true,
    href: "/admin/tournament",
  },
  {
    label: "Registration Information Complete",
    complete: true,
    href: "/admin/tournament",
  },
  {
    label: "Announcements Reviewed",
    complete: true,
    href: "/admin/announcements",
  },
  {
    label: "Conditions Updated",
    complete: false,
    href: "/admin/conditions",
  },
];

const postTournamentItems: ReadinessChecklistItem[] = [
  {
    label: "Import WeighFish Results",
    complete: false,
    href: "/admin/results",
  },
  {
    label: "Upload Tournament Winner Photo",
    complete: false,
    href: "/admin/results",
  },
  {
    label: "Upload Big Bass Winner Photo",
    complete: false,
    href: "/admin/results",
  },
  {
    label: "Publish Tournament Results",
    complete: false,
    href: "/admin/results",
  },
];

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const now = new Date();
  const comparisonDate = tournamentDateTimeToUtc(
    getTournamentLocalDate(now),
    "00:00",
  ).toISOString();
  let tournaments: Tournament[] = [];
  let currentTournament: Tournament | null = null;
  let loadFailed = false;

  try {
    [tournaments, currentTournament] = await Promise.all([
      getTournaments(),
      getNextUpcomingTournament(),
    ]);
  } catch (error) {
    console.error("Admin dashboard tournament load failed.", error);
    loadFailed = true;
  }

  if (loadFailed) {
    return (
      <section className="border border-[#D4A017]/40 bg-[#D4A017]/10 p-6">
        <h1 className="text-xl font-black uppercase text-white">
          Tournament Information Unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          We could not load tournament information. Please try again.
        </p>
      </section>
    );
  }

  return (
    <AdminTournamentDashboard
      tournaments={tournaments}
      initialTournamentId={currentTournament?.id}
      comparisonDate={comparisonDate}
      preTournamentItems={preTournamentItems}
      postTournamentItems={postTournamentItems}
    />
  );
}
