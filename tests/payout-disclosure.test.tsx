import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  renderPayoutReadyDashboardFixture,
  renderStaleFinalChecksDashboardFixture,
} from "@/tests/admin-dashboard-fixture";

describe("Generate Checks disclosures", () => {
  it("renders one ordered payout report with collapsible categories", () => {
    const markup = renderPayoutReadyDashboardFixture();
    for (const label of [
      "Checks to Write",
      "Base Tournament",
      "Bronze Pot",
      "Silver Pot",
      "Gold Pot",
      "Big Bass — 1st Place",
      "Big Bass — 2nd Place",
      "Insurance Pot",
    ]) {
      expect(markup).toContain(label);
    }
    expect(markup).not.toContain("Reconciliation");
  });

  it("uses an accessible reusable disclosure control", () => {
    const source = readFileSync("components/admin/AdminDisclosureToggle.tsx", "utf8");
    expect(source).toContain('type="button"');
    expect(source).toContain("aria-expanded={expanded}");
    expect(source).toContain("aria-controls={controls}");
    expect(source).toContain('expanded ?');
    expect(source).toContain('Collapse');
    expect(source).toContain('Expand');
  });

  it("uses matching top and bottom parent disclosure buttons without category toggles", () => {
    const source = readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8");
    const toggleSource = readFileSync("components/admin/AdminDisclosureToggle.tsx", "utf8");
    expect(toggleSource).toContain("aria-expanded={expanded}");
    expect(toggleSource).toContain("aria-controls={controls}");
    expect(source.match(/controls="weighfish-payout-review"/g)).toHaveLength(2);
    expect(source.match(/controls="final-checks"/g)).toHaveLength(2);
    expect(source.match(/setReviewExpanded\(\(current\) => !current\)/g)).toHaveLength(2);
    expect(source.match(/setFinalExpanded\(\(current\) => !current\)/g)).toHaveLength(2);
    expect(source.match(/<AdminDisclosureToggle/g)).toHaveLength(4);
    expect(source).not.toContain("controlsId");
    expect(source).toContain("money(total)");
    expect(source).toContain("Generate Checks");
    expect(source).toContain("Tournament Payout Total:");
    expect(source).toContain("I have reviewed these payouts against WeighFish and confirm they are correct.");
    expect(source).toContain("Insurance Pot changes were saved. Regenerate checks to include the latest Insurance Pot payouts.");
    expect(source).not.toContain('title="AITT Insurance Pot"');
  });

  it("keeps the required payout category order and one generated list", () => {
    const source = readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8");
    const order = [
      "Base Tournament",
      "Bronze Pot",
      "Silver Pot",
      "Gold Pot",
      "Big Bass — 1st Place",
      "Big Bass — 2nd Place",
    ];
    for (let index = 1; index < order.length; index += 1) {
      expect(source.indexOf(`\"${order[index - 1]}\"`)).toBeLessThan(source.indexOf(`\"${order[index]}\"`));
    }
    expect(source).toContain("Confirm Payout Review");
    expect(source).toContain("Generate Checks");
    expect(source).toContain("Payout Summary");
    expect(source).toContain("Checks Generated");
    expect(source).toContain("Checks to Write");
  });

  it("requires payout review and Insurance Pot completion before final checks", () => {
    const source = readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8");
    expect(source).toContain("const finalChecksStale = reviewConfirmed && insuranceComplete");
    expect(source).toContain("const canGenerateFinalChecks = reviewConfirmed && insuranceComplete && reviewChecks.length > 0");
    expect(source).toContain("const finalChecksCurrent = reviewConfirmed && insuranceComplete && areChecksCurrent(savedCloseoutChecks, currentFinalChecks)");
    expect(source).toContain('name="intent"');
    expect(source).toContain('value="review"');
    expect(source).toContain('value="final"');
    expect(source).toContain("finalCheckDisplayOrder");
  });

  it("enables regeneration when final checks are stale", () => {
    const markup = renderStaleFinalChecksDashboardFixture();
    expect(markup).toContain("Insurance Pot changes were saved. Regenerate checks to include the latest Insurance Pot payouts.");
    expect(markup).toContain("Regenerate Checks");
    expect(markup).not.toContain("Checks are ready to write.");
  });
});
