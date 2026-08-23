import type { OnlineRegistrationAngler } from "@/lib/online-registration";

export interface RegistrationMembershipReviewIssue {
  participantPosition: 1 | 2;
  reason: string;
}

export function preserveUnresolvedMembershipReviews(
  anglers: readonly OnlineRegistrationAngler[],
  issues: readonly RegistrationMembershipReviewIssue[],
  unresolvedIdentityPositions: ReadonlySet<number>,
  hasMemberOnlySelection = false,
): RegistrationMembershipReviewIssue[] {
  const result = [...issues];

  for (const [index, angler] of anglers.entries()) {
    const participantPosition = (index + 1) as 1 | 2;
    if (
      angler.membership !== "current" ||
      !unresolvedIdentityPositions.has(participantPosition) ||
      result.some((issue) => issue.participantPosition === participantPosition)
    ) {
      continue;
    }

    result.push({
      participantPosition,
      reason: `Membership Needs Review: Angler ${participantPosition} current membership cannot be verified until identity is resolved.${hasMemberOnlySelection ? " Member-only selection requires eligibility review." : ""}`,
    });
  }

  return result;
}
