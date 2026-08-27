import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BassStackScoreTracker from "@/components/home/BassStackScoreTracker";
import LatestTournamentNews from "@/components/LatestTournamentNews";
import BassStackResultsPage from "@/app/bass-stack/results/page";
import type { Announcement } from "@/types/announcement";

const announcement = (id: string, title: string): Announcement => ({
  id,
  tournament_id: null,
  title,
  slug: id,
  summary: `${title} summary`,
  content: `${title} content`,
  featured_image_url: null,
  is_pinned: false,
  publish_date: "2026-08-19T12:00:00.000Z",
  is_published: true,
  link_label: null,
  link_url: null,
  display_order: 0,
  created_at: "2026-08-19T12:00:00.000Z",
  updated_at: "2026-08-19T12:00:00.000Z",
});

describe("homepage Bass Stack Phase 1 placement", () => {
  it("renders only the first desktop announcement", () => {
    const html = renderToStaticMarkup(
      <LatestTournamentNews
        announcements={[
          announcement("first", "First announcement"),
          announcement("second", "Second announcement"),
        ]}
      />,
    );

    expect(html).toContain("First announcement");
    expect(html).not.toContain("Second announcement");
  });

  it("renders a visual-only Bass Stack score tracker", () => {
    const html = renderToStaticMarkup(<BassStackScoreTracker />);

    expect(html).toContain("Texas Boat Works Live Score Tracker");
    expect(html).toContain('font-black tracking-[-0.01em] text-[#0095DF]');
    expect(html).toContain(">LIVE</span>");
    expect(html).toContain(">Score Tracker<span");
    expect(html).toContain("Presented by");
    expect(html).toContain("REAL-TIME UPDATES");
    expect(html).not.toContain("AITT Live ScoreTracker");
    expect(html).not.toContain("Mad Dawg Graphics Live Score Tracker");
    expect(html).not.toContain("Coming Soon");
    expect(html).toContain("Squaw Creek — Feb 14, 2027");
    expect(html).toContain("from-red-950/55");
    expect(html).toContain("Total Weight");
    expect(html).toContain('href="/bass-stack/results"');
    expect(html).not.toContain("Tune in live");
    expect(html).toContain("View All");
    expect(html).not.toContain("View Full Results");
    expect(html).not.toContain("How Bass Stack Works");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<input");
    expect(html).not.toContain("<button");
  });

  it("renders the public visual-only Bass Stack results placeholder", () => {
    const html = renderToStaticMarkup(<BassStackResultsPage />);

    expect(html).toContain("Bass Stack Tournament Results");
    expect(html).toContain("No Published Results Yet");
    expect(html).toContain("Coming Soon");
    expect(html).toContain('href="/"');
    expect(html).toContain("Return Home");
  });

  it("places the tracker directly after Sponsors in both homepage flows", () => {
    const mobile = readFileSync("components/MobileHomePage.tsx", "utf8");
    const desktop = readFileSync("components/DesktopHomePage.tsx", "utf8");

    const mobileSponsor = mobile.indexOf("<SponsorHome");
    const mobileTracker = mobile.indexOf("<BassStackScoreTracker");
    const mobileResults = mobile.indexOf("<MobileWinnerCircle");
    const desktopSponsor = desktop.indexOf("<SponsorHome");
    const desktopTracker = desktop.indexOf("<BassStackScoreTracker");
    const desktopConditions = desktop.indexOf("<TournamentConditions");

    expect(mobileSponsor).toBeGreaterThan(-1);
    expect(mobileTracker).toBeGreaterThan(mobileSponsor);
    expect(mobileResults).toBeGreaterThan(mobileTracker);
    expect(desktopSponsor).toBeGreaterThan(-1);
    expect(desktopTracker).toBeGreaterThan(desktopSponsor);
    expect(desktopConditions).toBeGreaterThan(desktopTracker);
  });
});
