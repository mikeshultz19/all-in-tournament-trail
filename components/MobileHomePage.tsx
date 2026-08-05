import LatestTournamentNews from "@/components/LatestTournamentNews";
import MobileFeaturedTournament from "@/components/MobileFeaturedTournament";
import SponsorHome from "@/components/SponsorHome";
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
};

export default function MobileHomePage({
  announcements,
  featuredTournament,
  operations,
  
  homepageSponsors,
}: MobileHomePageProps) {
  return (
    <section className="bg-black px-4 py-6 md:hidden">
      <div className="mx-auto w-full max-w-[430px] space-y-6">
        <LatestTournamentNews announcements={announcements.slice(0, 1)} />

        <MobileFeaturedTournament
  tournament={featuredTournament}
  operations={operations}
/>

        <SponsorHome sponsors={homepageSponsors} />
      </div>
    </section>
  );
}