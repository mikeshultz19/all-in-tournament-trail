import AdminTournamentDashboard from "@/components/admin/AdminTournamentDashboard";
import {
  getRegistrationReviewPendingCount,
  getTournamentRegistrationReviewSummary,
} from "@/lib/registration-identity-review";
import {
  getActiveSeasonSchedule,
  selectActiveOperationalTournament,
} from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";

export const dynamic = "force-dynamic";

export default async function TournamentManagerPage() {
  const now = new Date();
  let tournaments: Tournament[] = [];
  let currentTournament: Tournament | null = null;
  let pendingRegistrationReviews = 0;
  let registrationReviewSummaries: Record<
    string,
    { total: number; verified: number; pending: number; resolved: number }
  > = {};

  try {
    [tournaments, pendingRegistrationReviews] = await Promise.all([
        getActiveSeasonSchedule(),
        getRegistrationReviewPendingCount(),
      ]);
    currentTournament = selectActiveOperationalTournament(tournaments);

    registrationReviewSummaries = Object.fromEntries(
      await Promise.all(
        tournaments.map(async (tournament) => [
          tournament.id,
          await getTournamentRegistrationReviewSummary(tournament.id),
        ]),
      ),
    );
  } catch (error) {
    console.error("Tournament workspace load failed.", error);

    return (
      <section className="border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-xl font-black uppercase text-white">
          Tournament Workspace Unavailable
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
      comparisonDate={now.toISOString()}
      pendingRegistrationReviews={pendingRegistrationReviews}
      registrationReviewSummaries={registrationReviewSummaries}
      showTournamentTools
    />
  );
}
