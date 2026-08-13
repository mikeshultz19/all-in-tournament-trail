import { renderToStaticMarkup } from "react-dom/server";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import SponsorsPage from "@/app/sponsors/page";
import SponsorshipOpportunitiesPage from "@/app/sponsorship-opportunities/page";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
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

    expect(html.indexOf("Texas Boat Works logo")).toBeLessThan(
      html.indexOf("Fenix Parts logo"),
    );
    expect(html.indexOf("Fenix Parts logo")).toBeLessThan(
      html.indexOf("Mad Dawg Graphics &amp; Design"),
    );
    expect(html).not.toContain("Phoenix Boats");
    expect(html).not.toContain("phoenix-boats.png");
    expect(html).toContain("mad-dawg-graphics-design-wide1.png");
    expect(
      existsSync(
        "public/images/sponsors/mad-dawg-graphics-design-wide1.png",
      ),
    ).toBe(true);
    expect(html).toContain('alt="Mad Dawg Graphics &amp; Design"');
    expect(html.match(/ alt="[^"]+"/g)).toHaveLength(3);
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("min-[480px]:grid-cols-2");
    expect(html).toContain("md:grid-cols-3");
    expect(html).toContain("max-h-[52px]");
    expect(html).toContain("max-h-[64px]");
    expect(html).toContain("border-[#4A3A12]");
  });

  it("renders contained logos and safe optional website links", () => {
    const html = renderToStaticMarkup(<SponsorHome sponsors={[sponsor()]} />);

    expect(html).toContain("AITT BROUGHT TO YOU BY...");
    expect(html).toContain("Major One logo");
    expect(html).toContain("object-contain");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("AITT is open to sponsorship opportunities.");
    expect(html).toContain('href="/sponsors"');
    expect(html).toContain(
      'aria-label="Learn more about AITT sponsorship opportunities"',
    );
    expect(html).toContain("Learn more");
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

describe("public sponsorship paths", () => {
  it("preserves the Sponsors introduction and renders its partner rows in order", () => {
    const html = renderToStaticMarkup(<SponsorsPage />);

    expect(html).toContain("Support competitive bass fishing and connect your business with the AITT community.");
    expect(html).toContain("Interested in partnering with AITT?");
    expect(html).toContain('href="/sponsorship-opportunities"');
    expect(html).toContain("Our Partners");
    expect(html).toContain("Texas Boat Works");
    expect(html).toContain("texas-boat-works.png");
    expect(html).toContain('href="https://www.texasboatworks.com"');
    expect(html).toContain("Badger Lures");
    expect(html).toContain("Badger.jpg");
    expect(html).toContain('href="https://facebook.com/Badger.them.to.Bite"');
    expect(html).toContain("Badger Them to Bite.");
    expect(html).toContain("Patterns designed to catch fish, not anglers");
    expect(html).toContain("Yukon Outfitters");
    expect(html).toContain("Yukon-Outfitters.png");
    expect(html).toContain('href="https://yukon-outfitters.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html.indexOf("Texas Boat Works")).toBeLessThan(
      html.indexOf("Yukon Outfitters"),
    );
    expect(html.indexOf("Badger Lures")).toBeLessThan(
      html.indexOf("Yukon Outfitters"),
    );
    expect(html).toContain("sm:grid-cols-[180px_minmax(0,1fr)]");
    expect(html).toContain("lg:grid-cols-[210px_minmax(0,1fr)_auto]");
    expect(html).toContain("overflow-x-hidden");
  });

  it("moves the existing opportunity content to its dedicated route", () => {
    const sponsorsHtml = renderToStaticMarkup(<SponsorsPage />);
    const opportunityHtml = renderToStaticMarkup(<SponsorshipOpportunitiesPage />);

    expect(sponsorsHtml).not.toContain("Sponsorship benefits may include");
    expect(opportunityHtml).toContain("Partner With All In Tournament Trail");
    expect(opportunityHtml).toContain("Sponsorship benefits may include");
    expect(opportunityHtml).toContain("Website exposure");
    expect(opportunityHtml).toContain("Tournament recognition");
    expect(opportunityHtml).toContain("Contact Us");
    expect(opportunityHtml).toContain('href="/contact"');
    expect(opportunityHtml).toContain("break-words");
  });

  it("keeps the hero uncluttered and links How AITT Works from global navigation", () => {
    const heroHtml = renderToStaticMarkup(<Hero />);
    const headerHtml = renderToStaticMarkup(<Header />);

    expect(heroHtml).not.toContain("See How AITT Works");
    expect(headerHtml).toContain('href="/how-it-works"');
    expect(headerHtml).toContain("How AITT Works");
    expect(headerHtml).toContain("font-black");
    expect(headerHtml).toContain("text-yellow-400");
    expect(headerHtml).toContain("hover:text-yellow-300");
  });

  it("uses only the approved existing public routes", () => {
    expect(existsSync("app/sponsors/page.tsx")).toBe(true);
    expect(existsSync("app/sponsorship-opportunities/page.tsx")).toBe(true);
    expect(existsSync("app/how-it-works/page.tsx")).toBe(true);
    expect(existsSync("app/contact/page.tsx")).toBe(true);
    expect(
      readFileSync("components/Header.tsx", "utf8"),
    ).toContain('{ label: "Sponsors", href: "/sponsors" }');
  });
});
