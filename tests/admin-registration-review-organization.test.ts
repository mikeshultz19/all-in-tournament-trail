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
    expect(dashboard).not.toContain("/admin/registration-review");
    expect(page).not.toContain("getTournamentRegistrationReviewSummary");
    expect(page).not.toContain("getRegistrationReviewPendingCount");
  });

  it("uses the shared review summarizer on Home and Registration Review", () => {
    const home = readFileSync("app/admin/page.tsx", "utf8");
    const review = readFileSync(
      "app/admin/registration-review/page.tsx",
      "utf8",
    );

    expect(home).toContain("getRegistrationReviewDashboardSummary()");
    expect(review).toContain("summarizeRegistrationReviewItems(items)");
  });
});
