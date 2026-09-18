import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import TournamentFundsSummary from "@/components/admin/TournamentFundsSummary";

describe("Tournament Funds Summary", () => {
  it("uses the shared summary and presents purchased membership count and amount", () => {
    const summary = {
      tournamentId: "tournament-1", lines: [
        ...(["base", "big_bass", "bronze", "silver", "gold", "insurance"] as const).map((key) => ({ key, label: key, count: 0, onlineCount: 0, inPersonCount: 0, configuredFeeCents: 0, feeCents: 0, totalCents: 0 })),
        { key: "membership" as const, label: "Memberships Collected", count: 6, onlineCount: 3, inPersonCount: 3, configuredFeeCents: 4000, feeCents: 4000, totalCents: 24000 },
      ], totalCollectedCents: 0, totalTournamentPayoutFundsCents: 0, membershipRevenueCents: 24000, totalRegistrationFundsCollectedCents: 24000, onlineRegistrationFundsCents: 12000, walkUpFundsByMethod: { cash: 0, card: 0, other: 0 }, paidEntries: 3, confirmedPaidEntries: 3, registrationsNeedingReview: 0, morningCandidates: [], missing: [],
    };
    expect(renderToStaticMarkup(<TournamentFundsSummary summary={summary} />)).toContain("6 — $240.00");
  });

  it("keeps Financial Summary authenticated and linked from the Admin Console", () => {
    expect(readFileSync("app/admin/financial-summary/page.tsx", "utf8")).toContain("requireAdminUser");
    expect(readFileSync("app/admin/financial-summary/page.tsx", "utf8")).toContain("listTournamentCollectionSummaries");
    expect(readFileSync("components/admin/AdminSidebar.tsx", "utf8")).toContain('href: "/admin/financial-summary"');
  });

  it("uses the shared membership reconciliation for the Members page", () => {
    const membersPage = readFileSync("app/admin/members/page.tsx", "utf8");
    expect(membersPage).toContain("listTournamentCollectionSummaries");
    expect(membersPage).toContain("NEW MEMBERSHIPS PURCHASED HERE");
    expect(membersPage).toContain("MEMBERSHIP CHARGES COLLECTED");
  });
});
