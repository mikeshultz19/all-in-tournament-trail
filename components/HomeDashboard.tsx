import AOYStandings from "@/components/AOYStandings";
import FeaturedTournament from "@/components/FeaturedTournament";
import TournamentTrailNews from "@/components/LatestTournamentNews";

export default function HomeDashboard() {
  return (
    <section className="bg-black px-4 py-5">
      <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <TournamentTrailNews />
        </div>

        <div className="lg:col-span-4">
          <FeaturedTournament />
        </div>

        <div className="lg:col-span-6">
          <AOYStandings />
        </div>
      </div>
    </section>
  );
}