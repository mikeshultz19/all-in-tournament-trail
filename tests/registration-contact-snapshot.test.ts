import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sync = readFileSync("supabase/migrations/202608200001_sync_online_memberships_after_identity_review.sql", "utf8");
const walkup = readFileSync("supabase/migrations/202608200002_add_admin_walkup_registration.sql", "utf8");
const page = readFileSync("app/admin/registration-review/page.tsx", "utf8");
const actions = readFileSync("app/admin/registration-review/actions.ts", "utf8");
const contactReview = readFileSync("components/admin/RegistrationContactReviewForm.tsx", "utf8");
const historicalMembershipReview = readFileSync("components/admin/HistoricalMembershipReviewForm.tsx", "utf8");

describe("registration contact snapshots and member change review", () => {
  const normalizedContactReview = contactReview.replace(/\s+/g, " ");

  it("stores a complete immutable-style snapshot for every online and walk-up participant", () => {
    for (const field of ["firstName", "lastName", "streetAddress", "city", "state", "zipCode", "email", "phone", "membership"]) {
      expect(sync).toContain(`'${field}'`);
    }
    expect(sync).toContain("participant_contact_snapshot = v_contact_snapshot");
    expect(walkup).toContain("participant_contact_snapshot = v_contact_snapshot");
    expect(walkup).toContain("v_expected_count := case when p_registration_type = 'team' then 2 else 1 end");
  });

  it("compares material contact fields without blocking durable registration", () => {
    expect(sync).toContain("registration_contact_differences");
    for (const field of ["streetAddress", "phone", "email"]) expect(sync).toContain(`then '${field}' end`);
    expect(walkup).toContain("return v_registration");
    expect(walkup).toContain("'contact', v_contact ->> 'membership'");
  });

  it("supports approve and keep while preserving the tournament snapshot", () => {
    expect(normalizedContactReview).toContain("SAME PERSON — UPDATE INFO");
    expect(normalizedContactReview).toContain("SAME PERSON — KEEP EXISTING INFO");
    expect(normalizedContactReview).toContain("DIFFERENT PERSON — APPROVE NEW MEMBER");
    expect(actions).toContain("resolveRegistrationContactReview");
    expect(sync).toContain("if p_approve_update then");
    expect(sync).toContain("contact_update_approved");
    expect(sync).toContain("contact_existing_kept");
    const resolver = sync.slice(sync.indexOf("create or replace function public.admin_resolve_registration_contact_review"));
    expect(resolver).not.toContain("update public.tournament_registrations");
    expect(page).toContain("RegistrationContactReviewForm");
  });

  it("keeps contact review compact while preserving expandable old and submitted values", () => {
    expect(normalizedContactReview).toContain("Contact information mismatch");
    expect(normalizedContactReview).toContain("Differences:");
    expect(normalizedContactReview).toContain("View differences");
    expect(contactReview).toContain("<details");
    expect(contactReview).not.toContain("<details open");
    expect(normalizedContactReview).toContain('ContactBlock title="Existing Member"');
    expect(normalizedContactReview).toContain('ContactBlock title="Registration Submission"');
    expect(contactReview).toContain("Optional review note");
    expect(normalizedContactReview).toContain("SAME PERSON — UPDATE INFO");
    expect(normalizedContactReview).toContain("SAME PERSON — KEEP EXISTING INFO");
    expect(normalizedContactReview).toContain("DIFFERENT PERSON — APPROVE NEW MEMBER");
    expect(actions).toContain('decision !== "different"');
    expect(actions).toContain("resolveRegistrationIdentityReview({");
    expect(page).toContain("participantName={review.participantName}");
  });

  it("keeps historical unknown membership state for manual review", () => {
    expect(sync).toContain("if v_review.submitted_membership is null then");
    expect(sync).toContain("Historical membership selection is unknown");
    expect(sync).not.toMatch(/coalesce\(new\.submitted_membership[^\n]*'non-member'/);
    expect(page).toContain("HistoricalMembershipReviewForm");
    expect(historicalMembershipReview).toContain("Membership status needs review");
    expect(historicalMembershipReview).toContain("Confirm Member");
    expect(historicalMembershipReview).toContain("Confirm Non-Member");
  });

  it("is repeatable and deduplicates memberships", () => {
    expect(sync).toContain("to_regprocedure('public.complete_registration_for_identity_review_core");
    expect(walkup).toContain("to_regprocedure('public.complete_durable_registration_core");
    expect(sync).toContain("on conflict (angler_id, season_id) do update");
    expect(sync).not.toMatch(/alter function public\.complete_registration_for_identity_review[\s\S]{0,180}rename(?![\s\S]{0,80}end if)/);
  });
});
