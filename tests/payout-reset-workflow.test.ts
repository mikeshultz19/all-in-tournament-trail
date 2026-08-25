import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("payout-only reset workflow", () => {
  const action = readFileSync("app/admin/tournament-manager/closeout/reset-actions.ts", "utf8");
  const control = readFileSync("components/admin/ResetPayoutCalculations.tsx", "utf8");

  it("clears generated payouts and the unpublished Insurance calculation and winners", () => {
    expect(action).toContain('rpc("reset_tournament_payout_workflow"');
    const migration = readFileSync("supabase/migrations/202608240002_reset_unpublished_insurance_with_payout_workflow.sql", "utf8");
    expect(migration).toContain("delete from public.on_site_tournament_closeouts");
    expect(migration).toContain("delete from public.tournament_insurance_pot_results");
    expect(migration).toContain("published = false");
    expect(migration).toContain("AITT_PUBLISHED_INSURANCE_RESET_PROTECTED");
  });

  it("preserves verified imported rows and verification evidence", () => {
    expect(action).not.toContain('from("tournament_result_entries").delete()');
    expect(action).not.toContain("results_verified_at");
    expect(action).not.toContain("weighfish_imported_at");
    expect(action).not.toContain('from("tournaments").delete()');
  });

  it("requires stronger acknowledgement for delivered checks or published results", () => {
    expect(action).toContain("official_results_publication_audit");
    expect(action).toContain('check.status === "delivered"');
    expect(action).toContain('formData.get("acknowledgeProtectedPayouts") !== "yes"');
    expect(control).toContain("Additional confirmation required");
  });

  it("explains the distinction from Reset Import and prevents duplicate submission", () => {
    expect(control).toContain("Reset payout calculations?");
    expect(control).toContain("Your verified WeighFish import will remain available");
    expect(control).toContain("Your verified WeighFish import is not affected.");
    expect(control).toContain("Reset Payout Calculations");
    expect(control).toContain("Start Over");
    expect(control).toContain("disabled={pending");
    expect(control).toContain("clear all payout calculations and Insurance Pot work");
  });
});
