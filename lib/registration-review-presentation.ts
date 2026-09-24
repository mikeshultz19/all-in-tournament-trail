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
    || /Membership Needs Review:|Possible Duplicate Membership Purchase:/i.test(review.reason);
  const identityUnresolved = review.reviewKind === "identity" && !review.canonicalAnglerId;

  if (membershipReview) {
    const duplicatePurchase = /Possible Duplicate Membership Purchase:/i.test(review.reason);
    return {
      heading: duplicatePurchase ? "Possible duplicate membership purchase" : "Membership needs review",
      issue: duplicatePurchase
        ? "This angler selected a new membership, but an existing membership may already be active."
        : review.submittedMembership === "current"
          ? "Current Member selected, but no active membership was verified."
          : "Membership status could not be verified.",
      identityFollowUp: identityUnresolved
        ? "Confirm member or approve as new."
        : null,
    };
  }

  if (/email and phone are associated with different/i.test(review.reason)) {
    return {
      heading: "Identity needs review",
      issue: "The submitted email and phone match different existing anglers.",
      identityFollowUp: "Could not match confidently. Verify details or approve as new.",
    };
  }
  if (/possible duplicate tournament participation/i.test(review.reason)) {
    return {
      heading: "Possible duplicate tournament participation",
      issue: "This angler may already be entered in this tournament.",
      identityFollowUp: "Confirm same angler or different person.",
    };
  }
  if (/submitted email is already associated/i.test(review.reason)) {
    return {
      heading: "Identity needs review",
      issue: "The submitted email is already used by another angler.",
      identityFollowUp: "Confirm same angler or new person.",
    };
  }
  if (/submitted phone is already associated/i.test(review.reason)) {
    return {
      heading: "Identity needs review",
      issue: "The submitted phone number is already used by another angler.",
      identityFollowUp: "Confirm same angler or new person.",
    };
  }
  if (/contact information differs/i.test(review.reason)) {
    return {
      heading: "Contact information mismatch",
      issue: "The submitted contact information differs from the existing angler record.",
      identityFollowUp: null,
    };
  }

  if (/Canonical identity requires administrative approval/i.test(review.reason) && review.submittedMembership === "joining") {
    return {
      heading: "New membership needs approval",
      issue: "This is a new membership purchase. Approve once to create the member record.",
      identityFollowUp: "Approve as new if this is a different person.",
    };
  }

  return {
    heading: "Identity needs review",
    issue: "The submitted angler could not be matched confidently.",
    identityFollowUp: "Could not match confidently. Verify details or approve as new.",
  };
}
