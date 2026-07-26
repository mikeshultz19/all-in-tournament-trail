import FeaturedSponsor from "@/components/home/FeaturedSponsor";
import { getHomepageSponsors, type Sponsor } from "@/data/sponsors";

export default function SponsorHome({ sponsors }: { sponsors: Sponsor[] }) {
  const homepageSponsors = getHomepageSponsors(sponsors);

  return (
    <FeaturedSponsor
      featuredSponsors={homepageSponsors.map((sponsor) => ({
        id: sponsor.id,
        name: sponsor.name,
        image: sponsor.logo,
        url: sponsor.websiteUrl,
        tier: sponsor.tier ?? "featured",
        scale: sponsor.logoScale,
        active: sponsor.active !== false,
        displayOrder: sponsor.displayOrder ?? Number.MAX_SAFE_INTEGER,
      }))}
    />
  );
}
