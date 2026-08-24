import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

import PublishHistoricalResultReview from "@/components/admin/PublishHistoricalResultReview";

describe("publish historical review UI", () => {
  it("renders a compact review dialog with boat-numbered registration choices", () => {
    const html = renderToStaticMarkup(
      <PublishHistoricalResultReview
        tournamentId="tour-1"
        identifier="eagle-mountain"
        row={{
          resultId: "result-4",
          place: 4,
          teamName: "Joe Johnson / Solo PhoneMatch",
          reason: "No unique active registration matches \"Joe Johnson / Solo PhoneMatch\" exactly.",
        }}
        registrations={[
          {
            id: "reg-1",
            boatNumber: 1,
            registrationType: "team",
            angler1Name: "Joe Johnson",
            angler2Name: "Bill Stephens",
            identityReviewStatus: "verified",
            membershipSummary: "Member / Member",
          },
          {
            id: "reg-2",
            boatNumber: 9,
            registrationType: "solo",
            angler1Name: "Solo PhoneMatch",
            angler2Name: null,
            identityReviewStatus: "verified",
            membershipSummary: "Member",
          },
        ]}
      />,
    );

    expect(html).toContain("Review");
    expect(html).toContain("Historical Result Review");
    expect(html).toContain("Place 4");
    expect(html).toContain("Boat #1");
    expect(html).toContain("Joe Johnson / Bill Stephens");
    expect(html).toContain("Save Historical Review");
  });

  it("keeps the review control gated to manual rows in the publish table", () => {
    const source = readFileSync(
      "app/admin/tournament-manager/publish/page.tsx",
      "utf8",
    );

    expect(source).toContain("manualReviewRowIds.has(entry.id)");
    expect(source).toContain("PublishHistoricalResultReview");
    expect(source).toContain("Ready");
  });
});
