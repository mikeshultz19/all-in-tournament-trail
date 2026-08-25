import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import AoyStandingsTable from "@/components/AoyStandingsTable";
import {
  paginatePublicAoyStandings,
  type PublicDetailedAoyStanding,
} from "@/lib/aoy-standings";

function standing(place: number): PublicDetailedAoyStanding {
  return {
    place,
    competitiveRecordId: `record-${place}`,
    angler: `Team ${place}`,
    events: 6,
    qualifyingEvents: 6,
    points: 1000 - place,
    countedResults: [{ tournament: "Eagle Mountain", tournamentNumber: 1, points: 200 }],
    droppedResults: [{ tournament: "Squaw Creek", tournamentNumber: 6, points: 190 }],
    championshipStatus: "qualified",
  };
}

describe("public AOY standings presentation", () => {
  it("keeps default rows compact with an expansion control", () => {
    const html = renderToStaticMarkup(<AoyStandingsTable standings={[standing(1)]} />);

    expect(html).toContain("Team / Angler");
    expect(html).toContain("AOY Points");
    expect(html).toContain("Events Fished");
    expect(html).toContain("Championship Progress");
    expect(html).toContain("View Results");
    expect(html).not.toContain("Eagle Mountain");
    expect(html).not.toContain("Squaw Creek");
  });

  it("uses a simple tournament-points expansion and labels dropped scores", () => {
    const source = readFileSync("components/AoyStandingsTable.tsx", "utf8");

    expect(source).toContain("Tournament Points");
    expect(source).toContain("result.tournament");
    expect(source).toContain("result.points");
    expect(source).toContain("Dropped");
    expect(source).not.toContain("fingerprint");
    expect(source).not.toContain("eligibility");
    expect(source).not.toContain("membershipSnapshot");
  });

  it("paginates at 25 rows while retaining overall ranks", () => {
    const standings = Array.from({ length: 61 }, (_, index) => standing(index + 1));

    expect(paginatePublicAoyStandings(standings, 1).standings.map((row) => row.place)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
    expect(paginatePublicAoyStandings(standings, 2).standings.map((row) => row.place)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 26),
    );
    expect(paginatePublicAoyStandings(standings, 3).standings.map((row) => row.place)).toEqual(
      Array.from({ length: 11 }, (_, index) => index + 51),
    );
    expect(paginatePublicAoyStandings(standings.slice(0, 25), 1).totalPages).toBe(1);
  });
});
