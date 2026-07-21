import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestTournamentNews from "@/components/LatestTournamentNews";
import FeaturedTournament from "@/components/FeaturedTournament";
import WinnersCircle from "@/components/WinnersCircle";
import AOYStandings from "@/components/AOYStandings";
import SafeLightCard from "@/components/SafeLightCard";
import { tournaments } from "@/data/tournaments";
import { getNextRelevantTournament } from "@/lib/tournament-operations";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

export default function HomePage() {
  const tournament = getNextRelevantTournament(tournaments);
  const operations = tournament ? getTournamentOperationsViewModel(tournament) : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header />

      <Hero />

      {/* Tournament operations + Featured Tournament */}
      <section className="border-t border-zinc-900 bg-black">
        <div className="mx-auto max-w-[1700px] px-4 py-10 lg:px-8">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-6">
              <LatestTournamentNews tournament={tournament} />
              {operations ? (
                <SafeLightCard safeLight={operations.safeLight} compact />
              ) : (
                <div className="border border-white/10 bg-[#111111] p-5 text-sm text-neutral-400">
                  Estimated safe light will appear when the next tournament is scheduled.
                </div>
              )}
            </div>

            <FeaturedTournament tournament={tournament ?? null} />
          </div>
        </div>
      </section>

      <WinnersCircle />

      <AOYStandings />
    </main>
  );
}
