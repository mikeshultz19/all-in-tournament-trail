import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Admin Home current tournament summary", () => {
  it("shows the operational summary cards and removes payout workflow cards", () => {
    const source = readFileSync("app/admin/page.tsx", "utf8");
    expect(source).toContain('label="Early Entries & Check-In"');
    expect(source).toContain('label="Registration Review"');
    expect(source).toContain('label="New Memberships"');
    expect(source).toContain('label="Website Status"');
    expect(source).not.toContain('label="Results Import"');
    expect(source).not.toContain('label="Insurance Pot"');
    expect(source).not.toContain('label="Payouts"');
  });

  it("keeps Early Entries and existing destinations intact", () => {
    const source = readFileSync("app/admin/page.tsx", "utf8");
    expect(source).toContain('actionLabel="View Entries"');
    expect(source).toContain("/admin/tournament-manager/prepare?tournament=");
    expect(source).toContain("/admin/registration-review?tournament=");
    expect(source).toContain("Open Tournament Manager");
  });

  it("uses current-tournament paid registration snapshots and publication state", () => {
    const source = readFileSync("app/admin/page.tsx", "utf8");
    const roster = readFileSync("lib/tournament-registration-roster.ts", "utf8");
    expect(source).toContain("listTournamentPurchasedMembershipCounts(tournamentIds)");
    expect(source).toContain("official_results_published_at");
    expect(roster).toContain('item.code === "annual_membership"');
    expect(roster).toContain("if (!row.payment_reference) return total");
  });
});
