import MobileLatestNews from "@/components/MobileLatestNews";
import MobileFeaturedTournament from "@/components/MobileFeaturedTournament";
import SponsorHome from "@/components/SponsorHome";
import MobileWinnerCircle from "@/components/MobileWinnerCircle";
import type { Announcement } from "@/types/announcement";



type MobileHomePageProps = {
  announcements: Announcement[];
  featuredTournament: Parameters<
  typeof MobileFeaturedTournament
>[0]["tournament"];
operations: Parameters<
  typeof MobileFeaturedTournament
>[0]["operations"];
 
  homepageSponsors: Parameters<typeof SponsorHome>[0]["sponsors"];
  latestResults: Parameters<typeof MobileWinnerCircle>[0]["latestResults"];
};

export default function MobileHomePage({
  announcements,
  featuredTournament,
  operations,
  homepageSponsors,
  latestResults,
}: MobileHomePageProps) {
  return (
  <section className="bg-black px-4 pb-4 pt-2 md:hidden">
    <div className="mx-auto w-full max-w-[430px] space-y-4">
      <MobileLatestNews announcements={announcements} />

      <MobileFeaturedTournament
        tournament={featuredTournament}
        operations={operations}
      />

      <SponsorHome sponsors={homepageSponsors} />

      <MobileWinnerCircle latestResults={latestResults} />
    </div>
  </section>
);
}