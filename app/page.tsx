import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestTournamentNews from "@/components/LatestTournamentNews";
import FeaturedTournament from "@/components/FeaturedTournament";
import WinnersCircle from "@/components/WinnersCircle";
import AOYStandings from "@/components/AOYStandings";
import TournamentConditions from "@/components/TournamentConditions";
import SponsorHome from "@/components/SponsorHome";
import EarlyRegistrationStats from "@/components/EarlyRegistrationStats";
import { getHomepageSponsors } from "@/data/sponsors";
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
  const homepageSponsors = getHomepageSponsors();

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header />

      <Hero />

      {/* Tournament operations + Featured Tournament */}
      <section id="tournament-grid" className="border-t border-zinc-900 bg-black">
        <div className="mx-auto w-full max-w-[1700px] px-4 py-10 lg:px-8">
          <div data-homepage-tournament-grid className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <div data-tournament-column="left" className="contents lg:flex lg:flex-col lg:gap-6">
              <div className="order-2 min-w-0 lg:order-none">
                {tournament && operations && weather ? (
                  <TournamentConditions tournament={tournament} safeLight={operations.safeLight} weather={weather} />
                ) : (
                  <div className="border border-white/10 bg-[#111111] p-5 text-sm text-neutral-400">
                    Estimated safe light will appear when the next tournament is scheduled.
                  </div>
                )}
              </div>
              <div className="order-4 min-w-0 lg:order-none lg:flex-1">
                <SponsorHome sponsors={homepageSponsors} />
              </div>
            </div>

            <div data-tournament-column="right" className="contents lg:flex lg:flex-col lg:gap-6">
              <div className="order-1 min-w-0 lg:order-none">
                <FeaturedTournament
                  tournament={tournament ?? null}
                  operations={operations}
                />
              </div>
              <div className="order-3 min-w-0 border border-[#4A3A12] bg-[#0d0d0d] p-4 lg:order-none">
                <EarlyRegistrationStats {...earlyRegistrationSummary} unavailable={earlyRegistrationStatsUnavailable} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <LatestTournamentNews tournament={tournament} />

      <WinnersCircle />

      <AOYStandings />
    </main>
  );
}
