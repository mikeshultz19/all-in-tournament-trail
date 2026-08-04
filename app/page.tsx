import Link from "next/link";
import { RadioTower } from "lucide-react";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestTournamentNews from "@/components/LatestTournamentNews";
import FeaturedTournament from "@/components/FeaturedTournament";
import WinnersCircle from "@/components/WinnersCircle";
import AOYPointsRaceStrip from "@/components/AOYPointsRaceStrip";
import TournamentConditions from "@/components/TournamentConditions";
import SponsorHome from "@/components/SponsorHome";
import { getHomepageSponsors } from "@/data/sponsors";
import { getPublishedAnnouncements } from "@/lib/news";
import { getPublicEarlyEntriesForTournament } from "@/lib/tournament-registrations";
import { getNextUpcomingTournament } from "@/lib/tournaments";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";
import { getOpenMeteoTournamentForecast } from "@/lib/open-meteo";
import { getTournamentEntrySummary, type TournamentEntrySummary } from "@/lib/public-early-entry";
import type { Announcement } from "@/types/announcement";
import { getLatestPublishedTournamentResults } from "@/lib/results";
import type { LatestTournamentResults } from "@/types/results";
import {
  getHomepageAoyStandings,
  type PublicAoyStanding,
} from "@/lib/aoy-standings";
import RegistrationInterest from "@/components/RegistrationInterest";
import AnalyticsSectionView from "@/components/AnalyticsSectionView";

export const revalidate = 10800;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featuredTournamentDb = null;
  let featuredTournament = null;

  try {
    featuredTournamentDb = await getNextUpcomingTournament();
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
    ? await getOpenMeteoTournamentForecast({
        latitude: featuredTournament.weatherLatitude,
        longitude: featuredTournament.weatherLongitude,
      })
    : null;
  const homepageSponsors = getHomepageSponsors();
  let announcements: Announcement[] = [];
  let latestResults: LatestTournamentResults | null = null;
  let aoyStandings: PublicAoyStanding[] = [];
  let aoyStandingsUnavailable = false;

  try {
    announcements = await getPublishedAnnouncements();
  } catch (error) {
    console.error("Homepage announcements load failed.", error);
  }

  try {
    latestResults = await getLatestPublishedTournamentResults();
  } catch (error) {
    console.error("Homepage results load failed.", error);
  }

  const aoyResult = await getHomepageAoyStandings();
  aoyStandings = aoyResult.standings;
  aoyStandingsUnavailable = aoyResult.status === "unavailable";

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header />

      <Hero />

      {/* Homepage information + Featured Tournament */}
      <section id="tournament-grid" className="border-t border-zinc-900 bg-black">
        <div className="mx-auto w-full max-w-[1700px] px-4 pb-6 pt-3 sm:pb-8 sm:pt-4 lg:px-8">
          <div className="flex justify-center">
            <Link
              href="/watch"
              className="group inline-flex items-center gap-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500"
            >
              <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden="true">
                <RadioTower className="h-5 w-5 text-white transition group-hover:text-red-500" />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-600" />
              </span>
              <span className="font-black uppercase tracking-[0.14em] text-white transition group-hover:text-red-500">
                Watch Live
              </span>
              <span className="hidden text-neutral-400 transition group-hover:text-neutral-200 sm:inline">
                Tournament Stream &amp; Live Weigh-In
              </span>
            </Link>
          </div>
<div className="mt-4 space-y-5 md:hidden">
  <LatestTournamentNews announcements={announcements.slice(0, 1)} />

  <FeaturedTournament
    tournament={featuredTournament ?? null}
    operations={operations}
    earlyRegistrationSummary={earlyRegistrationSummary}
    earlyRegistrationStatsUnavailable={earlyRegistrationStatsUnavailable}
  />
</div>
          <div
  data-homepage-tournament-grid
  className="mt-2 hidden min-w-0 grid-cols-1 items-start gap-6 md:grid lg:grid-cols-2"
>
            <div data-tournament-column="right" className="flex min-w-0 flex-col gap-6 lg:col-start-2 lg:row-start-1">
              <FeaturedTournament
                tournament={featuredTournament ?? null}
                operations={operations}
                earlyRegistrationSummary={earlyRegistrationSummary}
                earlyRegistrationStatsUnavailable={earlyRegistrationStatsUnavailable}
              />
              <RegistrationInterest />
            </div>

            <div data-tournament-column="left" className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1">
              <LatestTournamentNews announcements={announcements} />
              <div><AnalyticsSectionView name="Sponsors" /><SponsorHome sponsors={homepageSponsors} /></div>
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

      <AOYPointsRaceStrip
        standings={aoyStandings}
        unavailable={aoyStandingsUnavailable}
      />
      <WinnersCircle latestResults={latestResults} />
      <AnalyticsSectionView name="Winner Circle" />
    </main>
  );
}
