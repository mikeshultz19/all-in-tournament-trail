import Header from "@/components/Header";
import WinnersCircle from "@/components/WinnersCircle";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import { getTournamentResults } from "@/lib/results";
import type { LatestTournamentResults } from "@/types/results";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface TournamentDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TournamentDetailsPage({
  params,
}: TournamentDetailsPageProps) {
  const { slug } = await params;
  const tournament = await getTournamentByIdentifier(slug);

  if (!tournament) {
    notFound();
  }

  const results = await getTournamentResults(tournament.id);

  if (!results) {
    notFound();
  }

  const latestResults: LatestTournamentResults = {
    tournament,
    results,
    tournamentImage: tournament.hero_image_url,
    championImage:
      results.champion_image_url ?? "/images/results/overall-winner.jpg",
    bigBassImage: results.big_bass_image_url ?? "/images/results/big-bass.jpg",
    completeResultsUrl: "/results",
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <WinnersCircle latestResults={latestResults} />
    </main>
  );
}
