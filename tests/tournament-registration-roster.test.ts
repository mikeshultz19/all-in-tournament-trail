import { describe, expect, it } from "vitest";
import { summarizeTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";

describe("tournament registration roster summary", () => {
  it("counts entries, paid registrations, and review rows without double-counting", () => {
    expect(summarizeTournamentRegistrationRoster([
      { id: "1", registrationType: "team", boater: "Smith", partner: "Jones", membershipStatus: "Member", entryStatus: "Confirmed", paymentStatus: "Paid", sidePots: [] },
      { id: "2", registrationType: "team", boater: "Brown", partner: "Davis", membershipStatus: "Mixed", entryStatus: "Needs Review", paymentStatus: "Paid", sidePots: ["Bronze"] },
      { id: "3", registrationType: "solo", boater: "Wilson", partner: null, membershipStatus: "Non-Member", entryStatus: "Needs Review", paymentStatus: "Needs Review", sidePots: [] },
    ])).toEqual({ total: 3, paid: 2, needReview: 2 });
  });
});
