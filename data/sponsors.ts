export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  websiteUrl?: string;
  active: boolean;
  showOnHomepage: boolean;
  majorSponsor: boolean;
  displayOrder: number;
};

// This is the current sponsor repository. A future admin data source can replace
// this export without coupling the homepage component to storage details.
export const sponsors: Sponsor[] = [];

export function getHomepageSponsors(items: Sponsor[] = sponsors): Sponsor[] {
  return items
    .filter(
      (sponsor) =>
        sponsor.active && sponsor.showOnHomepage && sponsor.majorSponsor,
    )
    .toSorted((a, b) =>
      a.displayOrder === b.displayOrder
        ? a.name.localeCompare(b.name)
        : a.displayOrder - b.displayOrder,
    );
}
