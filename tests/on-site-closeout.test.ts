import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildWeighfishChecks, closeoutDifferenceCents, sortCloseoutChecks } from "@/lib/on-site-payout-calculator";
import type { WeighfishResultRow } from "@/lib/weighfishParser";

const row = (overrides: Partial<WeighfishResultRow> = {}): WeighfishResultRow => ({
  place: 1, sourcePlacement: "1", participationStatus: "participated",
  entryName: "Team Smith / Jones", fishCount: 5, totalWeight: 22.5,
  bigFishWeight: 6.1, basePayout: 2400, bronzePayout: 0,
  silverPayout: 0, goldPayout: 900, bigBassPlace: 1,
  bigBassPayout: 500, cashPayout: 3800, payoutBreakdown: "", prizeDescription: "",
  ...overrides,
});

describe("on-site tournament closeout", () => {
  it("creates separate itemized checks for every payout category", () => {
    const checks = buildWeighfishChecks([row()]);
    expect(checks.map((check) => [check.category, check.amountCents])).toEqual([
      ["Base Tournament", 240000], ["Gold Pot", 90000], ["Big Bass", 50000],
    ]);
    expect(checks.every((check) => check.status === "not_written")).toBe(true);
  });

  it("supports two distinct Big Bass checks", () => {
    const checks = buildWeighfishChecks([row(), row({ place: 2, entryName: "Team Brown / Davis", bigBassPlace: 2, basePayout: 0, goldPayout: 0, bigBassPayout: 400 })]);
    expect(checks.filter((check) => check.category === "Big Bass")).toHaveLength(2);
  });

  it("uses the required payout order and final place within ordinary categories", () => {
    const checks = buildWeighfishChecks([
      row({ place: 3, entryName: "Third", bronzePayout: 50, goldPayout: 0, bigBassPayout: 0 }),
      row({ place: 1, entryName: "First", bronzePayout: 100, silverPayout: 200, goldPayout: 300, bigBassPayout: 400 }),
      row({ place: 2, entryName: "Second", basePayout: 1200, bronzePayout: 75, silverPayout: 0, goldPayout: 0, bigBassPayout: 0 }),
    ]);
    const insurance = { id: "insurance", entryName: "Insured", finishingPlace: 4, category: "AITT Insurance Pot" as const, amountCents: 2000, status: "not_written" as const };
    const ordered = sortCloseoutChecks([insurance, ...checks]);

    expect([...new Set(ordered.map((check) => check.category))]).toEqual([
      "Base Tournament", "Bronze Pot", "Silver Pot", "Gold Pot", "Big Bass", "AITT Insurance Pot",
    ]);
    expect(ordered.filter((check) => check.category === "Bronze Pot").map((check) => check.finishingPlace)).toEqual([1, 2, 3]);
  });

  it("automatically includes every valid imported payout without mutating source rows", () => {
    const source = buildWeighfishChecks([row()]);
    expect(source).toHaveLength(3);
    expect(source.reduce((sum, check) => sum + check.amountCents, 0)).toBe(380000);
    expect(source.every((check) => !("included" in check))).toBe(true);
    expect(source).toEqual(buildWeighfishChecks([row()]));
  });

  it("requires exact reconciliation", () => {
    const checks = buildWeighfishChecks([row()]);
    expect(closeoutDifferenceCents(400000, 20000, checks)).toBe(0);
    expect(closeoutDifferenceCents(400001, 20000, checks)).toBe(1);
  });

  it("keeps closeout persistence private and independent", () => {
    const migration = readFileSync("supabase/migrations/202608020003_add_on_site_tournament_closeout.sql", "utf8");
    expect(migration).toContain("on_site_tournament_closeouts");
    expect(migration).toContain("AITT_CLOSEOUT_NOT_RECONCILED");
    expect(migration).not.toContain("publish_official_results");
    expect(migration).not.toContain("tournament_aoy_points");
  });
});
