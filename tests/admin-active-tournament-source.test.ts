import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Admin active tournament synchronization", () => {
  it("uses the same active operational source on Home and Tournament", () => {
    const homePage = readFileSync("app/admin/page.tsx", "utf8");
    const tournamentPage = readFileSync(
      "app/admin/tournament-manager/page.tsx",
      "utf8",
    );

    expect(homePage).toContain("getActiveOperationalTournament()");
    expect(tournamentPage).toContain(
      "selectActiveOperationalTournament(tournaments)",
    );
    expect(homePage).not.toContain("getNextUpcomingTournament()");
    expect(tournamentPage).not.toContain("getNextUpcomingTournament()");
  });

  it("does not hard-code a tournament name in either page", () => {
    const pages = [
      readFileSync("app/admin/page.tsx", "utf8"),
      readFileSync("app/admin/tournament-manager/page.tsx", "utf8"),
    ].join("\n");

    expect(pages).not.toMatch(/Lake Fork|Sam Rayburn|Eagle Mountain/);
  });
});
