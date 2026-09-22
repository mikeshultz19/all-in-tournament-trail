import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { applyMorningCollectionReview, buildTournamentCollectionSummary } from "@/lib/tournament-collection-calculator";
import { renderPayoutReadyDashboardFixture } from "@/tests/admin-dashboard-fixture";

const insurance = { id: "insurance", tournament_id: "tournament-1", entry_count: 20, total_pot_cents: 40000, places_paid: 4, calculated_payouts: [10000, 10000, 10000, 10000], winners: [], published: false, published_at: null, created_at: "", updated_at: "" };
const snapshot = (...lineItems: Array<[string, number]>) => ({ lineItems: lineItems.map(([name, priceCents]) => ({ name, priceCents })) });
const collectedOnline = (overrides: Record<string, unknown> = {}) => ({ tournament_id: "tournament-1", payment_reference: "paid", identity_review_status: "verified", registration_source: "online" as const, online_payment_state: "completed" as const, square_payment_id: "sq-1", member_pot: null, big_bass: false, insurance: false, price_snapshot: snapshot(["Tournament Entry", 6000]), ...overrides });

describe("automatic tournament collection reconciliation", () => {
  it("ignores a stale historical non-member classification when active membership is verified", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{
      id: "normalized-historical",
      tournament_id: "tournament-1",
      angler1_id: "angler-1",
      payment_reference: "paid",
      identity_review_status: "verified",
      member_pot: null,
      big_bass: false,
      price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000]),
      membership_snapshot: [{ submittedClassification: "non-member", resolvedClassification: "non-member" }],
    }], undefined, [], new Set(["angler-1"]));
    expect(summary.membershipMismatchCount).toBe(0);
    expect(summary.membershipReconciliationWarnings).toEqual([]);
    expect(summary.membershipRevenueCents).toBe(4000);
  });

  it("retains a genuine membership payment mismatch without an active member", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{
      id: "unverified-charge",
      tournament_id: "tournament-1",
      angler1_id: "angler-1",
      payment_reference: "paid",
      identity_review_status: "verified",
      member_pot: null,
      big_bass: false,
      price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000]),
      membership_snapshot: [{ submittedClassification: "non-member", resolvedClassification: "non-member" }],
    }]);
    expect(summary.membershipMismatchCount).toBe(1);
    expect(summary.membershipReconciliationWarnings).toHaveLength(1);
    expect(summary.membershipRevenueCents).toBe(4000);
  });

  it("keeps an unresolved Current Member claim at zero collected membership revenue", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{
      id: "reg-review",
      tournament_id: "tournament-1",
      payment_reference: "paid",
      identity_review_status: "review_required",
      member_pot: "gold",
      big_bass: false,
      price_snapshot: snapshot(["Tournament Entry", 6000], ["Gold Pot", 50000]),
      membership_snapshot: [{ submittedClassification: "current" }],
    }]);
    expect(summary.membershipRevenueCents).toBe(0);
    expect(summary.totalTournamentPayoutFundsCents).toBe(56000);
    expect(summary.totalRegistrationFundsCollectedCents).toBe(56000);
    expect(summary).not.toHaveProperty("unresolvedMembershipShortfallCents");
  });

  it("does not create hypothetical membership money from member-only selections or review resolution", () => {
    const unresolved = buildTournamentCollectionSummary("tournament-1", [{
      id: "reg-unresolved",
      tournament_id: "tournament-1",
      payment_reference: "paid",
      identity_review_status: "review_required",
      member_pot: "bronze",
      big_bass: false,
      price_snapshot: snapshot(["Tournament Entry", 6000]),
      membership_snapshot: [{ submittedClassification: "current" }],
    }]);
    expect(unresolved.membershipRevenueCents).toBe(0);

    const confirmed = buildTournamentCollectionSummary("tournament-1", [{
      id: "reg-unresolved",
      tournament_id: "tournament-1",
      payment_reference: "paid",
      identity_review_status: "verified",
      member_pot: null,
      big_bass: false,
      price_snapshot: snapshot(["Tournament Entry", 6000]),
      membership_snapshot: [{ submittedClassification: "current", resolvedClassification: "current" }],
    }]);
    expect(confirmed.membershipRevenueCents).toBe(0);
    expect(confirmed.totalRegistrationFundsCollectedCents).toBe(6000);
  });

  it("counts an administrator-confirmed joining decision when the original line is missing", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [collectedOnline({
      membership_snapshot: [{ submittedClassification: "current", resolvedClassification: "joining" }],
      price_snapshot: snapshot(["Tournament Entry", 6000]),
    })]);
    expect(summary.lines.find((line) => line.key === "membership")).toMatchObject({ count: 1, totalCents: 4000 });
    expect(summary.membershipRevenueCents).toBe(4000);
  });

  it("does not double-count an administrator-confirmed joining decision with an original line", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [collectedOnline({
      membership_snapshot: [{ submittedClassification: "current", resolvedClassification: "joining" }],
      price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000]),
    })]);
    expect(summary.lines.find((line) => line.key === "membership")).toMatchObject({ count: 1, totalCents: 4000 });
    expect(summary.membershipRevenueCents).toBe(4000);
  });

  it("counts two individually confirmed joining anglers without double-counting one original line", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [collectedOnline({
      membership_snapshot: [
        { submittedClassification: "current", resolvedClassification: "joining" },
        { submittedClassification: "current", resolvedClassification: "joining" },
      ],
      price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000]),
    })]);
    expect(summary.lines.find((line) => line.key === "membership")).toMatchObject({ count: 2, totalCents: 8000 });
    expect(summary.membershipRevenueCents).toBe(8000);
  });

  it("calculates configured entry and side-pot collections from confirmed paid registrations", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [
      { tournament_id: "tournament-1", payment_reference: "pay-1", identity_review_status: "verified", member_pot: "bronze", big_bass: true, price_snapshot: snapshot(["Tournament Entry", 6000], ["Bronze Pot", 4000], ["Big Bass", 2000]) },
      { tournament_id: "tournament-1", payment_reference: "pay-2", identity_review_status: "verified", member_pot: "silver", big_bass: true, price_snapshot: snapshot(["Tournament Entry", 6000], ["Silver Pot", 10000], ["Big Bass", 2000]) },
      { tournament_id: "tournament-1", payment_reference: "pay-3", identity_review_status: "verified", member_pot: null, big_bass: false, insurance: true, price_snapshot: snapshot(["Tournament Entry", 6000], ["Insurance Pot", 2000]) },
    ], insurance);
    expect(summary.lines.map((line) => [line.key, line.count, line.feeCents, line.totalCents])).toEqual([
      ["base", 3, 6000, 18000], ["bronze", 1, 4000, 4000], ["silver", 1, 10000, 10000], ["gold", 0, 50000, 0], ["big_bass", 2, 2000, 4000], ["membership", 0, 4000, 0], ["insurance", 1, 2000, 2000],
    ]);
    expect(summary.totalCollectedCents).toBe(38000);
    expect(summary.missing).toEqual([]);
  });

  it("counts collected funds for a paid registration that still needs identity review", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{ tournament_id: "tournament-1", payment_reference: "pay-review", identity_review_status: "review_required", member_pot: "gold", big_bass: true, price_snapshot: snapshot(["Tournament Entry", 6000], ["Gold Pot", 50000], ["Big Bass", 2000]) }]);
    expect(summary.paidEntries).toBe(1);
    expect(summary.confirmedPaidEntries).toBe(0);
    expect(summary.registrationsNeedingReview).toBe(1);
    expect(summary.totalTournamentPayoutFundsCents).toBe(58000);
  });

  it("includes paid online memberships recorded in the registration price snapshot", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{ tournament_id: "tournament-1", payment_reference: "paid", identity_review_status: "verified", member_pot: null, big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000], ["Angler 2 Membership", 4000]) }], insurance);
    expect(summary.lines.find((line) => line.key === "membership")).toMatchObject({ count: 2, onlineCount: 2, totalCents: 8000 });
  });

  it("counts membership quantity from the authoritative membership amount", () => {
    const one = buildTournamentCollectionSummary("tournament-1", [{ tournament_id: "tournament-1", payment_reference: "paid", identity_review_status: "verified", member_pot: null, big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000]) }]);
    const two = buildTournamentCollectionSummary("tournament-1", [{ tournament_id: "tournament-1", payment_reference: "paid", identity_review_status: "verified", member_pot: null, big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 8000]) }]);
    expect(one.lines.find((line) => line.key === "membership")).toMatchObject({ count: 1, totalCents: 4000 });
    expect(two.lines.find((line) => line.key === "membership")).toMatchObject({ count: 2, totalCents: 8000 });
    const three = buildTournamentCollectionSummary("tournament-1", [1, 2, 3].map((id) => ({ id: `reg-${id}`, tournament_id: "tournament-1", payment_reference: `paid-${id}`, identity_review_status: "verified", member_pot: null, big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 8000]) })));
    expect(three.lines.find((line) => line.key === "membership")).toMatchObject({ count: 6, totalCents: 24000 });
  });

  it("adds walk-up joining anglers to online membership line items", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [
      collectedOnline({
        id: "online-1",
        membership_snapshot: [{ submittedClassification: "joining" }, { submittedClassification: "joining" }],
        price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000], ["Angler 2 Membership", 4000]),
      }),
      collectedOnline({
        id: "online-2",
        membership_snapshot: [{ submittedClassification: "joining" }],
        price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000]),
      }),
      collectedOnline({
        id: "walk-up-1",
        registration_source: "walk_up",
        payment_method: "card",
        online_payment_state: null,
        square_payment_id: null,
        membership_snapshot: [{ submittedClassification: "joining" }, { submittedClassification: "joining" }],
        price_snapshot: { lineItems: [{ code: "walk_up_total", name: "Walk-Up Registration", priceCents: 70070 }], totalCents: 70070 },
        member_pot: "gold",
        big_bass: true,
        insurance: true,
      }),
      collectedOnline({
        id: "walk-up-2",
        registration_source: "walk_up",
        payment_method: "cash",
        online_payment_state: null,
        square_payment_id: null,
        membership_snapshot: [{ submittedClassification: "joining" }],
        price_snapshot: { lineItems: [{ code: "walk_up_total", name: "Walk-Up Registration", priceCents: 18000 }], totalCents: 18000 },
        member_pot: "bronze",
        big_bass: true,
        insurance: true,
      }),
    ]);
    expect(summary.lines.find((line) => line.key === "membership")).toMatchObject({ count: 6, onlineCount: 3, inPersonCount: 3, totalCents: 24000 });
    expect(summary.membershipRevenueCents).toBe(24000);
    expect(summary.totalRegistrationFundsCollectedCents).toBe(110000);
  });

  it("separates expected memberships from anomalous collected charges", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [
      collectedOnline({
        id: "current-charged",
        membership_snapshot: [],
        price_snapshot: snapshot(["Tournament Entry", 6000], ["Angler 1 Membership", 4000]),
      }),
      collectedOnline({
        id: "joining-unitemized",
        membership_snapshot: [{ submittedClassification: "joining" }],
        price_snapshot: snapshot(["Tournament Entry", 6000]),
      }),
      collectedOnline({
        id: "joining-unpaid",
        payment_reference: null,
        membership_snapshot: [{ submittedClassification: "joining" }],
        price_snapshot: snapshot(["Tournament Entry", 6000]),
      }),
    ]);
    expect(summary.lines.find((line) => line.key === "membership")).toMatchObject({ count: 1, totalCents: 4000 });
    expect(summary.membershipRevenueCents).toBe(4000);
    expect(summary.membershipMismatchCount).toBe(3);
    expect(summary.membershipReconciliationWarnings).toHaveLength(1);
  });

  it("keeps collection arithmetic out of the simplified payout UI", () => {
    const markup = renderPayoutReadyDashboardFixture();
    expect(markup).toContain("Tournament Funds vs. Payout Checks");
    expect(markup).toContain("Unreconciled Difference");
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
      ["base", 0, 1, 6000], ["silver", 0, 1, 10000], ["gold", 0, 1, 50000], ["big_bass", 0, 1, 2000],
    ]);
  });

  it("counts only a new morning pot for an online base entry", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [{ id: "reg-1", tournament_id: "tournament-1", registration_type: "team", angler1_name: "Smith", angler2_name: "Jones", payment_reference: "paid", identity_review_status: "verified", member_pot: null, big_bass: false, price_snapshot: snapshot(["Tournament Entry", 6000]) }], insurance, [{ id: "result-1", tournament_id: "tournament-1", registration_id: "reg-1", team_name: "Smith / Jones", participation_status: "participated" }]);
    const lines = applyMorningCollectionReview(summary, { "result-1": { confirmed: true, categories: ["base", "bronze"] } });
    expect(lines.find((line) => line.key === "base")).toMatchObject({ onlineCount: 1, inPersonCount: 0, totalCents: 6000 });
    expect(lines.find((line) => line.key === "bronze")).toMatchObject({ onlineCount: 0, inPersonCount: 1, totalCents: 4000 });
  });

  it("separates payout funds and membership revenue while excluding Square fees", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [collectedOnline({
      member_pot: "gold",
      big_bass: true,
      insurance: true,
      membership_snapshot: [{ submittedClassification: "joining" }],
      price_snapshot: { ...snapshot(["Angler 1 Membership", 4000], ["Tournament Entry", 6000], ["Gold Pot", 50000], ["Big Bass", 2000], ["Insurance Pot", 2000]), cardProcessingFeeCents: 1830, totalCents: 61830 },
    })]);
    expect(summary.totalTournamentPayoutFundsCents).toBe(60000);
    expect(summary.membershipRevenueCents).toBe(4000);
    expect(summary.totalRegistrationFundsCollectedCents).toBe(64000);
    expect(summary.lines.map((line) => [line.key, line.totalCents])).toEqual([
      ["base", 6000], ["bronze", 0], ["silver", 0], ["gold", 50000], ["big_bass", 2000], ["membership", 4000], ["insurance", 2000],
    ]);
  });

  it("excludes a valid walk-up card fee from tournament and membership funds", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [collectedOnline({
      registration_source: "walk_up",
      payment_method: "card",
      payment_reference: "walk-card-valid",
      online_payment_state: null,
      square_payment_id: null,
      membership_snapshot: [{ submittedClassification: "joining", resolvedClassification: "joining" }],
      price_snapshot: {
        ...snapshot(["Angler 1 Membership", 4000], ["Tournament Entry", 6000]),
        cardProcessingFeeCents: 330,
        totalCents: 10330,
      },
    })]);
    expect(summary.totalTournamentPayoutFundsCents).toBe(6000);
    expect(summary.membershipRevenueCents).toBe(4000);
    expect(summary.totalRegistrationFundsCollectedCents).toBe(10000);
    expect(summary.walkUpFundsByMethod.card).toBe(10000);
    expect(summary.missing).not.toContain("One or more walk-up payment snapshots differ from face-value selections (review payment records)");
  });

  it("preserves the warning for malformed historical walk-up payment snapshots", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [collectedOnline({
      registration_source: "walk_up",
      payment_method: "cash",
      payment_reference: "walk-cash-malformed",
      online_payment_state: null,
      square_payment_id: null,
      price_snapshot: {
        ...snapshot(["Tournament Entry", 6000]),
        cardProcessingFeeCents: 210,
        totalCents: 6210,
      },
    })]);
    expect(summary.totalTournamentPayoutFundsCents).toBe(6000);
    expect(summary.walkUpFundsByMethod.cash).toBe(6000);
    expect(summary.missing).toContain("One or more walk-up payment snapshots differ from face-value selections (review payment records)");
  });

  it("classifies walk-up cash, card, and other funds from selections", () => {
    const rows = [
      collectedOnline({ registration_source: "walk_up", payment_method: "cash", payment_reference: "cash-1", online_payment_state: null, square_payment_id: null, member_pot: "bronze", price_snapshot: {} }),
      collectedOnline({ registration_source: "walk_up", payment_method: "card", payment_reference: "card-1", online_payment_state: null, square_payment_id: null, big_bass: true, price_snapshot: {} }),
      collectedOnline({ registration_source: "walk_up", payment_method: "other", payment_reference: "other-1", online_payment_state: null, square_payment_id: null, insurance: true, price_snapshot: {} }),
    ];
    const summary = buildTournamentCollectionSummary("tournament-1", rows);
    expect(summary.walkUpFundsByMethod).toEqual({ cash: 10000, card: 8000, other: 8000 });
    expect(summary.onlineRegistrationFundsCents).toBe(0);
  });

  it("excludes failed, cancelled, abandoned, and unpaid rows", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [
      collectedOnline(),
      collectedOnline({ payment_reference: null }),
      collectedOnline({ online_payment_state: null, square_payment_id: null }),
      collectedOnline({ registration_status: "cancelled" }),
      collectedOnline({ payment_reference: "failed", online_payment_state: "failed", square_payment_id: "sq-failed" }),
    ]);
    expect(summary.paidEntries).toBe(1);
    expect(summary.totalTournamentPayoutFundsCents).toBe(6000);
  });

  it("keeps collected totals unchanged for Checked In and DQ states", () => {
    const summary = buildTournamentCollectionSummary("tournament-1", [
      collectedOnline({ id: "checked-in", checked_in_at: "2026-09-16T08:00:00Z" }),
      collectedOnline({ id: "dq", participation_status: "disqualified" }),
    ]);
    expect(summary.paidEntries).toBe(2);
    expect(summary.totalTournamentPayoutFundsCents).toBe(12000);
  });

  it("uses the complete roster before pagination for a 101-registration field", () => {
    const rows = Array.from({ length: 101 }, (_, index) => collectedOnline({ id: `registration-${index + 1}` }));
    const full = buildTournamentCollectionSummary("tournament-1", rows);
    const pageTotals = [25, 25, 25, 25, 1].map((start) => {
      void start;
      return buildTournamentCollectionSummary("tournament-1", rows).totalRegistrationFundsCollectedCents;
    });
    expect(full.paidEntries).toBe(101);
    expect(full.totalTournamentPayoutFundsCents).toBe(606000);
    expect(new Set(pageTotals)).toEqual(new Set([full.totalRegistrationFundsCollectedCents]));
  });

  it("reproduces the deterministic 14-entry Ray Hubbard staging totals", () => {
    const online = [
      ["Angler 1 Membership", 4000], ["Angler 2 Membership", 4000], ["Tournament Entry", 6000], ["Bronze Pot", 4000], ["Big Bass", 2000], ["Insurance Pot", 2000],
      ["Tournament Entry", 6000], ["Big Bass", 2000],
      ["Angler 1 Membership", 4000], ["Tournament Entry", 6000], ["Silver Pot", 10000], ["Big Bass", 2000], ["Insurance Pot", 2000],
      ["Tournament Entry", 6000], ["Big Bass", 2000],
      ["Tournament Entry", 6000], ["Gold Pot", 50000], ["Big Bass", 2000], ["Insurance Pot", 2000],
      ["Tournament Entry", 6000], ["Big Bass", 2000],
      ["Tournament Entry", 6000], ["Silver Pot", 10000], ["Big Bass", 2000],
      ["Tournament Entry", 6000], ["Gold Pot", 50000], ["Big Bass", 2000], ["Insurance Pot", 2000],
      ["Tournament Entry", 6000], ["Big Bass", 2000],
    ];
    const snapshots = [snapshot(...online.slice(0, 6) as [string, number][]), snapshot(...online.slice(6, 8) as [string, number][]), snapshot(...online.slice(8, 13) as [string, number][]), snapshot(...online.slice(13, 15) as [string, number][]), snapshot(...online.slice(15, 19) as [string, number][]), snapshot(...online.slice(19, 21) as [string, number][]), snapshot(...online.slice(21, 24) as [string, number][]), snapshot(...online.slice(24, 28) as [string, number][]), snapshot(...online.slice(28, 30) as [string, number][])];
    const onlineRows = snapshots.map((price_snapshot, index) => collectedOnline({ id: `online-${index}`, member_pot: index === 0 ? "bronze" : index === 2 || index === 6 ? "silver" : index === 4 || index === 7 ? "gold" : null, big_bass: true, insurance: [0, 2, 4, 7].includes(index), price_snapshot }));
    const walkUps = [
      collectedOnline({ id: "walk-card", registration_source: "walk_up", payment_method: "card", payment_reference: "walk-card", online_payment_state: null, square_payment_id: null, member_pot: "gold", big_bass: true, insurance: true, price_snapshot: {} }),
      collectedOnline({ id: "walk-cash-bronze", registration_source: "walk_up", payment_method: "cash", payment_reference: "walk-cash-bronze", online_payment_state: null, square_payment_id: null, member_pot: "bronze", big_bass: true, insurance: true, price_snapshot: {} }),
      collectedOnline({ id: "walk-cash-silver-1", registration_source: "walk_up", payment_method: "cash", payment_reference: "walk-cash-silver-1", online_payment_state: null, square_payment_id: null, member_pot: "silver", big_bass: true, price_snapshot: {} }),
      collectedOnline({ id: "walk-cash-silver-2", registration_source: "walk_up", payment_method: "cash", payment_reference: "walk-cash-silver-2", online_payment_state: null, square_payment_id: null, member_pot: "silver", big_bass: true, price_snapshot: {} }),
      collectedOnline({ id: "walk-cash-silver-3", registration_source: "walk_up", payment_method: "cash", payment_reference: "walk-cash-silver-3", online_payment_state: null, square_payment_id: null, member_pot: "silver", big_bass: true, insurance: true, price_snapshot: {} }),
    ];
    const summary = buildTournamentCollectionSummary("tournament-1", [...onlineRows, ...walkUps]);
    expect(summary.lines.map((line) => [line.key, line.totalCents])).toEqual([["base", 84000], ["bronze", 8000], ["silver", 50000], ["gold", 150000], ["big_bass", 28000], ["membership", 12000], ["insurance", 14000]]);
    expect(summary.onlineRegistrationFundsCents).toBe(216000);
    expect(summary.walkUpFundsByMethod).toEqual({ cash: 70000, card: 60000, other: 0 });
    expect(summary.totalTournamentPayoutFundsCents).toBe(334000);
    expect(summary.totalRegistrationFundsCollectedCents).toBe(346000);
  });
});
