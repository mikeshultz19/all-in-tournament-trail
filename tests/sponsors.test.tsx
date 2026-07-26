import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SponsorHome from "@/components/SponsorHome";
import FeaturedSponsor from "@/components/home/FeaturedSponsor";
import {
  getHomepageSponsors,
  sponsors,
  type Sponsor,
} from "@/data/sponsors";

const sponsor = (overrides: Partial<Sponsor> = {}): Sponsor => ({
  id: "major-one",
  name: "Major One",
  logo: "/sponsors/major-one.png",
  websiteUrl: "https://example.com",
  active: true,
  showOnHomepage: true,
  majorSponsor: true,
  tier: "featured",
  displayOrder: 1,
  ...overrides,
});

describe("homepage sponsors", () => {
  it("filters qualifying major sponsors and sorts by display order", () => {
    const result = getHomepageSponsors([
      sponsor({ id: "second", name: "Second", displayOrder: 20 }),
      sponsor({ id: "inactive", active: false }),
      sponsor({ id: "hidden", showOnHomepage: false }),
      sponsor({ id: "minor", majorSponsor: false }),
      sponsor({ id: "first", name: "First", displayOrder: 10 }),
    ]);

    expect(result.map(({ id }) => id)).toEqual(["first", "second"]);
  });

  it("keeps legacy sponsors with missing flags eligible and places unsorted records last", () => {
    const result = getHomepageSponsors([
      sponsor({ id: "legacy", name: "Legacy", active: null, showOnHomepage: null, majorSponsor: null, displayOrder: null }),
      sponsor({ id: "ordered", name: "Ordered", displayOrder: 2 }),
    ]);

    expect(result.map(({ id }) => id)).toEqual(["ordered", "legacy"]);
  });

  it("skips an invalid sponsor without hiding valid sponsors", () => {
    const html = renderToStaticMarkup(
      <SponsorHome sponsors={[sponsor({ id: "invalid", logo: "" }), sponsor()]} />,
    );

    expect(html).toContain("Major One logo");
    expect(html).not.toContain("invalid logo");
  });

  it("renders no empty panel when there are no qualifying sponsors", () => {
    expect(renderToStaticMarkup(<SponsorHome sponsors={[]} />)).toBe("");
    expect(
      renderToStaticMarkup(
        <SponsorHome sponsors={[sponsor({ active: false })]} />,
      ),
    ).toBe("");
  });

  it("renders presenting and secondary sponsors in display order", () => {
    const html = renderToStaticMarkup(
      <SponsorHome
        sponsors={[
          sponsor({ id: "second", name: "Second", displayOrder: 2 }),
          sponsor({ id: "first", name: "First", displayOrder: 1 }),
        ]}
      />,
    );

    expect(html).toContain("First logo");
    expect(html).toContain("Second logo");
    expect(html.indexOf("First logo")).toBeLessThan(html.indexOf("Second logo"));
  });

  it("renders the configured sponsors in the approved order", () => {
    const html = renderToStaticMarkup(<SponsorHome sponsors={sponsors} />);

    expect(html.indexOf("Phoenix Boats logo")).toBeLessThan(
      html.indexOf("Texas Boat Works logo"),
    );
    expect(html.indexOf("Texas Boat Works logo")).toBeLessThan(
      html.indexOf("Fenix Parts logo"),
    );
    expect(html.indexOf("Fenix Parts logo")).toBeLessThan(
      html.indexOf("Mad Dawg Graphics &amp; Design logo"),
    );
    expect(html).toContain("grid-cols-2");
    expect(html).toContain("min-[640px]:grid-cols-4");
    expect(html).toContain("max-h-[40px]");
    expect(html).toContain("max-h-[42px]");
    expect(html).toContain("max-h-[48px]");
    expect(html).toContain("border-[#4A3A12]");
  });

  it("renders contained logos and safe optional website links", () => {
    const html = renderToStaticMarkup(<SponsorHome sponsors={[sponsor()]} />);

    expect(html).toContain("AITT BROUGHT TO YOU BY...");
    expect(html).toContain("Major One logo");
    expect(html).toContain("object-contain");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain("Sponsor information coming soon.");
  });

  it("supports optional fade styling without adding controls", () => {
    const html = renderToStaticMarkup(
      <FeaturedSponsor
        featuredSponsors={[
          {
            id: "major-one",
            name: "Major One",
            image: "/sponsors/major-one.png",
            tier: "presenting",
            active: true,
            displayOrder: 1,
          },
        ]}
        enableFadeTransition
      />,
    );

    expect(html).toContain("transition-opacity");
    expect(html).not.toContain("<button");
  });
});
