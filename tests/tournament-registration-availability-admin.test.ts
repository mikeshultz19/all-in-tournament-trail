import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tournaments } from "@/data/tournaments";
import { getRegistrationAvailability } from "@/lib/tournament-operations";
import { formatRosterGeneratedAt } from "@/lib/tournament-time";

describe("Tournament Manager registration availability", () => {
  it("maps manual suspension, resume, and postponement to existing statuses", () => {
    const action = readFileSync("app/admin/tournament-manager/registration-availability/actions.ts", "utf8");
    expect(action).toContain('intent === "suspend" ? "Registration Closed"');
    expect(action).toContain('intent === "resume" ? "Registration Open"');
    expect(action).toContain('intent === "postpone" ? "Postponed"');
    expect(action).not.toContain("registration_closes");
  });

  it("keeps existing status blockers authoritative", () => {
    const open = { ...tournaments[0], registrationStatus: "open" as const };
    expect(getRegistrationAvailability(open).canSubmit).toBe(true);
    expect(getRegistrationAvailability({ ...open, registrationStatus: "closed" as const }).canSubmit).toBe(false);
    expect(getRegistrationAvailability({ ...open, tournamentStatus: "postponed" as const }).canSubmit).toBe(false);
    expect(getRegistrationAvailability({ ...open, tournamentStatus: "cancelled" as const }).canSubmit).toBe(false);
  });

  it("formats roster snapshot time in the tournament timezone", () => {
    expect(formatRosterGeneratedAt("2026-08-22T10:47:00Z")).toBe("Aug 22, 2026 at 5:47 AM");
  });
});
