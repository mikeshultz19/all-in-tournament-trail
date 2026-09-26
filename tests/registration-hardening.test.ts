import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const roster = readFileSync("lib/tournament-registration-roster.ts", "utf8");
const cancellation = readFileSync("app/admin/registration-review/actions.ts", "utf8");
const walkUpMigration = readFileSync("supabase/migrations/202609170001_add_walkup_confirmation_email_delivery.sql", "utf8");
const tournamentPolicy = readFileSync("supabase/migrations/202609250001_lock_public_tournament_updates.sql", "utf8");
const walkUpAction = readFileSync("app/admin/registration-review/actions.ts", "utf8");

describe("registration hardening", () => {
  it("attributes membership fees to the participant who submitted Joining", () => {
    expect(roster).toContain('snapshot?.submittedClassification === "joining"');
    expect(roster).toContain('snapshot?.resolvedClassification === "joining"');
    expect(roster).toContain("!snapshot?.submittedClassification");
  });

  it("cancels memberships by the joining snapshot instead of team position", () => {
    expect(cancellation).toContain('membership.submittedClassification === "joining"');
    expect(cancellation).toContain('membership.resolvedClassification === "joining"');
    expect(cancellation).toContain("const selectedSnapshots = snapshots.length");
  });

  it("allows a selected current member without email while still requiring email for Joining", () => {
    expect(walkUpMigration).toContain("p_anglers -> v_index ->> 'membership' = 'joining'");
    expect(walkUpMigration).toContain("AITT_WALKUP_SELECTED_MEMBER_REQUIRED");
    expect(walkUpMigration).toContain("selectedMemberId");
    expect(walkUpAction).toContain("selectedMemberId: selectedMemberIds[0]");
    expect(walkUpAction).toContain("selectedMemberId: selectedMemberIds[1]");
  });

  it("removes anonymous tournament mutation access while preserving public reads", () => {
    expect(tournamentPolicy).toContain('drop policy if exists "Temporary admin tournament updates"');
    expect(tournamentPolicy).toContain("revoke insert, update, delete on table public.tournaments from anon");
  });
});

