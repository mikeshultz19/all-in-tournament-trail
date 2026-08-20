import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminHomeOverview from "@/components/admin/AdminHomeOverview";
import { databaseTournament } from "@/tests/tournament-db-fixture";

const reviewSummary = { total: 84, verified: 82, pending: 2, resolved: 0 };
const membershipSummary = { online: 24, event: 6, total: 30 };
const onlineRegistrationSummary = { total: 42, paid: 40, needReview: 2 };

describe("AdminHomeOverview", () => {
  it("integrates current tournament and registration review into one compact card", () => {
    const markup = renderToStaticMarkup(<AdminHomeOverview tournament={databaseTournament} comparisonDate="2026-07-29T12:00:00-05:00" registrationReviewSummary={reviewSummary} resultsPublished={false} membershipSummary={membershipSummary} onlineRegistrationSummary={onlineRegistrationSummary} />);
    expect(markup).toContain("Current Tournament");
    expect(markup).toContain(databaseTournament.name);
    expect(markup).toContain(databaseTournament.lake);
    expect(markup).toContain("Registration");
    expect(markup).toContain("Results");
    expect(markup).toContain("Not Published");
    expect(markup).toContain("Registration &amp; Check-In");
    expect(markup).toContain("Registered");
    expect(markup).toContain(">84<");
    expect(markup).toContain("Verified");
    expect(markup).toContain("Need Review");
    expect(markup).toContain('href="/admin/registration-review"');
    expect(markup).toContain("Membership Summary");
    expect(markup).toContain("Online Memberships");
    expect(markup).toContain("Event Memberships");
    expect(markup).toContain("Total Memberships");
    expect(markup).toContain('href="/admin/members"');
    expect(markup).not.toContain("Online Registrations");
    expect(markup).not.toContain("Next Step");
    expect(markup).not.toContain("Review Registration Roster");
    expect(markup).not.toContain("Possible Duplicates");
    expect(markup).not.toContain("Needs Attention");
  });

  it("shows only actual publication state", () => {
    const markup = renderToStaticMarkup(<AdminHomeOverview tournament={{ ...databaseTournament, result_status: "under_review" }} comparisonDate="2026-07-29T12:00:00-05:00" registrationReviewSummary={reviewSummary} resultsPublished membershipSummary={membershipSummary} onlineRegistrationSummary={onlineRegistrationSummary} />);
    expect(markup).toContain("Published");
    expect(markup).not.toContain("under review");
    expect(markup).not.toContain("Official");
  });

  it("keeps compact quick actions without duplicating Registration & Check-In", () => {
    const markup = renderToStaticMarkup(<AdminHomeOverview tournament={databaseTournament} comparisonDate="2026-07-29T12:00:00-05:00" registrationReviewSummary={{ total: 0, verified: 0, pending: 0, resolved: 0 }} resultsPublished={false} membershipSummary={{ online: 0, event: 0, total: 0 }} onlineRegistrationSummary={{ total: 0, paid: 0, needReview: 0 }} />);
    expect(markup).toContain("Quick Actions");
    expect(markup).toContain("Open Tournament");
    expect(markup).toContain("Members");
    expect(markup).toContain("Website");
    expect(markup.match(/href="\/admin\/registration-review"/g) ?? []).toHaveLength(1);
  });
});
