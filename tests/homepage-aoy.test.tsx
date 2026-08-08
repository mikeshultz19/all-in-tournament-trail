import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { buildAoyStandings } from "@/lib/aoy-standings";

describe("homepage AOY standings", () => {
  it("aggregates each angler's published events using the best five scores", () => {
    const rows = Array.from({ length: 6 }, (_, index) => ({
      tournament_id: `tournament-${index + 1}`,
      anglers: ["Jane Angler", "Sam Partner"],
      points: 200 - index,
    }));

    expect(buildAoyStandings(rows)[0]).toEqual({
      place: 1,
      angler: "Jane Angler",
      events: 6,
      points: 990,
    });
  });

  it("limits the live standings source to five", () => {
    const standings = buildAoyStandings(
      Array.from({ length: 7 }, (_, index) => ({
        tournament_id: "published-tournament",
        anglers: [`Angler ${index + 1}`],
        points: 200 - index,
      })),
    );
    expect(standings).toHaveLength(5);
  });

  it("renders a compact points race below Winner's Circle", () => {
    const winners = readFileSync("components/WinnersCircle.tsx", "utf8");
    const strip = readFileSync(
      "components/AOYPointsRaceStrip.tsx",
      "utf8",
    );
    const stripStyles = readFileSync(
      "components/AOYPointsRaceStrip.module.css",
      "utf8",
    );
    const homepage = readFileSync("components/DesktopHomePage.tsx", "utf8");

    expect(winners).not.toContain("AOY Points Race");
    expect(winners).not.toContain("aoyStandings");
    expect(strip).toContain("Angler of the Year Race");
    expect(strip).toContain("formatOrdinalRank(standing.place)");
    expect(strip).toContain("standings.slice(0, 5)");
    expect(strip).toContain(
      "[leaders[1], leaders[2], leaders[0], ...leaders.slice(3)]",
    );
    expect(strip).toContain("className={styles.leaders}");
    expect(stripStyles).toContain(
      "grid-template-columns: repeat(5, minmax(0, 1fr))",
    );
    expect(strip).not.toContain("<span>Rank</span>");
    expect(strip).not.toContain("<span>Angler / Team</span>");
    expect(strip).not.toContain(
      '<span className="text-right">Points</span>',
    );
    expect(strip).toContain("View Full Standings");
    expect(strip).not.toContain("standing.events");
    expect(strip).toContain("—");
    expect(strip).toContain("isPlaceholder");
    expect(strip).not.toContain("AOY standings will appear after the first tournament results are published.");
    expect(homepage.indexOf("<AOYPointsRaceStrip")).toBeLessThan(
      homepage.indexOf("<WinnersCircle"),
    );
    expect(homepage).not.toContain("components/AOYStandings");
    expect(homepage).not.toContain("<AOYStandings");
  });
});
