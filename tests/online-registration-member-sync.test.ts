import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const durableRegistration = readFileSync(
  "supabase/migrations/202607290003_add_durable_registration.sql",
  "utf8",
);
const identityReviewSync = readFileSync(
  "supabase/migrations/202608200001_sync_online_memberships_after_identity_review.sql",
  "utf8",
);
const membershipFoundation = readFileSync(
  "supabase/migrations/202607280001_add_aoy_foundation.sql",
  "utf8",
);

describe("online registration membership synchronization", () => {
  it("keeps immediate verified membership creation in the paid registration transaction", () => {
    expect(durableRegistration).toContain("if v_claim = 'joining' and not found then");
    expect(durableRegistration).toContain("'online_registration'");
    expect(durableRegistration).toContain("btrim(p_payment_reference)");
  });

  it("retains each reviewed participant's membership selection", () => {
    expect(identityReviewSync).toContain("submitted_membership");
    expect(identityReviewSync).toContain("p_anglers -> (review.participant_position - 1) ->> 'membership'");
    expect(identityReviewSync).toContain("v_claim not in ('current', 'joining', 'non-member')");
  });

  it("creates or reuses one canonical membership after identity resolution", () => {
    expect(identityReviewSync).toContain("new.canonical_angler_id");
    expect(identityReviewSync).toContain("if new.submitted_membership = 'joining' then");
    expect(identityReviewSync).toContain("on conflict (angler_id, season_id) do update");
    expect(identityReviewSync).toContain("set status = 'active'");
    expect(identityReviewSync).toContain("first_eligible_tournament_id = coalesce");
  });

  it("does not create memberships for non-member registrations", () => {
    expect(identityReviewSync).not.toMatch(
      /if new\.submitted_membership = 'non-member' then[\s\S]*?insert into public\.memberships/,
    );
  });

  it("is repeat-registration safe and remains service-role-only", () => {
    expect(identityReviewSync).toContain("if v_registration.identity_review_status <> 'review_required' then");
    expect(identityReviewSync).toContain("grant execute on function public.complete_registration_for_identity_review");
    expect(identityReviewSync).toContain("to service_role");
    expect(membershipFoundation).toContain("memberships_unique_angler_season");
  });
});
