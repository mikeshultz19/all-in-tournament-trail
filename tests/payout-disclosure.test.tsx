import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import {
  renderPayoutReadyDashboardFixture,
  renderStaleFinalChecksDashboardFixture,
} from "@/tests/admin-dashboard-fixture";

describe("Payout Summary disclosures", () => {
  it("renders one ordered payout report with collapsible categories", () => {
    const markup = renderPayoutReadyDashboardFixture();

    expect(markup).toContain("Payout Summary");
    expect(markup).toContain("Base Tournament");
    expect(markup).toContain("Bronze Pot");
    expect(markup).toContain("Silver Pot");
    expect(markup).toContain("Gold Pot");
    expect(markup).toContain("Big Bass");
    expect(markup).toContain("1st Place");
    expect(markup).toContain("2nd Place");
    expect(markup).toContain("APPROVE PAYOUTS");
    expect(markup).not.toContain("Reconciliation");
  });

  it("uses an accessible reusable disclosure control", () => {
    const source = readFileSync("components/admin/AdminDisclosureToggle.tsx", "utf8");
    expect(source).toContain('type="button"');
    expect(source).toContain("aria-expanded={expanded}");
    expect(source).toContain("aria-controls={controls}");
    expect(source).toContain("expanded ?");
    expect(source).toContain("Collapse");
    expect(source).toContain("Expand");
  });

  it("uses matching top and bottom parent disclosure buttons without category toggles", () => {
    const source = readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8");
    const toggleSource = readFileSync("components/admin/AdminDisclosureToggle.tsx", "utf8");
    expect(toggleSource).toContain("aria-expanded={expanded}");
    expect(toggleSource).toContain("aria-controls={controls}");
    expect(source.match(/controls="weighfish-payout-review"/g)).toHaveLength(1);
    expect(source.match(/setReviewExpanded\(\(current\) => !current\)/g)).toHaveLength(1);
    expect(source.match(/<AdminDisclosureToggle/g)).toHaveLength(1);
    expect(source).not.toContain("controlsId");
    expect(source).toContain("money(total)");
    expect(source).toContain("Payout Summary");
    expect(source).toContain("APPROVE PAYOUTS");
    expect(source).toContain("I have reviewed these payouts against WeighFish and confirm they are correct.");
    expect(source).toContain("Closeout complete. Publish Results can proceed.");
    expect(source).not.toContain('title="AITT Insurance Pot"');
  });

  it("keeps the required payout category order and one generated list", () => {
    const source = readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8");
    expect(source).toContain("APPROVE PAYOUTS");
    expect(source).toContain("Payout Summary");
    expect(source).toContain("Closeout Complete");
    expect(source).toContain('const payoutCategories = [');
    expect(source).toContain('"Base Tournament"');
    expect(source).toContain('"Bronze Pot"');
    expect(source).toContain('"Silver Pot"');
    expect(source).toContain('"Gold Pot"');
    expect(source).toContain('"Big Bass"');
  });

  it("requires payout review and Insurance Pot completion before approval", () => {
    const source = readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8");
    expect(source).toContain("const finalChecksStale = closeoutApproved && insuranceComplete");
    expect(source).toContain("const approvalReady = reviewAcknowledged && insuranceComplete && reviewChecks.length > 0 && !finalChecksCurrent");
    expect(source).toContain("const finalChecksCurrent = closeoutApproved && insuranceComplete && areChecksCurrent(savedCloseoutChecks, currentFinalChecks)");
    expect(source).toContain('name="intent"');
    expect(source).toContain('value="approve"');
    expect(source).toContain("APPROVE PAYOUTS");
  });

  it("enables regeneration when final checks are stale", () => {
    const markup = renderStaleFinalChecksDashboardFixture();
    expect(markup).toContain("Saved closeout needs approval again because the payout totals changed.");
    expect(markup).toContain("APPROVE PAYOUTS");
    expect(markup).not.toContain("Closeout Complete");
  });
});
