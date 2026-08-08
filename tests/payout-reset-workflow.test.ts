import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("payout-only reset workflow", () => {
  const action = readFileSync("app/admin/tournament-manager/closeout/reset-actions.ts", "utf8");
  const control = readFileSync("components/admin/ResetPayoutCalculations.tsx", "utf8");

  it("clears generated payouts and the unpublished Insurance calculation and winners", () => {
    expect(action).toContain('.from("on_site_tournament_closeouts").delete().eq("tournament_id", tournamentId)');
    expect(action).not.toContain('.from("tournament_insurance_pot_results").delete().eq("tournament_id", tournamentId).eq("published", false)');
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
