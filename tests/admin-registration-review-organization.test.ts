import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Admin Registration Review organization", () => {
  it("keeps identity review out of the Tournament workspace", () => {
    const dashboard = readFileSync(
      "components/admin/AdminTournamentDashboard.tsx",
      "utf8",
    );
    const page = readFileSync(
      "app/admin/tournament-manager/page.tsx",
      "utf8",
    );

    expect(dashboard).not.toContain("Registration Identity Review");
    expect(page).not.toContain("getTournamentRegistrationReviewSummary");
    expect(page).not.toContain("getRegistrationReviewPendingCount");
  });

  it("uses the selected tournament review summary on Home", () => {
    const home = readFileSync("app/admin/page.tsx", "utf8");
    const review = readFileSync(
      "app/admin/registration-review/page.tsx",
      "utf8",
    );

    expect(home).toContain("listTournamentRegistrationRosterSummaries(tournamentIds)");
    expect(home).toContain("registrationSummaries[selectedId]");
    expect(review).toContain("summarizeTournamentRegistrationRoster(allRows)");
    expect(review).toContain("listRegistrationReviewItems(selectedTournament.id)");
  });
});
