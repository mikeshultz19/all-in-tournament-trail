import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("registration availability consistency", () => {
  it("has no staging-only gate on public registration surfaces", () => {
    const sources = ["components/RegistrationForm.tsx", "components/FeaturedTournament.tsx", "components/MobileFeaturedTournament.tsx", "app/schedule/page.tsx", "app/registrations/page.tsx", "app/how-it-works/page.tsx"].map((file) => readFileSync(file, "utf8"));
    for (const source of sources) expect(source).not.toContain("SOFT_LAUNCH_REGISTRATION_CLOSED");
    expect(sources.join("\n")).toContain("registrationCanSubmit");
  });

  it("does not bypass server eligibility in the quote route", () => {
    const source = readFileSync("app/api/registrations/quote/route.ts", "utf8");
    expect(source).not.toContain("launchModeOverride");
    expect(source).toContain("validateOnlineRegistrationRequest");
  });

  it("labels completed Schedule entries Registration Closed without changing eligibility", () => {
    const schedule = readFileSync("app/schedule/page.tsx", "utf8");
    const eligibility = readFileSync("lib/tournament-operations.ts", "utf8");

    expect(schedule).toContain('tournament.status === "official"');
    expect(schedule).toContain('? "Registration Closed"');
    expect(schedule).toContain(": availability.reason");
    expect(eligibility).toContain(
      'reason: "Registration is no longer available for this tournament."',
    );
  });
});
