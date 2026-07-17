import FeaturedTournament from "@/components/FeaturedTournament";
import TournamentTrailNews from "@/components/TournamentTrailNews";

export default function HomeHighlights() {
  return (
    <section className="bg-black px-4 py-7">
      <div className="mx-auto grid max-w-[1300px] items-stretch gap-5 lg:grid-cols-2">
        <TournamentTrailNews />
        <FeaturedTournament />
      </div>
    </section>
  );
}