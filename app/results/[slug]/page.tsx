import Header from "@/components/Header";
import WinnersCircle from "@/components/WinnersCircle";
import InsurancePotWinnersSection from "@/components/InsurancePotWinnersSection";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";
import { getTournamentInsurancePotResult } from "@/lib/insurance-pot-results";
import { getTournamentResults } from "@/lib/results";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import type { LatestTournamentResults } from "@/types/results";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface TournamentDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TournamentDetailsPage({
  params,
}: TournamentDetailsPageProps) {
  const { slug } = await params;
  const identifier = decodeURIComponent(slug);

  const tournament = await getTournamentByIdentifier(identifier);

  if (!tournament || tournament.status !== "Results Published") {
    notFound();
  }

  const results = await getTournamentResults(tournament.id);

  if (!results) {
    notFound();
  }
  const insurancePotResult = await getTournamentInsurancePotResult(tournament.id, true);

  const latestResults: LatestTournamentResults = {
    tournament,
    results,
    tournamentImage: tournament.hero_image_url ?? null,
    championImage:
      results.champion_image_url ??
      "/images/results/overall-winner.jpg",
    bigBassImage:
      results.big_bass_image_url ??
      "/images/results/big-bass.jpg",
    completeResultsUrl: `/results/${encodeURIComponent(identifier)}`,
    insurancePotResult,
    insurancePotWinnersUrl: `/results/${encodeURIComponent(identifier)}#insurance-pot-winners`,
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <WinnersCircle latestResults={latestResults} />
      <div className={`${PUBLIC_PAGE_CONTAINER} pb-14`}>
        <InsurancePotWinnersSection result={insurancePotResult} />
      </div>
    </main>
  );
}
