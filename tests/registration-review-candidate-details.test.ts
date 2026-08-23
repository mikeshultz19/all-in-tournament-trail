import { describe, expect, it } from "vitest";

import { describeReviewCandidateMatch } from "@/components/admin/RegistrationReviewResolutionForm";
import type { RegistrationReviewAnglerOption } from "@/lib/registration-identity-review";

function candidate(values: Partial<RegistrationReviewAnglerOption> = {}): RegistrationReviewAnglerOption {
  return {
    id: "angler-1", first_name: "Existing", last_name: "Angler",
    display_name: "Existing Angler", normalized_name: "existing angler",
    email: "existing@example.com", phone: "817-555-0100", is_active: true,
    merged_into_angler_id: null, created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z", membershipStatus: "active",
    membershipEffectiveDate: "2026-02-01", ...values,
  };
}

describe("registration review candidate details", () => {
  it("identifies email and phone matches", () => {
    expect(describeReviewCandidateMatch({ email: "EXISTING@example.com", phone: "(817) 555-0100" }, candidate(), 1)).toBe("Matched by: Email and Phone");
  });

  it("identifies a selected email-only or phone-only candidate", () => {
    expect(describeReviewCandidateMatch({ email: "existing@example.com", phone: "817-555-9999" }, candidate(), 1)).toBe("Matched by: Email");
    expect(describeReviewCandidateMatch({ email: "other@example.com", phone: "8175550100" }, candidate(), 1)).toBe("Matched by: Phone");
  });

  it("explains conflicting multiple candidates", () => {
    expect(describeReviewCandidateMatch({ email: "other@example.com", phone: "817-555-9999" }, candidate(), 2)).toBe("Possible matches were found using different contact fields.");
  });
});
