import { describe, expect, it } from "vitest";

import { getRegistrationReviewPresentation } from "@/lib/registration-review-presentation";

describe("Admin registration review presentation", () => {
  it("explains simultaneous identity and membership review in plain language", () => {
    const result = getRegistrationReviewPresentation({
      reviewKind: "identity",
      reason: "The submitted current membership could not be linked to one canonical Angler. Membership Needs Review: Angler 1 current membership cannot be verified until identity is resolved.",
      submittedMembership: "current",
      canonicalAnglerId: null,
    });
    expect(result).toEqual({
      heading: "Membership needs review",
      issue: "Angler selected “Current Member,” but we could not verify their membership.",
      identityFollowUp: "We also need to confirm whether this is an existing angler or a new angler.",
    });
    expect(JSON.stringify(result)).not.toMatch(/canonical|review_kind|classification|transition/i);
  });

  it.each([
    ["Submitted email is already associated with Joe Johnson.", "The submitted email is already used by another angler."],
    ["Submitted phone is already associated with Joe Johnson.", "The submitted phone number is already used by another angler."],
    ["Submitted email and phone are associated with different existing anglers.", "The submitted email and phone match different existing anglers."],
  ])("simplifies identity collision reason %s", (reason, issue) => {
    expect(getRegistrationReviewPresentation({ reviewKind: "identity", reason, submittedMembership: "non-member", canonicalAnglerId: null }).issue).toBe(issue);
  });

  it("simplifies duplicate participation review wording", () => {
    expect(
      getRegistrationReviewPresentation({
        reviewKind: "identity",
        reason: "Possible duplicate tournament participation: Joe Johnson is already entered in this tournament.",
        submittedMembership: "non-member",
        canonicalAnglerId: null,
      }),
    ).toEqual({
      heading: "Possible duplicate tournament participation",
      issue: "This angler may already be entered in this tournament.",
      identityFollowUp: "Confirm whether this is the same angler or a different angler.",
    });
  });

  it("explains a possible duplicate membership purchase", () => {
    expect(getRegistrationReviewPresentation({
      reviewKind: "membership",
      reason: "Possible Duplicate Membership Purchase: Angler 1 already has a membership.",
      submittedMembership: "joining",
      canonicalAnglerId: "angler-1",
    })).toMatchObject({
      heading: "Possible duplicate membership purchase",
      issue: "This angler selected a new membership, but an existing membership may already be active.",
    });
  });
});
