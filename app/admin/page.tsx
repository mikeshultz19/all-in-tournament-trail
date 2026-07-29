import AdminTournamentDashboard from "@/components/admin/AdminTournamentDashboard";
import {
  getNextUpcomingTournament,
  getActiveSeasonSchedule,
} from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";
import {
  getRegistrationReviewPendingCount,
  getTournamentRegistrationReviewSummary,
} from "@/lib/registration-identity-review";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedTournament = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;
  const now = new Date();
  let tournaments: Tournament[] = [];
  let currentTournament: Tournament | null = null;
  let loadFailed = false;
  let pendingRegistrationReviews = 0;
  let registrationReviewSummaries: Record<
    string,
    { total: number; verified: number; pending: number; resolved: number }
  > = {};

  try {
    [tournaments, currentTournament, pendingRegistrationReviews] = await Promise.all([
      getActiveSeasonSchedule(),
      getNextUpcomingTournament(),
      getRegistrationReviewPendingCount(),
    ]);
    registrationReviewSummaries = Object.fromEntries(
      await Promise.all(
        tournaments.map(async (tournament) => [
          tournament.id,
          await getTournamentRegistrationReviewSummary(tournament.id),
        ]),
      ),
    );
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
      initialTournamentId={
        tournaments.find(
          (tournament) =>
            tournament.id === requestedTournament ||
            tournament.slug === requestedTournament,
        )?.id ?? currentTournament?.id
      }
      comparisonDate={now.toISOString()}
      pendingRegistrationReviews={pendingRegistrationReviews}
      registrationReviewSummaries={registrationReviewSummaries}
    />
  );
}
