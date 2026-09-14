import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Tournament Information navigation", () => {
  const manager = readFileSync("components/admin/AdminTournamentDashboard.tsx", "utf8");
  const informationPage = readFileSync("app/admin/tournament/page.tsx", "utf8");
  const informationSelector = readFileSync(
    "components/admin/TournamentInformationSelector.tsx",
    "utf8",
  );
  const informationActions = readFileSync(
    "app/admin/tournament/actions.ts",
    "utf8",
  );
  const tournamentsData = readFileSync("lib/tournaments.ts", "utf8");
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

  it("lists database tournaments chronologically and reloads the selected record", () => {
    expect(informationPage).toContain("getTournaments()");
    expect(tournamentsData).toContain('.order("tournament_date", { ascending: true })');
    expect(informationPage).toContain("TournamentInformationSelector");
    expect(informationPage).toContain("item.lake");
    expect(informationPage).toContain('month: "short"');
    expect(informationSelector).toContain("router.push(");
    expect(informationSelector).toContain("/admin/tournament?tournament=");
    expect(informationPage).toContain("key={tournament.id}");
  });

  it("saves and returns to the same selected tournament", () => {
    expect(informationActions).toContain(
      "updateTournament(tournamentId, tournamentFormToUpdate(values))",
    );
    expect(informationActions).toContain(
      "/admin/tournament?tournament=${encodeURIComponent(tournamentId)}&saved=1",
    );
    expect(informationPage).toContain(
      "tournament information was updated successfully",
    );
  });
});
