import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const action = readFileSync("app/admin/registration-review/actions.ts", "utf8");
const roster = readFileSync("app/admin/registration-review/page.tsx", "utf8");
const reviewForm = readFileSync("components/admin/RegistrationReviewResolutionForm.tsx", "utf8");
const contactForm = readFileSync("components/admin/RegistrationContactReviewForm.tsx", "utf8");
const editor = readFileSync("components/admin/EditMemberContactForm.tsx", "utf8");
const history = readFileSync("components/admin/RegistrationHistoryList.tsx", "utf8");
const historyLoader = readFileSync("lib/admin-registration-history.ts", "utf8");

describe("simplified member contact correction", () => {
  it("keeps Edit Member inside unresolved review flows and requires a selected canonical angler", () => {
    expect(roster).toContain('review.status === "review_required"');
    expect(reviewForm).toContain("selectedAngler ? <details");
    expect(reviewForm).toContain("EditMemberContactForm memberId={selectedAngler.id}");
    expect(contactForm).toContain("canonicalAnglerId");
    expect(contactForm).toContain("EditMemberContactForm memberId={canonicalAnglerId}");
    expect(roster).not.toContain("EditMemberContactForm");
  });

  it("updates only the canonical contact record and preserves registration snapshots", () => {
    const editorAction = action.slice(action.indexOf("export async function updateCanonicalMemberContactAction"), action.indexOf("function purchasedMembershipIds"));
    expect(editorAction).toContain("updateCanonicalMemberContactAction");
    expect(editorAction).toContain('.from("anglers")');
    expect(editorAction).toContain("first_name: firstName");
    expect(editorAction).toContain("street_address: streetAddress");
    expect(editorAction).toContain(".eq(\"is_active\", true)");
    expect(editorAction).not.toContain("participant_contact_snapshot");
    expect(editorAction).not.toContain("memberships");
    expect(editor).toContain("registration submission snapshot remains unchanged");
    expect(history).toContain("EditMemberContactForm");
    expect(historyLoader).toContain("angler1_id");
    expect(historyLoader).toContain("angler2_id");
    expect(historyLoader).toContain('from("anglers")');
    expect(historyLoader).toContain("canonicalContacts");
  });

  it("keeps the existing review resolver and membership dues workflow separate", () => {
    expect(contactForm).toContain("SAME PERSON");
    expect(contactForm).toContain("resolveRegistrationContactReviewAction");
    expect(reviewForm).toContain("Confirm Match");
    expect(reviewForm).toContain("APPROVE NEW ANGLER");
    expect(roster).toContain("MembershipDuesControl");
    expect(editor).toContain("Optional correction note");
  });

  it("uses Admin-authenticated server actions and leaves financial/attendance fields out of the editor", () => {
    expect(action).toContain("await requireAdminUser()");
    for (const forbidden of ["price_snapshot", "payment_reference", "member_pot", "big_bass", "insurance", "checked_in_at", "registration_status"]) {
      expect(editor).not.toContain(forbidden);
    }
    expect(editor).toContain("state");
    expect(editor).toContain("zipCode");
  });
});
