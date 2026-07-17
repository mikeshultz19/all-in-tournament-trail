import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestTournamentNews from "@/components/LatestTournamentNews";
import FeaturedTournament from "@/components/FeaturedTournament";
import WinnersCircle from "@/components/WinnersCircle";
import AOYStandings from "@/components/AOYStandings";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header />

      <Hero />

      {/* Latest Tournament News + Featured Tournament */}
      <section className="border-t border-zinc-900 bg-black">
        <div className="mx-auto max-w-[1700px] px-4 py-10 lg:px-8">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <LatestTournamentNews />

            <FeaturedTournament />
          </div>
        </div>
      </section>

      <WinnersCircle />

      <AOYStandings />
    </main>
  );
}