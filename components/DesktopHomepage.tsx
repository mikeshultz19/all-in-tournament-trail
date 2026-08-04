import LatestTournamentNews from "@/components/LatestTournamentNews";
import FeaturedTournament from "@/components/FeaturedTournament";
import TournamentConditions from "@/components/TournamentConditions";
import SponsorHome from "@/components/SponsorHome";
import RegistrationInterest from "@/components/RegistrationInterest";
import AnalyticsSectionView from "@/components/AnalyticsSectionView";
import type { Announcement } from "@/types/announcement";
import type { TournamentEntrySummary } from "@/lib/public-early-entry";

type DesktopHomePageProps = {
  announcements: Announcement[];
  featuredTournament: any;
  operations: any;
  weather: any;
  homepageSponsors: any;
  earlyRegistrationSummary: TournamentEntrySummary;
  earlyRegistrationStatsUnavailable: boolean;
};

export default function DesktopHomePage({
  announcements,
  featuredTournament,
  operations,
  weather,
  homepageSponsors,
  earlyRegistrationSummary,
  earlyRegistrationStatsUnavailable,
}: DesktopHomePageProps) {
  return (
    <>
      {/* We will move the existing homepage layout here next */}
    </>
  );
}