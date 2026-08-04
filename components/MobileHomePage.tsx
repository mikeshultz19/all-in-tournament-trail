import LatestTournamentNews from "@/components/LatestTournamentNews";
import FeaturedTournament from "@/components/FeaturedTournament";
import SponsorHome from "@/components/SponsorHome";
import type { Announcement } from "@/types/announcement";
import type { TournamentEntrySummary } from "@/lib/public-early-entry";

type MobileHomePageProps = {
  announcements: Announcement[];
  featuredTournament: Parameters<typeof FeaturedTournament>[0]["tournament"];
  operations: Parameters<typeof FeaturedTournament>[0]["operations"];
  earlyRegistrationSummary: TournamentEntrySummary;
  earlyRegistrationStatsUnavailable: boolean;
  homepageSponsors: Parameters<typeof SponsorHome>[0]["sponsors"];
};

export default function MobileHomePage({
  announcements,
  featuredTournament,
  operations,
  earlyRegistrationSummary,
  earlyRegistrationStatsUnavailable,
  homepageSponsors,
}: MobileHomePageProps) {
  return (
    <section className="bg-black px-4 py-6 md:hidden">
      <div className="mx-auto w-full max-w-[430px] space-y-6">
        <LatestTournamentNews announcements={announcements.slice(0, 1)} />

        <FeaturedTournament
          tournament={featuredTournament}
          operations={operations}
          earlyRegistrationSummary={earlyRegistrationSummary}
          earlyRegistrationStatsUnavailable={
            earlyRegistrationStatsUnavailable
          }
        />

        <SponsorHome sponsors={homepageSponsors} />
      </div>
    </section>
  );
}