export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  websiteUrl?: string;
  tier?: "presenting" | "featured";
  logoScale?: "standard" | "compact" | "small";
  active?: boolean | null;
  showOnHomepage?: boolean | null;
  majorSponsor?: boolean | null;
  displayOrder?: number | null;
};

// This is the current sponsor repository. A future admin data source can replace
// this export without coupling the homepage component to storage details.
export const sponsors: Sponsor[] = [
  {
    id: "tri-lakes-tackle-town",
    name: "Tri-Lakes Tackle Town",
    logo: "/images/sponsors/tri-lakes-logo.png",
    websiteUrl: "https://trilakestackletown.com/",
    tier: "featured",
    logoScale: "standard",
    active: true,
    showOnHomepage: true,
    majorSponsor: true,
    displayOrder: 1,
  },
  {
    id: "texas-boat-works",
    name: "Texas Boat Works",
    logo: "/images/sponsors/texas-boat-works.png",
    websiteUrl: "https://www.texasboatworks.com",
    tier: "presenting",
    active: true,
    showOnHomepage: true,
    majorSponsor: true,
    displayOrder: 2,
  },
  {
    id: "mad-dawg-graphics-design",
    name: "Mad Dawg Graphics & Design",
    logo: "/images/sponsors/mad-dawg-graphics-design-wide3.png",
    tier: "featured",
    logoScale: "standard",
    active: true,
    showOnHomepage: true,
    majorSponsor: true,
    displayOrder: 3,
  },
];

export function getHomepageSponsors(items: Sponsor[] = sponsors): Sponsor[] {
  return items
    .filter(
      (sponsor) =>
        sponsor.id.trim().length > 0 &&
        sponsor.name.trim().length > 0 &&
        sponsor.logo.trim().length > 0 &&
        sponsor.active !== false &&
        sponsor.showOnHomepage !== false &&
        sponsor.majorSponsor !== false,
    )
    .toSorted((a, b) =>
      (a.displayOrder ?? Number.MAX_SAFE_INTEGER) ===
      (b.displayOrder ?? Number.MAX_SAFE_INTEGER)
        ? a.name.localeCompare(b.name)
        : (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.displayOrder ?? Number.MAX_SAFE_INTEGER),
    );
}
