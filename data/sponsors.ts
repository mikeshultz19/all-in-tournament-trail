export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  websiteUrl?: string;
  active?: boolean | null;
  showOnHomepage?: boolean | null;
  majorSponsor?: boolean | null;
  displayOrder?: number | null;
};

// This is the current sponsor repository. A future admin data source can replace
// this export without coupling the homepage component to storage details.
export const sponsors: Sponsor[] = [];

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
