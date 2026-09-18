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

  it("uses one authoritative Registration & Check-In workspace", () => {
    const review = readFileSync("app/admin/registration-review/page.tsx", "utf8");
    const legacyRoute = readFileSync("app/admin/tournament-manager/prepare/page.tsx", "utf8");
    const home = readFileSync("app/admin/page.tsx", "utf8");

    expect(review).toContain("Registration &amp; Check-In");
    expect(review).toContain("getTournamentRegistrationRoster(selectedTournament.id)");
    expect(review).toContain("RegistrationCheckInControl");
    expect(review).not.toContain("PrepareMembershipReminder");
    expect(readFileSync("components/admin/AdminTournamentDashboard.tsx", "utf8")).toContain("PrepareMembershipReminder");
    expect(legacyRoute).toContain("await requireAdminUser()");
    expect(legacyRoute).toContain("redirect(`/admin/registration-review${query}`)");
    expect(home.match(/label="Registration & Check-In"/g) ?? []).toHaveLength(1);
    expect(home).not.toContain('label="Early Entries & Check-In"');
  });

  it("uses compact per-angler membership status and fees on the roster", () => {
    const review = readFileSync("app/admin/registration-review/page.tsx", "utf8");
    expect(review).toContain("Membership Fees");
    expect(review).toContain("membershipStatusLine(row.angler1)");
    expect(review).toContain("whitespace-nowrap");
    expect(review).toContain('"New Member"');
    expect(review).toContain('"Current Member"');
    expect(review).toContain('"Non-Member"');
    expect(review).toContain('"Needs Review"');
    expect(review).not.toContain("Purchased Here");
    expect(review).not.toContain("Total collected");
    expect(review).toContain("filterTournamentRegistrationRosterRows");
    expect(review).toContain("paginateTournamentRegistrationRosterRows");
  });
});
