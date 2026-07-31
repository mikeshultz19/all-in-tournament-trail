import AdminHomeOverview from "@/components/admin/AdminHomeOverview";
import {
  getNextUpcomingTournament,
} from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";
import {
  getRegistrationReviewDashboardSummary,
} from "@/lib/registration-identity-review";
import type { RegistrationReviewDashboardSummary } from "@/lib/registration-identity-review";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const now = new Date();
  let currentTournament: Tournament | null = null;
  let loadFailed = false;
  let registrationReviewSummary: RegistrationReviewDashboardSummary = {
    pendingReviewCount: 0,
    duplicateCount: 0,
    membershipMatchCount: 0,
  };

  try {
    const [tournament, reviewSummary] = await Promise.all([
      getNextUpcomingTournament(),
      getRegistrationReviewDashboardSummary(),
    ]);
    currentTournament = tournament;
    registrationReviewSummary = reviewSummary;
  } catch (error) {
    console.error("Admin home overview load failed.", error);
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

  if (!currentTournament) {
    return (
      <p className="border border-white/10 bg-[#111111] p-5 text-sm text-neutral-300">
        No tournaments are available to manage.
      </p>
    );
  }

  return (
    <AdminHomeOverview
      tournament={currentTournament}
      comparisonDate={now.toISOString()}
      registrationReviewSummary={registrationReviewSummary}
    />
  );
}
