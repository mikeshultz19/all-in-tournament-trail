import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  countPurchasedRegistrationMemberships,
  summarizeTournamentRegistrationRoster,
} from "@/lib/tournament-registration-roster";

describe("tournament registration roster summary", () => {
  it("counts entries, paid registrations, and review rows without double-counting", () => {
    expect(summarizeTournamentRegistrationRoster([
      { id: "1", registrationKey: "AITT-1", registeredAt: "2026-08-09T12:00:00Z", registrationType: "team", boater: "Smith", partner: "Jones", membershipStatus: "Member", membershipDetails: [], entryStatus: "Confirmed", paymentStatus: "Paid", sidePots: [], registrationTotalCents: 10000, checkedInAt: null, checkedInByAdminId: null },
      { id: "2", registrationKey: "AITT-2", registeredAt: "2026-08-09T12:01:00Z", registrationType: "team", boater: "Brown", partner: "Davis", membershipStatus: "Mixed", membershipDetails: [], entryStatus: "Needs Review", paymentStatus: "Paid", sidePots: ["Bronze"], registrationTotalCents: 12000, checkedInAt: null, checkedInByAdminId: null },
      { id: "3", registrationKey: "AITT-3", registeredAt: "2026-08-09T12:02:00Z", registrationType: "solo", boater: "Wilson", partner: null, membershipStatus: "Non-Member", membershipDetails: [], entryStatus: "Needs Review", paymentStatus: "Needs Review", sidePots: [], registrationTotalCents: null, checkedInAt: null, checkedInByAdminId: null },
    ])).toEqual({ total: 3, paid: 2, needReview: 2 });
  });

  it("limits Tournament Manager summaries to active registrations while preserving historical registration access", () => {
    const operational = readFileSync("lib/tournament-registration-roster.ts", "utf8");
    const history = readFileSync("lib/admin-registration-history.ts", "utf8");
    const collection = readFileSync("lib/tournament-collection-summary.ts", "utf8");
    expect(operational).toMatch(/listTournamentRegistrationRosterSummaries[\s\S]*?\.eq\("registration_status", "active"\)/);
    expect(collection).toMatch(/tournament_registrations[\s\S]*?\.eq\("registration_status", "active"\)/);
    expect(history).toContain("registration_status");
    expect(history).not.toContain('.eq("registration_status", "active")');
  });
});

describe("current tournament registration membership purchases", () => {
  it("counts individual paid annual-membership line items only", () => {
    expect(countPurchasedRegistrationMemberships([
      { payment_reference: "paid-team", price_snapshot: { lineItems: [{ code: "annual_membership" }, { code: "annual_membership" }, { code: "base_entry" }] } },
      { payment_reference: "paid-entry", price_snapshot: { lineItems: [{ code: "base_entry" }] } },
      { payment_reference: null, price_snapshot: { lineItems: [{ code: "annual_membership" }] } },
    ])).toBe(2);
  });
});
