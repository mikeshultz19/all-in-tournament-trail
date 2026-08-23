export type ReviewPresentationInput = {
  reviewKind: "identity" | "contact" | "membership";
  reason: string;
  submittedMembership: "current" | "joining" | "non-member" | null;
  canonicalAnglerId: string | null;
};

export type ReviewPresentation = {
  heading: string;
  issue: string;
  identityFollowUp: string | null;
};

export function getRegistrationReviewPresentation(
  review: ReviewPresentationInput,
): ReviewPresentation {
  const membershipReview = review.reviewKind === "membership"
    || /Membership Needs Review:|Possible Duplicate Membership Purchase:|Member-only selection requires eligibility review\./i.test(review.reason);
  const identityUnresolved = review.reviewKind === "identity" && !review.canonicalAnglerId;

  if (membershipReview) {
    const duplicatePurchase = /Possible Duplicate Membership Purchase:/i.test(review.reason);
    const memberOnlySelection = /Member-only selection requires eligibility review\./i.test(review.reason);
    return {
      heading: duplicatePurchase ? "Possible duplicate membership purchase" : "Membership needs review",
      issue: duplicatePurchase
        ? "This angler selected a new membership, but an existing membership may already be active."
        : review.submittedMembership === "current"
          ? "Angler selected “Current Member,” but we could not verify their membership."
          : memberOnlySelection
            ? "Membership must be confirmed before the selected member-only option is eligible."
            : "Membership status could not be verified.",
      identityFollowUp: identityUnresolved
        ? "We also need to confirm whether this is an existing angler or a new angler."
        : null,
    };
  }

  if (/email and phone are associated with different/i.test(review.reason)) {
    return {
      heading: "Identity needs review",
      issue: "The submitted email and phone match different existing anglers.",
      identityFollowUp: "Confirm the correct existing angler, or approve this as a new angler.",
    };
  }
  if (/possible duplicate tournament participation/i.test(review.reason)) {
    return {
      heading: "Possible duplicate tournament participation",
      issue: "This angler may already be entered in this tournament.",
      identityFollowUp: "Confirm whether this is the same angler or a different angler.",
    };
  }
  if (/submitted email is already associated/i.test(review.reason)) {
    return {
      heading: "Identity needs review",
      issue: "The submitted email is already used by another angler.",
      identityFollowUp: "Confirm whether this is the same angler or a new angler.",
    };
  }
  if (/submitted phone is already associated/i.test(review.reason)) {
    return {
      heading: "Identity needs review",
      issue: "The submitted phone number is already used by another angler.",
      identityFollowUp: "Confirm whether this is the same angler or a new angler.",
    };
  }
  if (/contact information differs/i.test(review.reason)) {
    return {
      heading: "Contact information mismatch",
      issue: "The submitted contact information differs from the existing angler record.",
      identityFollowUp: null,
    };
  }

  return {
    heading: "Identity needs review",
    issue: "The submitted angler could not be matched confidently.",
    identityFollowUp: "Confirm the correct existing angler, or approve this as a new angler.",
  };
}
