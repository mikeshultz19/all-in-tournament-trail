import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("completed Tournament Manager AOY workflow", () => {
  const action = readFileSync("app/admin/results/aoy-actions.ts", "utf8");
  const source = readFileSync("lib/aoy-engine.ts", "utf8");
  const dashboard = readFileSync("components/admin/AdminTournamentDashboard.tsx", "utf8");
  const panel = readFileSync("components/admin/AoyCalculationPanel.tsx", "utf8");
  const publicStandings = readFileSync("app/standings/page.tsx", "utf8");
  const publicStandingsTable = readFileSync("components/AoyStandingsTable.tsx", "utf8");

  it("calculates AOY and Championship projections together after publication", () => {
    expect(action).toContain("rebuildAoyForTournament");
    expect(action).toContain("rebuildChampionshipQualificationForTournament");
    expect(action).toContain('revalidatePath("/standings")');
    expect(dashboard).toContain("available={!stage.locked}");
    expect(panel).toContain("Calculate AOY");
  });

  it("requires the immutable historical eligibility snapshot", () => {
    expect(source).toContain("aoy_eligibility_snapshot");
    expect(source).toContain("Official AOY eligibility history is incomplete or inconsistent.");
    expect(source).toContain("snapshot as { eligible?: unknown }");
    expect(source).toContain("snapshot as { membershipSnapshot?: unknown }");
  });

  it("shows counted, dropped, and separate Championship status in admin and public standings", () => {
    expect(panel).toContain("Counted:");
    expect(panel).toContain("Dropped:");
    expect(panel).toContain("Championship");
    expect(publicStandingsTable).toContain("Tournament Points");
    expect(publicStandingsTable).toContain("Dropped");
    expect(publicStandingsTable).toContain("Championship Progress");
    expect(publicStandings).toContain("AoyStandingsTable");
    expect(publicStandingsTable).toContain("qualifyingEvents");
  });
});
