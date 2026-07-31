import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminHomeOverview from "@/components/admin/AdminHomeOverview";
import { databaseTournament } from "@/tests/tournament-db-fixture";

describe("AdminHomeOverview", () => {
  it("shows a concise current-tournament overview and quick actions", () => {
    const markup = renderToStaticMarkup(
      <AdminHomeOverview
        tournament={databaseTournament}
        comparisonDate="2026-07-29T12:00:00-05:00"
        registrationReviewSummary={{
          pendingReviewCount: 2,
          duplicateCount: 1,
          membershipMatchCount: 1,
        }}
      />,
    );

    expect(markup).toContain("Current Tournament");
    expect(markup).toContain(databaseTournament.name);
    expect(markup).toContain("Registration Status");
    expect(markup).toContain("Results Status");
    expect(markup).toContain("Needs Attention");
    expect(markup).toContain(">2</p>");
    expect(markup).toContain("Possible Duplicates");
    expect(markup).toContain("Membership Matches");
    expect(markup).toContain("Action Needed");
    expect(markup).toContain("Review Registrations");
    expect(markup).not.toContain("Next Tournament Workflow Step");
    expect(markup).toContain("Quick Actions");
    expect(markup).not.toContain("Operational Workflow");
    expect(markup).not.toContain("Registration Identity Review");
  });

  it("shows imported results when certification is required", () => {
    const markup = renderToStaticMarkup(
      <AdminHomeOverview
        tournament={{ ...databaseTournament, result_status: "under_review" }}
        comparisonDate="2026-07-29T12:00:00-05:00"
        registrationReviewSummary={{
          pendingReviewCount: 0,
          duplicateCount: 0,
          membershipMatchCount: 0,
        }}
      />,
    );

    expect(markup).toContain("Awaiting Certification");
    expect(markup).toContain(
      `/admin/tournament-manager/publish?tournament=${databaseTournament.slug}`,
    );
  });

  it("shows only the empty state when no action is required", () => {
    const markup = renderToStaticMarkup(
      <AdminHomeOverview
        tournament={{
          ...databaseTournament,
          description: "Complete",
          ramp: "Main Ramp",
          morning_registration: "5:00 AM",
          registration_opens: "2026-07-01T12:00:00Z",
          registration_closes: "2026-08-01T12:00:00Z",
          practice_information: "Published",
          show_on_homepage: true,
        }}
        comparisonDate="2026-07-29T12:00:00-05:00"
        registrationReviewSummary={{
          pendingReviewCount: 0,
          duplicateCount: 0,
          membershipMatchCount: 0,
        }}
      />,
    );

    expect(markup).toContain("No Outstanding Actions");
    expect(markup).toContain("All Clear");
    expect(markup).toContain("Review Registrations");
    expect(markup).toContain("Registration Review</span>");
    expect(markup).toContain('href="/admin/registration-review"');
    expect(markup).not.toContain("0 Pending");
    expect(markup).not.toContain("Next Tournament Workflow Step");
  });
});
