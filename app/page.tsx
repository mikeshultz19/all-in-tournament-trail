import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestTournamentNews from "@/components/LatestTournamentNews";
import FeaturedTournament from "@/components/FeaturedTournament";
import WinnersCircle from "@/components/WinnersCircle";
import AOYStandings from "@/components/AOYStandings";
import TournamentConditions from "@/components/TournamentConditions";
import { tournaments } from "@/data/tournaments";
import { getNextRelevantTournament } from "@/lib/tournament-operations";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";
import { getAccuWeatherTournamentForecast } from "@/lib/accuweather";
import { getPublicEarlyEntries } from "@/data/early-registrations";
import { getTournamentEntrySummary, type TournamentEntrySummary } from "@/lib/public-early-entry";

export const revalidate = 10800;

export default async function HomePage() {
  const tournament = getNextRelevantTournament(tournaments);
  const operations = tournament ? getTournamentOperationsViewModel(tournament) : null;
  let earlyRegistrationStatsUnavailable = false;
  let earlyRegistrationSummary: TournamentEntrySummary = getTournamentEntrySummary([]);

  if (tournament) {
    try {
      earlyRegistrationSummary = getTournamentEntrySummary(getPublicEarlyEntries(tournament.slug));
    } catch {
      earlyRegistrationStatsUnavailable = true;
    }
  }
  const weather = tournament && operations
    ? await getAccuWeatherTournamentForecast({
        tournamentDate: operations.effectiveDate,
        locationKey: tournament.accuWeatherLocationKey,
      })
    : null;

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
              {tournament && operations && weather ? (
                <TournamentConditions tournament={tournament} safeLight={operations.safeLight} weather={weather} />
              ) : (
                <div className="border border-white/10 bg-[#111111] p-5 text-sm text-neutral-400">
                  Estimated safe light will appear when the next tournament is scheduled.
                </div>
              )}
            </div>

            <FeaturedTournament
              tournament={tournament ?? null}
              operations={operations}
              earlyRegistrationSummary={earlyRegistrationSummary}
              earlyRegistrationStatsUnavailable={earlyRegistrationStatsUnavailable}
            />
          </div>
        </div>
      </section>

      <WinnersCircle />

      <AOYStandings />
    </main>
  );
}
