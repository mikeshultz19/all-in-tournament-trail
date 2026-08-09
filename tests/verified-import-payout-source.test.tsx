import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  renderPayoutLockedDashboardFixture,
  renderPayoutReadyDashboardFixture,
} from "@/tests/admin-dashboard-fixture";

describe("verified import payout source", () => {
  it("loads the selected tournament's persisted verified rows directly in Step 3", () => {
    const markup = renderPayoutReadyDashboardFixture();

    expect(markup).toContain("Verified Results");
    expect(markup).toContain("Entries");
    expect(markup).toContain("Smith / Jones");
    expect(markup).not.toContain("Choose WeighFish CSV");
    expect(markup).not.toContain('type="file"');
    expect(markup).toContain("Checks to Write");
    expect(markup).not.toContain("Reconciliation");
    expect(markup).toContain("Checks Generated");
  });

  it("shows prerequisite guidance instead of an uploader without a verified import", () => {
    const markup = renderPayoutLockedDashboardFixture();

    expect(markup).toContain("Complete the Import Results step before calculating the Insurance Pot.");
    expect(markup).toContain("Verify imported results first, then return here to calculate and save Insurance Pot winners.");
    expect(markup).toContain("Go to Insurance Pot");
    expect(markup).toContain("step=3");
    expect(markup).not.toContain("Choose WeighFish CSV");
    expect(markup).not.toContain('type="file"');
  });

  it("does not retain a standalone parser or file-selection path in the payout calculator", () => {
    const source = readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8");

    expect(source).not.toContain("parseWeighfishCsv");
    expect(source).not.toContain('type="file"');
    expect(source).not.toContain("Choose WeighFish CSV");
    expect(source).toContain("initialImportedRows");
    expect(source).toContain('"Verified Tournament Payouts"');
    expect(source).toContain('"Final Tournament Checks"');
  });

  it("keeps Insurance Pot separate from the verified WeighFish metadata", () => {
    const source = readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8");
    expect(source).toContain("insuranceResult?.calculated_payouts");
    expect(source).toContain('category: "AITT Insurance Pot"');
    expect(source).toContain("Complete Tournament");
    expect(source).not.toContain("Enter the Insurance Pot winners in Calculate Payouts");
    expect(source).toContain("Checks Generated");
  });

  it("keeps reset responsible for invalidating both imported rows and derived payouts", () => {
    const resetMigration = readFileSync(
      "supabase/migrations/202608020004_add_import_verification_and_reset.sql",
      "utf8",
    );

    expect(resetMigration).toContain("delete from public.tournament_result_entries");
    expect(resetMigration).toContain("delete from public.on_site_tournament_closeouts");
    expect(resetMigration).toContain("results_verified_at = null");
  });
});
