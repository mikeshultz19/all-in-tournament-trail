import { describe, expect, it } from "vitest";

import { applyMorningCollectionReview, buildTournamentCollectionSummary } from "@/lib/tournament-collection-calculator";
import { renderPayoutReadyDashboardFixture } from "@/tests/admin-dashboard-fixture";

const insurance = { id: "insurance", tournament_id: "tournament-1", entry_count: 20, total_pot_cents: 40000, places_paid: 4, calculated_payouts: [10000, 10000, 10000, 10000], winners: [], published: false, published_at: null, created_at: "", updated_at: "" };
const snapshot = (...lineItems: Array<[string, number]>) => ({ lineItems: lineItems.map(([name, priceCents]) => ({ name, priceCents })) });

describe("automatic tournament collection reconciliation", () => {
  it("calculates configured entry and side-pot collections from confirmed paid registrations", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [
      { tournament_id: "tournament-1", payment_reference: "pay-1", identity_review_status: "verified", member_pot: "bronze", big_bass: true, price_snapshot: snapshot(["Tournament Entry", 6000], ["Bronze Pot", 4000], ["Big Bass", 2000]) },
      { tournament_id: "tournament-1", payment_reference: "pay-2", identity_review_status: "verified", member_pot: "silver", big_bass: true, price_snapshot: snapshot(["Tournament Entry", 6000], ["Silver Pot", 10000], ["Big Bass", 2000]) },
      { tournament_id: "tournament-1", payment_reference: "pay-3", identity_review_status: "verified", member_pot: null, big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000]) },
    ], insurance);
    expect(summary.lines.map((line) => [line.key, line.count, line.feeCents, line.totalCents])).toEqual([
      ["base", 3, 6000, 18000], ["bronze", 1, 4000, 4000], ["silver", 1, 10000, 10000], ["gold", 0, 50000, 0], ["big_bass", 2, 2000, 4000], ["membership", 0, 4000, 0], ["insurance", 20, 2000, 40000],
    ]);
    expect(summary.totalCollectedCents).toBe(76000);
    expect(summary.missing).toEqual([]);
  });

  it("does not silently count unresolved paid registrations or a missing Insurance calculation as zero", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{ tournament_id: "tournament-1", payment_reference: "pay-review", identity_review_status: "review_required", member_pot: "gold", big_bass: true, price_snapshot: snapshot(["Tournament Entry", 6000], ["Gold Pot", 50000], ["Big Bass", 2000]) }]);
    expect(summary.confirmedPaidEntries).toBe(0);
    expect(summary.missing.join(" ")).toContain("Registration review");
    expect(summary.missing.join(" ")).toContain("Insurance Pot entry count");
  });

  it("includes paid online memberships recorded in the registration price snapshot", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{ tournament_id: "tournament-1", payment_reference: "paid", identity_review_status: "verified", member_pot: null, big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000], ["Angler 2 Membership", 4000]) }], insurance);
    expect(summary.lines.find((line) => line.key === "membership")).toMatchObject({ onlineCount: 2, totalCents: 8000 });
  });

  it("keeps collection arithmetic out of the simplified payout UI", () => {
    const markup = renderPayoutReadyDashboardFixture();
    expect(markup).not.toContain("Tournament Funds Collected");
    expect(markup).toContain("Base Tournament");
    expect(markup).toContain("Insurance Pot");
    expect(markup).not.toContain('name="totalCollected" type="number"');
    expect(markup).not.toContain('name="trailRetained" type="number"');
  });

  it("matches the same online team by registration id without double-counting it", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{ id: "reg-1", tournament_id: "tournament-1", registration_type: "team", angler1_name: "Smith", angler2_name: "Jones", payment_reference: "paid", identity_review_status: "verified", member_pot: "bronze", big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000], ["Bronze Pot", 4000]) }], insurance, [{ id: "result-1", tournament_id: "tournament-1", registration_id: "reg-1", team_name: "Team Smith / Jones", participation_status: "participated" }]);
    expect(summary.lines.find((line) => line.key === "base")?.onlineCount).toBe(1);
    expect(summary.morningCandidates[0]).toMatchObject({ matchStatus: "matched", registrationId: "reg-1", onlineCategories: ["base", "bronze"] });
  });

  it("flags ambiguous names and isolates registrations and results by tournament", () => {
    const shared = { payment_reference: "paid", identity_review_status: "verified", member_pot: null, big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000]), registration_type: "team" as const, angler1_name: "Smith", angler2_name: "Jones" };
    const summary = buildTournamentCollectionSummary("tournament-1", [{ ...shared, id: "reg-1", tournament_id: "tournament-1" }, { ...shared, id: "reg-2", tournament_id: "tournament-1" }, { ...shared, id: "other", tournament_id: "tournament-2" }], insurance, [{ id: "result-1", tournament_id: "tournament-1", team_name: "Jones / Smith", participation_status: "participated" }, { id: "other-result", tournament_id: "tournament-2", team_name: "Other Team", participation_status: "participated" }]);
    expect(summary.morningCandidates).toHaveLength(1);
    expect(summary.morningCandidates[0].matchStatus).toBe("ambiguous");
    expect(summary.lines.find((line) => line.key === "base")?.onlineCount).toBe(2);
  });

  it("identifies a verified in-person-only entry for operator payment confirmation", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [], insurance, [{ id: "morning-1", tournament_id: "tournament-1", team_name: "Brown / Davis", participation_status: "participated" }]);
    expect(summary.morningCandidates[0]).toMatchObject({ entryName: "Brown / Davis", matchStatus: "unmatched", onlineCategories: [] });
  });

  it("adds confirmed morning base and multiple pots while retaining separate Insurance calculation", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [], insurance, [{ id: "morning-1", tournament_id: "tournament-1", team_name: "Brown / Davis", participation_status: "participated" }]);
    const lines = applyMorningCollectionReview(summary, { "morning-1": { confirmed: true, categories: ["base", "silver", "gold", "big_bass"] } });
    expect(lines.filter((line) => line.count > 0).map((line) => [line.key, line.onlineCount, line.inPersonCount, line.totalCents])).toEqual([
      ["base", 0, 1, 6000], ["silver", 0, 1, 10000], ["gold", 0, 1, 50000], ["big_bass", 0, 1, 2000], ["insurance", 0, 20, 40000],
    ]);
  });

  it("counts only a new morning pot for an online base entry", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{ id: "reg-1", tournament_id: "tournament-1", registration_type: "team", angler1_name: "Smith", angler2_name: "Jones", payment_reference: "paid", identity_review_status: "verified", member_pot: null, big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000]) }], insurance, [{ id: "result-1", tournament_id: "tournament-1", registration_id: "reg-1", team_name: "Smith / Jones", participation_status: "participated" }]);
    const lines = applyMorningCollectionReview(summary, { "result-1": { confirmed: true, categories: ["base", "bronze"] } });
    expect(lines.find((line) => line.key === "base")).toMatchObject({ onlineCount: 1, inPersonCount: 0, totalCents: 6000 });
    expect(lines.find((line) => line.key === "bronze")).toMatchObject({ onlineCount: 0, inPersonCount: 1, totalCents: 4000 });
  });
});
