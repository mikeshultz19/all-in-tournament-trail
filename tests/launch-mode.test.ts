import { describe, expect, it } from "vitest";
import { tournaments } from "@/data/tournaments";
import { getRegistrationAvailability } from "@/lib/tournament-operations";

describe("registration availability", () => {
  it("uses persisted tournament status instead of an environment gate", () => {
    const open = { ...tournaments[0], registrationStatus: "open" as const };
    expect(getRegistrationAvailability(open, new Date("2030-01-01T00:00:00Z")).canSubmit).toBe(true);
    expect(getRegistrationAvailability({ ...open, registrationStatus: "closed" as const }).reason).toBe("Registration is temporarily unavailable.");
    expect(getRegistrationAvailability({ ...open, status: "official" as const, registrationStatus: "closed" as const }).reason).toBe("Registration is no longer available for this tournament.");
  });
});
