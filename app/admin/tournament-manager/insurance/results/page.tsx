import { redirect } from "next/navigation";

export default async function LegacyInsuranceWinnerEntryPage({ searchParams }: { searchParams: Promise<{ tournament?: string | string[] }> }) {
  const params = await searchParams;
  const tournament = Array.isArray(params.tournament) ? params.tournament[0] : params.tournament;
  redirect(tournament ? `/admin/tournament-manager?tournament=${encodeURIComponent(tournament)}&step=3` : "/admin/tournament-manager?step=3");
}
