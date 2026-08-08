import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Tournament Information navigation", () => {
  const manager = readFileSync("components/admin/AdminTournamentDashboard.tsx", "utf8");
  const informationPage = readFileSync("app/admin/tournament/page.tsx", "utf8");
  const managerPage = readFileSync("app/admin/tournament-manager/page.tsx", "utf8");

  it("keeps information management outside the operational stages", () => {
    expect(manager).toContain("Tournament Manager");
    expect(manager).toContain("Current Tournament");
    expect(manager).not.toContain("TournamentInformationForm");
  });

  it("returns to Tournament Manager with the selected tournament", () => {
    expect(informationPage).toContain("Back to Tournament Manager");
    expect(informationPage).toContain("/admin/tournament-manager?tournament=");
    expect(managerPage).toContain("tournament.id === requestedTournament || tournament.slug === requestedTournament");
  });

  it("continues to reuse the existing Tournament Information form", () => {
    expect(informationPage).toContain("TournamentInformationForm");
  });
});
