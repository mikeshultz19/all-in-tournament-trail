import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { deriveRegistrationMemberStatus } from "@/lib/tournament-registration-roster";

describe("registration roster member status", () => {
  it("shows confirmed active membership as Member", () => {
    expect(deriveRegistrationMemberStatus({ status: "active", resolvedClassification: "current", eligibleForTournament: false })).toBe("Member");
  });

  it("shows confirmed absence of active membership as Non-Member", () => {
    expect(deriveRegistrationMemberStatus({ status: "inactive", resolvedClassification: "non-member", eligibleForTournament: false })).toBe("Non-Member");
  });

  it("shows unresolved membership as Needs Review", () => {
    expect(deriveRegistrationMemberStatus({ submittedClassification: "current", resolvedClassification: undefined, eligibleForTournament: false })).toBe("Needs Review");
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

  it("exports and prints only compact tournament-morning fields", () => {
    const csv = readFileSync("app/admin/registration-review/export/route.ts", "utf8");
    const print = readFileSync("app/admin/registration-review/print/page.tsx", "utf8");
    for (const field of ["boat_number", "angler_1_name", "angler_1_member_status", "member_pots", "insurance", "big_bass", "registered_at", "needs_review"]) expect(csv).toContain(`"${field}"`);
    expect(csv).not.toContain('"processing_fee"');
    expect(csv).not.toContain('"total_paid"');
    expect(print).toContain("table-fixed");
    expect(print).toContain("size: landscape");
    expect(print).toContain(">Type</th>");
    expect(print).toContain("title(row.registrationType)");
    expect(print).toContain("Check-In / Review");
    expect(print).not.toContain("RegistrationEditControl");
    expect(print).not.toContain("Edit / Registration Details");
    expect(csv).toContain('"roster_generated_at"');
    expect(csv).toContain("formatRosterGeneratedAt");
    expect(print).toContain("Roster generated");
    expect(print).toContain("formatRosterGeneratedAt");
  });
});
