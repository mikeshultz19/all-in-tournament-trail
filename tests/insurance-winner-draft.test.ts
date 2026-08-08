import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("manual Insurance Pot winner draft workflow", () => {
  const component = readFileSync("components/admin/InsuranceResultsPublisher.tsx", "utf8");
  const action = readFileSync("app/admin/tournament-manager/insurance/results/actions.ts", "utf8");
  const persistence = readFileSync("lib/insurance-pot-results.ts", "utf8");
  const publish = readFileSync("app/admin/tournament-manager/publish/actions.ts", "utf8");

  it("requires complete manual rows and rejects duplicates", () => {
    expect(component).toContain("completeWinners");
    expect(component).toContain("hasDuplicate");
    expect(component).toContain("difference !== 0");
    expect(action).toContain("validateInsurancePotResult(result)");
  });

  it("rejects finishing positions inside Base Tournament money", () => {
    expect(component).toContain("insideBaseMoney");
    expect(component).toContain("Every Insurance Pot winner must finish outside the Base Tournament payout positions.");
    expect(action).toContain('.gt("base_payout", 0)');
    expect(action).toContain("(winner.finishingPosition ?? 0) <= cutoff");
  });

  it("saves an unpublished draft for later Results publishing", () => {
    expect(action).toContain("saveTournamentInsurancePotWinnerDraft");
    expect(persistence).toContain('.eq("published", false)');
    expect(action).not.toContain("publishTournamentInsurancePotResult");
    expect(publish).toContain("publishTournamentInsurancePotResult");
  });

  it("shows saved counts and exact assigned/remaining totals", () => {
    expect(component).toContain("Results Saved");
    expect(component).toContain("Winners Entered");
    expect(component).toContain("Assigned");
    expect(component).toContain("Remaining");
    expect(component).toContain("Edit Results");
    expect(component).toContain("Return to Insurance Pot");
  });
});
