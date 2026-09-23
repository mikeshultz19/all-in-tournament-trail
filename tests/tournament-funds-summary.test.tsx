import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import TournamentFundsSummary from "@/components/admin/TournamentFundsSummary";
import type { TournamentCollectionSummary } from "@/lib/tournament-collection-calculator";

const summary: TournamentCollectionSummary = {
  tournamentId: "tournament-1",
  lines: [
    ...(["Base Entry", "Big Bass", "Bronze Pot", "Silver Pot", "Gold Pot", "Insurance Pot"] as const).map((label, index) => ({ key: (["base", "big_bass", "bronze", "silver", "gold", "insurance"] as const)[index], label, count: 0, onlineCount: 0, inPersonCount: 0, configuredFeeCents: 0, feeCents: 0, totalCents: 0 })),
    { key: "membership", label: "Memberships Collected", count: 0, onlineCount: 0, inPersonCount: 0, configuredFeeCents: 4000, feeCents: 4000, totalCents: 0 },
  ],
  totalCollectedCents: 0,
  totalTournamentPayoutFundsCents: 0,
  membershipRevenueCents: 0,
  totalRegistrationFundsCollectedCents: 0,
  onlineRegistrationFundsCents: 0,
  walkUpFundsByMethod: { cash: 0, card: 0, other: 0 },
  paidEntries: 0,
  confirmedPaidEntries: 0,
  registrationsNeedingReview: 0,
  morningCandidates: [],
  missing: [],
};

describe("Tournament Funds Summary", () => {
  it("keeps zero-dollar categories visible and does not expose service fees", () => {
    const markup = renderToStaticMarkup(<TournamentFundsSummary summary={summary} />);
    expect(markup).toContain("Tournament Funds Summary");
    expect(markup).toContain("Base Entry");
    expect(markup).toContain("Insurance Pot");
    expect(markup).toContain("Total Tournament Payout Funds");
    expect(markup).toContain("New Memberships Purchased");
    expect(markup).not.toContain("Membership Charges Collected");
    expect(markup).toContain("TOTAL REGISTRATION FUNDS COLLECTED");
    expect(markup).not.toContain("Shortfall");
    expect(markup).toContain("$0.00");
    expect(markup).not.toContain("Square Service Fee");
  });

  it("combines membership metrics and renders reconciliation issues as separate lines", () => {
    const markup = renderToStaticMarkup(<TournamentFundsSummary summary={{
      ...summary,
      lines: summary.lines.map((line) => line.key === "membership" ? { ...line, count: 6, totalCents: 24000 } : line),
      membershipRevenueCents: 24000,
      missing: ["Walk-up face-value mismatch — Boat #5 (registration reg-5): recorded $700.70 vs expected $680.00; unexplained difference $20.70."],
      membershipReconciliationWarnings: ["Membership classification/payment mismatch — Boat #16 (registration reg-16), participant position 2."],
    }} />);
    expect(markup).toContain("6 — $240.00 collected");
    expect(markup).not.toContain("Membership Charges Collected");
    expect(markup).toContain("Boat #5");
    expect(markup).toContain("Boat #16");
    expect(markup).toContain("<ul");
    expect(markup).toContain("<li");
  });

  it("uses review-neutral singular and plural warning wording", () => {
    const singular = renderToStaticMarkup(<TournamentFundsSummary summary={{ ...summary, registrationsNeedingReview: 1 }} />);
    const plural = renderToStaticMarkup(<TournamentFundsSummary summary={{ ...summary, registrationsNeedingReview: 2 }} />);
    expect(singular).toContain("1 paid registration still needs review.");
    expect(plural).toContain("2 paid registrations still need review.");
    expect(singular).not.toContain("still need identity review");
    expect(plural).not.toContain("still need identity review");
  });

  it("enables collapse only on Registration Review", () => {
    const review = readFileSync("app/admin/registration-review/page.tsx", "utf8");
    const financial = readFileSync("app/admin/financial-summary/page.tsx", "utf8");
    const component = readFileSync("components/admin/TournamentFundsSummary.tsx", "utf8");
    expect(review).toContain("<TournamentFundsSummary summary={collectionSummary} className=\"mt-5\" collapsible />");
    expect(financial).toContain("<TournamentFundsSummary summary={summary} className=\"mt-5\" />");
    expect(component).toContain("aria-expanded={expanded}");
    expect(component).toContain('expanded ? "Collapse" : "Expand"');
  });
});
