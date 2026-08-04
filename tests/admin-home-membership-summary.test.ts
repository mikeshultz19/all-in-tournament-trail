import { describe, expect, it } from "vitest";

import { summarizeTournamentMemberships } from "@/lib/admin-home-membership-summary";

describe("summarizeTournamentMemberships", () => {
  it("counts completed online and event memberships", () => {
    expect(summarizeTournamentMemberships([
      { angler_id: "online-1", source: "online_registration", payment_reference: "payment-1" },
      { angler_id: "online-2", source: "online_registration", payment_reference: "payment-2" },
      { angler_id: "event-1", source: "admin", payment_reference: null },
    ])).toEqual({ online: 2, event: 1, total: 3 });
  });

  it("excludes incomplete, unknown, and test sources", () => {
    expect(summarizeTournamentMemberships([
      { angler_id: "missing-payment", source: "online_registration", payment_reference: null },
      { angler_id: "test-member", source: "test", payment_reference: "test-payment" },
      { angler_id: "unknown", source: null, payment_reference: null },
    ])).toEqual({ online: 0, event: 0, total: 0 });
  });

  it("deduplicates stable angler identifiers across membership workflows", () => {
    expect(summarizeTournamentMemberships([
      { angler_id: "same-angler", source: "online_registration", payment_reference: "payment-1" },
      { angler_id: "same-angler", source: "admin", payment_reference: null },
    ])).toEqual({ online: 1, event: 1, total: 1 });
  });
});
