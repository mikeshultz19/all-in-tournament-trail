import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestTournamentNews from "@/components/LatestTournamentNews";
import FeaturedTournament from "@/components/FeaturedTournament";
import WinnersCircle from "@/components/WinnersCircle";
import AOYStandings from "@/components/AOYStandings";
import TournamentConditions from "@/components/TournamentConditions";
import SponsorHome from "@/components/SponsorHome";
import { getHomepageSponsors } from "@/data/sponsors";
import { getAnnouncements } from "@/lib/news";
import { getPublicEarlyEntriesForTournament } from "@/lib/tournament-registrations";
import { getFeaturedTournament } from "@/lib/tournaments";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";
import { getAccuWeatherTournamentForecast } from "@/lib/accuweather";
import { getTournamentEntrySummary, type TournamentEntrySummary } from "@/lib/public-early-entry";
import type { Announcement } from "@/types/announcement";
import { getLatestPublishedTournamentResults } from "@/lib/results";
import type { LatestTournamentResults } from "@/types/results";

export const revalidate = 10800;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featuredTournamentDb = null;
  let featuredTournament = null;

  try {
    featuredTournamentDb = await getFeaturedTournament();
    featuredTournament = featuredTournamentDb
      ? toPublicTournament(featuredTournamentDb)
      : null;
  } catch (error) {
    console.error("Homepage featured tournament load failed.", error);
  }

  const operations = featuredTournament ? getTournamentOperationsViewModel(featuredTournament) : null;
  let earlyRegistrationStatsUnavailable = false;
  let earlyRegistrationSummary: TournamentEntrySummary = getTournamentEntrySummary([]);

  if (featuredTournamentDb) {
    try {
      earlyRegistrationSummary = getTournamentEntrySummary(
        await getPublicEarlyEntriesForTournament(featuredTournamentDb.id),
      );
    } catch {
      earlyRegistrationStatsUnavailable = true;
    }
  }
  const weather = featuredTournament && operations
    ? await getAccuWeatherTournamentForecast({
        tournamentDate: operations.effectiveDate,
        locationKey: featuredTournament.accuWeatherLocationKey,
      })
    : null;
  const homepageSponsors = getHomepageSponsors();
  let announcements: Announcement[] = [];
  let latestResults: LatestTournamentResults | null = null;

  try {
    announcements = await getAnnouncements();
  } catch (error) {
    console.error("Homepage announcements load failed.", error);
  }

  try {
    latestResults = await getLatestPublishedTournamentResults();
  } catch (error) {
    console.error("Homepage results load failed.", error);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header />

      <Hero />

      {/* Homepage information + Featured Tournament */}
      <section id="tournament-grid" className="border-t border-zinc-900 bg-black">
        <div className="mx-auto w-full max-w-[1700px] px-4 py-10 lg:px-8">
          <div data-homepage-tournament-grid className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <div data-tournament-column="right" className="min-w-0 lg:col-start-2 lg:row-start-1">
              <FeaturedTournament
                tournament={featuredTournament ?? null}
                lifecycleStatus={featuredTournament?.lifecycleStatus}
                operations={operations}
                earlyRegistrationSummary={earlyRegistrationSummary}
                earlyRegistrationStatsUnavailable={earlyRegistrationStatsUnavailable}
              />
            </div>

            <div data-tournament-column="left" className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1">
              <LatestTournamentNews
                tournament={featuredTournament ?? undefined}
                announcements={announcements}
              />
              <SponsorHome sponsors={homepageSponsors} />
              <div className="min-w-0">
                {featuredTournament && operations && weather ? (
                  <TournamentConditions tournament={featuredTournament} safeLight={operations.safeLight} weather={weather} />
                ) : (
                  <div className="border border-white/10 bg-[#111111] p-5 text-sm text-neutral-400">
                    Estimated safe light will appear when the next tournament is scheduled.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WinnersCircle latestResults={latestResults} />

      <AOYStandings />
    </main>
  );
}
