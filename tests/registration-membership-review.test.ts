import { describe, expect, it } from "vitest";

import { preserveUnresolvedMembershipReviews } from "@/lib/registration-membership-review";
import type { OnlineRegistrationAngler } from "@/lib/online-registration";

function angler(membership: OnlineRegistrationAngler["membership"]): OnlineRegistrationAngler {
  return {
    firstName: "Taylor",
    lastName: "Angler",
    email: "taylor@example.com",
    mobilePhone: "817-555-0100",
    streetAddress: "100 Lake Road",
    city: "Azle",
    state: "TX",
    zipCode: "76020",
    membership,
  };
}

describe("registration membership review preservation", () => {
  it("preserves current-membership uncertainty while identity is unresolved", () => {
    expect(preserveUnresolvedMembershipReviews(
      [angler("current")],
      [],
      new Set([1]),
    )).toEqual([expect.objectContaining({
      participantPosition: 1,
      reason: expect.stringContaining("Membership Needs Review:"),
    })]);
  });

  it("preserves the issue for an identity conflict without duplicating an existing membership issue", () => {
    const existing = [{ participantPosition: 1 as const, reason: "Membership Needs Review: existing reason" }];
    expect(preserveUnresolvedMembershipReviews(
      [angler("current")],
      existing,
      new Set([1]),
    )).toEqual(existing);
  });

  it("does not create review for an ordinary non-member or a verified current member", () => {
    expect(preserveUnresolvedMembershipReviews([angler("non-member")], [], new Set([1]))).toEqual([]);
    expect(preserveUnresolvedMembershipReviews([angler("current")], [], new Set())).toEqual([]);
  });

  it("retains duplicate-purchase review and member-only eligibility markers", () => {
    const duplicate = [{ participantPosition: 1 as const, reason: "Possible Duplicate Membership Purchase: already active" }];
    expect(preserveUnresolvedMembershipReviews([angler("joining")], duplicate, new Set([1]), true)).toEqual(duplicate);
    expect(preserveUnresolvedMembershipReviews([angler("current")], [], new Set([1]), true)[0].reason)
      .toContain("Member-only selection requires eligibility review.");
  });
});
