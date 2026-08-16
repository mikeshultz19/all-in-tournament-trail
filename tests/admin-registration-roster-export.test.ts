import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { areRegistrationMemberBenefitsEligible } from "@/lib/tournament-registration-roster";

describe("registration roster member benefits", () => {
  it("requires both team anglers to be eligible", () => {
    expect(areRegistrationMemberBenefitsEligible("team", [{ eligibleForTournament: true }, { eligibleForTournament: true }])).toBe(true);
    expect(areRegistrationMemberBenefitsEligible("team", [{ eligibleForTournament: true }, { eligibleForTournament: false }])).toBe(false);
  });

  it("uses the solo angler eligibility", () => {
    expect(areRegistrationMemberBenefitsEligible("solo", [{ eligibleForTournament: true }])).toBe(true);
    expect(areRegistrationMemberBenefitsEligible("solo", [{ eligibleForTournament: false }])).toBe(false);
  });
});

describe("authenticated roster exports", () => {
  it("requires Admin Auth in both server-rendered exports", () => {
    const csv = readFileSync("app/admin/registration-review/export/route.ts", "utf8");
    const print = readFileSync("app/admin/registration-review/print/page.tsx", "utf8");
    expect(csv).toContain("await requireAdminUser()");
    expect(print).toContain("await requireAdminUser()");
    expect(csv).toContain('"cache-control": "private, no-store"');
  });

  it("uses the shared authoritative roster for review, CSV, and print", () => {
    for (const file of ["app/admin/registration-review/page.tsx", "app/admin/registration-review/export/route.ts", "app/admin/registration-review/print/page.tsx"]) {
      expect(readFileSync(file, "utf8")).toContain("getTournamentRegistrationRoster");
    }
  });
});
