import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const roster = readFileSync("lib/tournament-registration-roster.ts", "utf8");
const cancellation = readFileSync("app/admin/registration-review/actions.ts", "utf8");
const duplicatePaymentGuard = readFileSync("supabase/migrations/202609260001_block_duplicate_online_payment_attempts.sql", "utf8");
const walkUpMigration = readFileSync("supabase/migrations/202609170001_add_walkup_confirmation_email_delivery.sql", "utf8");
const tournamentPolicy = readFileSync("supabase/migrations/202609250001_lock_public_tournament_updates.sql", "utf8");
const walkUpAction = readFileSync("app/admin/registration-review/actions.ts", "utf8");

describe("registration hardening", () => {
  it("guards active and in-flight duplicate online registrations before payment", () => {
    expect(duplicatePaymentGuard).toContain("AITT_REGISTRATION_DUPLICATE_ACTIVE_PARTICIPATION");
    expect(duplicatePaymentGuard).toContain("AITT_REGISTRATION_CANCELLED_ONLINE_REENTRY_NOT_ALLOWED");
    expect(duplicatePaymentGuard).toContain("registration.registration_status = 'active'");
    expect(duplicatePaymentGuard).toContain("attempt.state in ('pending', 'processing', 'reconciliation_required')");
    expect(duplicatePaymentGuard).toContain("attempt.hold_expires_at > now()");
  });
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

  it("requires email for every Current Member and Joining walk-up", () => {
    expect(walkUpMigration).toContain("p_anglers -> v_index ->> 'membership' <> 'non-member'");
    expect(walkUpAction).toContain("AITT_WALKUP_MEMBER_EMAIL_REQUIRED");
    expect(readFileSync("components/admin/RegistrationOperationsControls.tsx", "utf8")).toContain("required={required && Boolean(membershipValue)}");
  });

  it("removes anonymous tournament mutation access while preserving public reads", () => {
    expect(tournamentPolicy).toContain('drop policy if exists "Temporary admin tournament updates"');
    expect(tournamentPolicy).toContain("revoke insert, update, delete on table public.tournaments from anon");
  });
});
