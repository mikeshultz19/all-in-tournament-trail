import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AOYPointsRaceStrip from "@/components/AOYPointsRaceStrip";
import WinnersCircle from "@/components/WinnersCircle";

describe("homepage AOY and Winner's Circle visual structure", () => {
  it("keeps the unavailable AOY state inside the established strip", () => {
    const html = renderToStaticMarkup(
      <AOYPointsRaceStrip standings={[]} unavailable />,
    );

    expect(html).toContain("Angler of the Year Race");
    expect(html).toContain("AOY standings are temporarily unavailable.");
    expect(html).toContain('href="/standings"');
    expect(html).toContain("View Full Standings");
    expect(html).not.toContain("-mb-6");
    expect(html).toContain("bg-black");
    expect(html).toContain("bg-transparent");
    expect(html).not.toContain("bg-[#0f0f0e]");
    expect(html).toContain("max-w-[1700px]");
    expect(html.match(/❧/g)).toHaveLength(2);
  });

  it("renders five AOY placeholders when standings are empty but available", () => {
    const html = renderToStaticMarkup(<AOYPointsRaceStrip standings={[]} />);

    expect(html).toContain("1ST");
    expect(html).toContain("2ND");
    expect(html).toContain("3RD");
    expect(html).toContain("4TH");
    expect(html).toContain("5TH");
    expect(html.match(/Awaiting Results/g)).toHaveLength(5);
    expect(html).not.toContain("AOY standings are temporarily unavailable.");
  });

  it("retains the established Winner's Circle header and trophy badge", () => {
    const html = renderToStaticMarkup(<WinnersCircle latestResults={null} />);
    const source = readFileSync("components/WinnersCircle.tsx", "utf8");

    expect(html).toContain("Latest Tournament Results");
    expect(html).toContain("No Results Available");
    expect(html).toContain('class="bg-black px-4 py-8 sm:px-6"');
    expect(html).toContain("bg-[#0B0A09]");
    expect(source).toContain("styles.showcaseContainer");
    expect(source).toContain("styles.headerBadge");
    expect(source).toContain('<Trophy aria-hidden="true" className="size-4" />');
    expect(source).toContain("View Complete Results");
  });

  it("keeps AOY and Winner's Circle as direct visual siblings", () => {
    const homepage = readFileSync("app/page.tsx", "utf8");
    const aoyIndex = homepage.indexOf("<AOYPointsRaceStrip");
    const winnersIndex = homepage.indexOf("<WinnersCircle");
    const trackingIndex = homepage.indexOf(
      '<AnalyticsSectionView name="Winner Circle" />',
    );
    const betweenSections = homepage.slice(aoyIndex, winnersIndex);

    expect(aoyIndex).toBeGreaterThan(-1);
    expect(winnersIndex).toBeGreaterThan(aoyIndex);
    expect(trackingIndex).toBeGreaterThan(winnersIndex);
    expect(betweenSections).not.toContain("<div");
    expect(betweenSections).not.toContain("AnalyticsSectionView");
    expect(homepage).toContain("<TournamentConditions");
    expect(homepage).toContain("<LatestTournamentNews");
    expect(homepage).toContain("<SponsorHome");
  });
});
