import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Admin active tournament synchronization", () => {
  it("uses the same next-upcoming source on Home and Tournament", () => {
    const homePage = readFileSync("app/admin/page.tsx", "utf8");
    const tournamentPage = readFileSync(
      "app/admin/tournament-manager/page.tsx",
      "utf8",
    );

    expect(homePage).toContain("getNextUpcomingTournament()");
    expect(tournamentPage).toContain("getNextUpcomingTournament()");
    expect(homePage).not.toContain("getActiveOperationalTournament()");
    expect(tournamentPage).not.toContain(
      "selectActiveOperationalTournament(tournaments)",
    );
  });

  it("does not hard-code a tournament name in either page", () => {
    const pages = [
      readFileSync("app/admin/page.tsx", "utf8"),
      readFileSync("app/admin/tournament-manager/page.tsx", "utf8"),
    ].join("\n");

    expect(pages).not.toMatch(/Lake Fork|Sam Rayburn|Eagle Mountain/);
  });
});
