import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202607290003_add_durable_registration.sql",
  "utf8",
);
const service = readFileSync("lib/durable-registration.ts", "utf8");
const membershipValidation = readFileSync(
  "lib/registration-membership-validation.ts",
  "utf8",
);

describe("AITT Durable Registration database boundary", () => {
  it("uses one transactional service-role-only RPC", () => {
    expect(migration).toContain(
      "create or replace function public.complete_durable_registration",
    );
    expect(migration).toContain("language plpgsql");
    expect(migration).toContain("security definer");
    expect(migration).toContain(
      "grant execute on function public.complete_durable_registration",
    );
    expect(migration).toContain("to service_role");
    expect(migration).toContain(
      "from public, anon, authenticated",
    );
  });

  it("stores stable ownership, anglers, membership, payment, and policy snapshots", () => {
    for (const field of [
      "competitive_record_id",
      "angler1_id",
      "angler2_id",
      "membership_snapshot",
      "price_snapshot",
      "payment_reference",
      "rules_version",
      "waiver_version",
      "rules_accepted_at",
    ]) {
      expect(migration).toContain(field);
    }
    expect(migration).toContain("registered_at");
    expect(migration).toContain("now()");
  });

  it("makes payment retries idempotent and prevents duplicate entries", () => {
    expect(migration).toContain(
      "tournament_registrations_payment_reference_uidx",
    );
    expect(migration).toContain(
      "'registration-payment:' || lower(btrim(p_payment_reference))",
    );
    expect(migration).toContain(
      "where payment_reference = btrim(p_payment_reference)",
    );
    expect(migration).toContain(
      "tournament_registrations_record_event_uidx",
    );
    expect(migration).toContain("AITT_REGISTRATION_ALREADY_EXISTS");
  });

  it("creates exact Team and Solo Competitive Records through stable UUIDs", () => {
    expect(migration).toContain(
      "case when p_registration_type = 'team' then 2 else 1 end",
    );
    expect(migration).toContain(
      "from public.create_competitive_record",
    );
    expect(migration).toContain(
      "AITT_REGISTRATION_DUPLICATE_ANGLER",
    );
    expect(migration).toContain(
      "AITT_REGISTRATION_IDENTITY_REVIEW_REQUIRED",
    );
    expect(migration).toContain(
      "'member-email:' || v_email",
    );
    expect(migration).toContain(
      "AITT_DURABLE_REGISTRATION_ANGLERS_INVALID",
    );
    expect(migration).not.toMatch(
      /canonical_member_key\s*=\s*.*(?:firstName|lastName)/,
    );
  });

  it("validates First Eligible Tournament and snapshots resolved eligibility", () => {
    expect(migration).toContain(
      "v_membership.first_eligible_tournament_id",
    );
    expect(migration).toContain(
      "v_first_eligible.regular_season_number",
    );
    expect(migration).not.toMatch(
      /v_first_eligible\.tournament_date\s*<=\s*v_tournament\.tournament_date/,
    );
    expect(migration).toContain("'eligibleForTournament', v_is_eligible");
    expect(migration).toContain(
      "AITT_REGISTRATION_NOT_YET_ELIGIBLE",
    );
  });

  it("removes anonymous mutation paths", () => {
    expect(migration).toContain(
      "revoke insert, update, delete on table public.tournament_registrations from anon",
    );
    expect(migration).toContain(
      'drop policy if exists "Temporary anonymous tournament registrations creates"',
    );
  });
});

describe("AITT Durable Registration server boundary", () => {
  it("requires a verified payment and exact authoritative amount", () => {
    expect(service).toContain('payment.status !== "authorized"');
    expect(service).toContain(
      "quote.totalCents !== payment.amountCents",
    );
    expect(service).toContain(
      '"complete_durable_registration"',
    );
  });

  it("turns uncertain membership claims into post-payment review without trusting browser classifications", () => {
    expect(service).toContain(
      "getRegistrationMembershipReviewIssues",
    );
    expect(membershipValidation).toContain(
      "isMembershipEligibleForTournament",
    );
    expect(membershipValidation).toContain(
      'submitted.membership === "current"',
    );
    expect(membershipValidation).toContain(
      'submitted.membership === "joining"',
    );
  });

  it("does not expose a public completion or payment-success endpoint", () => {
    expect(service).toContain('import "server-only"');
    expect(migration).toContain(
      "after external payment verification",
    );
  });
});
