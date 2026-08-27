import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WinnersCircle from "@/components/WinnersCircle";
import MobileWinnerCircle from "@/components/MobileWinnerCircle";
import { databaseTournament } from "@/tests/tournament-db-fixture";
import type { LatestTournamentResults } from "@/types/results";

const latestResults: LatestTournamentResults = {
  tournament: {
    ...databaseTournament,
    name: "Lake Fork Championship",
    lake: "Lake Fork",
    tournament_date: "2026-07-19T06:00:00-05:00",
    status: "Results Published",
  },
  results: {
    id: "22222222-2222-4222-8222-222222222222",
    tournament_id: databaseTournament.id,
    entries: [
      {
        kind: "final",
        place: 1,
        team: "Smith / Jones",
        weight: 21.45,
        baseWinnings: 2500,
      },
      {
        kind: "final",
        place: 2,
        team: "Brown / Davis",
        weight: 19.1,
        baseWinnings: 1500,
      },
      {
        kind: "final",
        place: 3,
        team: "Wilson / Moore",
        weight: 18.75,
        baseWinnings: 1000,
      },
      {
        kind: "final",
        place: 4,
        team: "Taylor / White",
        weight: 17.9,
        baseWinnings: 750,
      },
      {
        kind: "final",
        place: 5,
        team: "Collins / Hayes",
        weight: 16.8,
        baseWinnings: 500,
      },
      {
        kind: "sidePot",
        sidePot: "bronze",
        sidePotPlacement: 1,
        place: 1,
        team: "Logan / Morgan",
        weight: 17.5,
        sidePotWeight: 17.5,
        sidePotPayout: 540,
      },
      {
        kind: "sidePot",
        sidePot: "bronze",
        sidePotPlacement: 2,
        place: 2,
        team: "Perry / Grant",
        weight: 16.8,
        sidePotWeight: 16.8,
        sidePotPayout: 360,
      },
      {
        kind: "sidePot",
        sidePot: "silver",
        sidePotPlacement: 1,
        place: 1,
        team: "Anderson / Price",
        weight: 18.5,
        sidePotWeight: 18.5,
        sidePotPayout: 630,
      },
      {
        kind: "sidePot",
        sidePot: "silver",
        sidePotPlacement: 2,
        place: 2,
        team: "Stone / Webb",
        weight: 17.9,
        sidePotWeight: 17.9,
        sidePotPayout: 420,
      },
      {
        kind: "sidePot",
        sidePot: "gold",
        sidePotPlacement: 1,
        place: 1,
        team: "Smith / Jones",
        weight: 18.25,
        sidePotWeight: 18.25,
        sidePotPayout: 900,
      },
      {
        kind: "sidePot",
        sidePot: "gold",
        sidePotPlacement: 2,
        place: 2,
        team: "Taylor / White",
        weight: 17.75,
        sidePotWeight: 17.75,
        sidePotPayout: 750,
      },
    ],
    total_payout: 6250,
    bronze_payout: 900,
    silver_payout: 1050,
    gold_payout: 1650,
    insurance_pot_payout: 1250,
    big_bass_angler: "Ethan Walker",
    big_bass_team: "Smith / Jones",
    big_bass_weight: 8.91,
    big_bass_payout: 650,
    champion_image_url: "/images/featured-tournament.png",
    big_bass_image_url: "/images/tournament-hero.png",
    published_at: "2026-07-19T18:00:00Z",
    created_at: "2026-07-19T18:00:00Z",
    updated_at: "2026-07-19T18:00:00Z",
  },
  tournamentImage: "/images/lakes/eagle-mountain.jfif",
  championImage: "/images/featured-tournament.png",
  bigBassImage: "/images/tournament-hero.png",
  completeResultsUrl: "/results",
};

