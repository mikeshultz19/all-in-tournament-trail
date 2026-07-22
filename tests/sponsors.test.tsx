import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SponsorHome from "@/components/SponsorHome";
import { getHomepageSponsors, type Sponsor } from "@/data/sponsors";

const sponsor = (overrides: Partial<Sponsor> = {}): Sponsor => ({
  id: "major-one",
  name: "Major One",
  logo: "/sponsors/major-one.png",
  websiteUrl: "https://example.com",
  active: true,
  showOnHomepage: true,
  majorSponsor: true,
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

  it("sorts qualifying sponsors before rendering", () => {
    const html = renderToStaticMarkup(
      <SponsorHome
        sponsors={[
          sponsor({ id: "second", name: "Second", displayOrder: 2 }),
          sponsor({ id: "first", name: "First", displayOrder: 1 }),
        ]}
      />,
    );

    expect(html.indexOf("First logo")).toBeLessThan(html.indexOf("Second logo"));
  });

  it("renders contained logos and safe optional website links", () => {
    const html = renderToStaticMarkup(<SponsorHome sponsors={[sponsor()]} />);

    expect(html).toContain("AITT BROUGHT TO YOU BY...");
    expect(html).toContain("Major One logo");
    expect(html).toContain("object-contain");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
