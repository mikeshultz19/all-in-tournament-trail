import Link from "next/link";
import { RadioTower } from "lucide-react";

import AnalyticsSectionView from "@/components/AnalyticsSectionView";
import AOYPointsRaceStrip from "@/components/AOYPointsRaceStrip";
import FeaturedTournament from "@/components/FeaturedTournament";
import LatestTournamentNews from "@/components/LatestTournamentNews";
import RegistrationInterest from "@/components/RegistrationInterest";
import SponsorHome from "@/components/SponsorHome";
import TournamentConditions from "@/components/TournamentConditions";
import WinnersCircle from "@/components/WinnersCircle";

type DesktopHomePageProps = {
  announcements: Parameters<typeof LatestTournamentNews>[0]["announcements"];
  featuredTournament: Parameters<typeof FeaturedTournament>[0]["tournament"];
  operations: Parameters<typeof FeaturedTournament>[0]["operations"];
  earlyRegistrationSummary: Parameters<
    typeof FeaturedTournament
  >[0]["earlyRegistrationSummary"];
  earlyRegistrationStatsUnavailable: Parameters<
    typeof FeaturedTournament
  >[0]["earlyRegistrationStatsUnavailable"];
  homepageSponsors: Parameters<typeof SponsorHome>[0]["sponsors"];
  weather: Parameters<typeof TournamentConditions>[0]["weather"] | null;
  aoyStandings: Parameters<typeof AOYPointsRaceStrip>[0]["standings"];
  aoyStandingsUnavailable: Parameters<
    typeof AOYPointsRaceStrip
  >[0]["unavailable"];
  latestResults: Parameters<typeof WinnersCircle>[0]["latestResults"];
};

export default function DesktopHomePage({
  announcements,
  featuredTournament,
  operations,
  earlyRegistrationSummary,
  earlyRegistrationStatsUnavailable,
  homepageSponsors,
  weather,
  aoyStandings,
  aoyStandingsUnavailable,
  latestResults,
}: DesktopHomePageProps) {
  return (
    <div className="hidden md:block">
      <section
        id="tournament-grid"
        className="border-t border-zinc-900 bg-black"
      >
        <div className="mx-auto w-full max-w-[1700px] px-4 pb-6 pt-3 sm:pb-8 sm:pt-4 lg:px-8">
          {/*
           * TOP LINK ROW
           *
           * This uses the same two-column grid as the content below.
           * That makes the No FFS link line up exactly with Latest News
           * and the Watch Live link line up with the Featured Tournament.
           */}
          <div className="grid min-w-0 grid-cols-1 items-center gap-3 lg:grid-cols-2 lg:gap-6">
            {/* Left side — aligned with Latest News & Announcements */}
           <div className="flex min-w-0 justify-center lg:col-start-1">
  <Link
    href="/no-forward-facing-sonar"
    className="group inline-flex w-fit items-center gap-2 text-sm font-black uppercase tracking-[0.08em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
  >
    <span className="text-[#D4A017]">
      No Forward-Facing Sonar
    </span>

    <span className="text-zinc-400 transition group-hover:text-yellow-300">
      Learn Why →
    </span>
  </Link>
</div>

            {/* Right side — aligned with Featured Tournament */}
            <div className="flex min-w-0 justify-start lg:col-start-2 lg:justify-center">
              <Link
                href="/watch"
                className="group inline-flex items-center gap-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500"
              >
                <span
                  className="relative flex h-5 w-5 items-center justify-center"
                  aria-hidden="true"
                >
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
          </div>

          {/*
           * MAIN TWO-COLUMN HOMEPAGE GRID
           */}
          <div className="mt-4 grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2">
            {/* Right column */}
            <div className="flex min-w-0 flex-col gap-6 lg:col-start-2 lg:row-start-1">
              <FeaturedTournament
                tournament={featuredTournament}
                operations={operations}
                earlyRegistrationSummary={earlyRegistrationSummary}
                earlyRegistrationStatsUnavailable={
                  earlyRegistrationStatsUnavailable
                }
              />

              <RegistrationInterest />
            </div>

            {/* Left column */}
            <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1">
              <LatestTournamentNews announcements={announcements} />

              <div>
                <AnalyticsSectionView name="Sponsors" />
                <SponsorHome sponsors={homepageSponsors} />
              </div>

              <div className="min-w-0">
                {featuredTournament && operations && weather ? (
                  <TournamentConditions
                    tournament={featuredTournament}
                    safeLight={operations.safeLight}
                    weather={weather}
                  />
                ) : (
                  <div className="border border-white/10 bg-[#111111] p-5 text-sm text-neutral-400">
                    Estimated safe light will appear when the next tournament
                    is scheduled.
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
    </div>
  );
}