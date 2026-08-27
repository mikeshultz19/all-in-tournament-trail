import Header from "@/components/Header";
import Hero from "@/components/Hero";
import DesktopHomePage from "@/components/DesktopHomePage";
import MobileHomePage from "@/components/MobileHomePage";
import { getHomepageSponsors } from "@/data/sponsors";
import { getPublishedAnnouncements } from "@/lib/news";
import { getPublicEarlyEntriesForTournament } from "@/lib/tournament-registrations";
import { getNextUpcomingTournament } from "@/lib/tournaments";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";
import { getOpenMeteoTournamentForecast } from "@/lib/open-meteo";
import {
  getTournamentEntrySummary,
  type TournamentEntrySummary,
} from "@/lib/public-early-entry";
import type { Announcement } from "@/types/announcement";
import { getLatestPublishedTournamentResults } from "@/lib/results";
import type { LatestTournamentResults } from "@/types/results";
import {
  getHomepageAoyStandings,
  type PublicAoyStanding,
} from "@/lib/aoy-standings";

export const revalidate = 10800;
export const dynamic = "force-dynamic";

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "All-In Tournament Trail",
  alternateName: "AITT",
  url: "https://allintrail.com",
};

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

  const operations = featuredTournament
    ? getTournamentOperationsViewModel(featuredTournament)
    : null;

  let earlyRegistrationStatsUnavailable = false;
  let earlyRegistrationSummary: TournamentEntrySummary =
    getTournamentEntrySummary([]);

  if (featuredTournamentDb) {
    try {
      earlyRegistrationSummary = getTournamentEntrySummary(
        await getPublicEarlyEntriesForTournament(featuredTournamentDb.id),
      );
    } catch (error) {
      console.error("Homepage early registration load failed.", error);
      earlyRegistrationStatsUnavailable = true;
    }
  }

  const weather =
    featuredTournament && operations
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />

      <Header />

      <Hero />

      <MobileHomePage
        announcements={announcements}
        featuredTournament={featuredTournament}
        operations={operations}
        homepageSponsors={homepageSponsors}
        latestResults={latestResults}
        aoyLeader={aoyStandings[0]?.angler ?? null}
      />

      <div className="hidden md:block">
        <DesktopHomePage
          announcements={announcements}
          featuredTournament={featuredTournament}
          operations={operations}
          earlyRegistrationSummary={earlyRegistrationSummary}
          earlyRegistrationStatsUnavailable={
            earlyRegistrationStatsUnavailable
          }
          homepageSponsors={homepageSponsors}
          weather={weather}
          aoyStandings={aoyStandings}
          aoyStandingsUnavailable={aoyStandingsUnavailable}
          latestResults={latestResults}
        />
      </div>
    </main>
  );
}