describe("homepage latest tournament results", () => {
  it("always renders the mobile AOY leader box with an empty-state dash", () => {
    const source = readFileSync("components/MobileHomePage.tsx", "utf8");
    expect(source).toContain("AOY Leader");
    expect(source).toContain('{aoyLeader ?? "—"}');
  });
  it("shows the compact mobile payout winners with the base payout first", () => {
    const html = renderToStaticMarkup(
      <MobileWinnerCircle latestResults={latestResults} />,
    );

    const base = html.indexOf("Base Payout");
    const bronze = html.indexOf("Bronze Winner");
    const silver = html.indexOf("Silver Winner");
    const gold = html.indexOf("Gold Winner");
    const bigBass = html.indexOf("Big Bass");

    expect(base).toBeGreaterThan(-1);
    expect(base).toBeLessThan(bronze);
    expect(bronze).toBeLessThan(silver);
    expect(silver).toBeLessThan(gold);
    expect(gold).toBeLessThan(bigBass);
    expect(html).toContain("Smith / Jones");
    expect(html).toContain("$2,500");
    expect(html).toContain("$540");
    expect(html).toContain("$630");
    expect(html).toContain("$900");
    expect(html).toContain("8.91 lbs");
    expect(html).toContain("$650");
    expect(html).not.toContain("Bronze Pot Winner");
    expect(html).not.toContain("Silver Pot Winner");
    expect(html).not.toContain("Gold Pot Winner");
    expect(html).not.toContain("Big Bass Winner");
    expect(html).not.toContain("Insurance Pot");
    expect(html).toContain("break-words");
    expect(html).toContain("Tri-Lakes Recap Coming Soon!");
  });

  it("uses the saved recap text on mobile", () => {
    const populated = renderToStaticMarkup(
      <MobileWinnerCircle
        latestResults={{ ...latestResults, tournamentRecap: "A strong day on Lake Fork." }}
      />,
    );

    expect(populated).toContain("A strong day on Lake Fork.");
  });

  it("shows the tournament identity and showcase panels", () => {
    const html = renderToStaticMarkup(
      <WinnersCircle latestResults={latestResults} />,
    );

    expect(html).toContain("Lake Fork Championship");
    expect(html).toContain("July 19, 2026");
    expect(html).toContain("Lake Fork");
    expect(html).toContain("AITT");
    expect(html).toContain("WINNERS CIRCLE");
    expect(html).toContain("%2Fimages%2Fwinners-circle-banner.png");
    expect(html).not.toContain("mad-dawg-graphics-design-wide3.png");
    expect(html).toContain("Tournament Recap");
    expect(html).toContain("Tri-Lakes");
    expect(html).toContain("Tri-Lakes Recap Coming Soon!");
    expect(html).toContain("FINAL STANDINGS");
    expect(html).toContain("OVERALL CHAMPION");
    expect(html).toContain("SIDE POTS &amp; PAYOUTS");
    expect(html).toContain("BIG BASS WINNER");
    expect(html).toContain("Smith / Jones");
    expect(html).toContain("$2,500");
    expect(html).toContain("$1,500");
    expect(html).toContain("$1,000");
    expect(html).toContain("1st");
    expect(html).toContain("4th");
    expect(html).toContain("5th");
    expect(html).toContain("Tournament Entry Payout");
    expect(html).toContain("Bronze Side Pot Payout");
    expect(html).toContain("Silver Side Pot Payout");
    expect(html).toContain("Gold Side Pot Payout");
    expect(html).toContain("Insurance Pot");
    expect(html).toContain("TOTAL PAID OUT TO ANGLERS");
    expect(html).toContain("$11,750");
    expect(html).toContain("BRONZE SIDE POT WINNER");
    expect(html).toContain("SILVER SIDE POT WINNER");
    expect(html).toContain("GOLD SIDE POT WINNER");
    expect(html).toContain("View Complete Results");
    expect(html).toContain("%2Fimages%2Ffeatured-tournament.png");
    expect(html).not.toContain("%2Fimages%2Fplaceholders%2Ftournament-coming-soon.png");
    expect(html).toContain("%2Fimages%2Ftournament-hero.png");
    expect(html).toContain('href="/results"');
    expect(html).not.toContain(">Latest Tournament<");
  });

  it("uses the saved recap text on desktop", () => {
    const html = renderToStaticMarkup(
      <WinnersCircle
        latestResults={{ ...latestResults, tournamentRecap: "A saved tournament recap." }}
      />,
    );

    expect(html).toContain("A saved tournament recap.");
    expect(html).not.toContain("Tri-Lakes Recap Coming Soon!");
  });

  it("shows a clean empty state", () => {
    const html = renderToStaticMarkup(
      <WinnersCircle latestResults={null} />,
    );

    expect(html).toContain("WINNERS CIRCLE");
    expect(html).toContain("Tri-Lakes Recap Coming Soon!");
    expect(html).not.toContain("Tournament recap will be published after results become official.");
    expect(html).toContain("FINAL STANDINGS");
    expect(html).toContain("OVERALL CHAMPION");
    expect(html).toContain("SIDE POTS &amp; PAYOUTS");
    expect(html).toContain("BIG BASS WINNER");
    expect(html).toContain("AOY POINTS LEADER");
    expect(html).toContain("%2Fimages%2Fplaceholders%2Ftournament-coming-soon.png");
    expect((html.match(/resultPlaceholderImage/g) ?? [])).toHaveLength(2);
    expect(html).toContain("aria-disabled=\"true\"");
    expect(html).not.toContain('href="/results"');
    expect(html).toContain("—");
    expect(html).not.toContain("No Results Available");
    expect(html).not.toContain("Awaiting Results");
    expect(html).not.toContain("Pending");
  });
});
