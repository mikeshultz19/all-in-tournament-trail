export type ParticipantReconciliationInput = {
  registrationId: string;
  boatNumber: number | null;
  participantPosition: 1 | 2;
  hasActiveCurrentSeasonMembership: boolean;
  reviewStatus: string | null;
  reviewKind: string | null;
  submittedMembership: string | null;
  manualCollectionMarkerCount: number;
  checkedIn: boolean;
};

export type ParticipantReconciliationResult = {
  state: "verified" | "actionable" | "invariant_failure";
  checkInBlocked: boolean;
  reason: string;
};

/**
 * Pure invariant used by the read-only staging audit and its regression tests.
 * Identity resolution is not membership verification: a resolved review with
 * no active membership is an invariant failure unless an unresolved actionable
 * review remains visible to staff.
 */
export function reconcileParticipant(
  input: ParticipantReconciliationInput,
): ParticipantReconciliationResult {
  if (input.manualCollectionMarkerCount > 1) {
    return {
      state: "invariant_failure",
      checkInBlocked: true,
      reason: "duplicate manual collection evidence",
    };
  }

  if (input.reviewStatus === "review_required") {
    return {
      state: "actionable",
      checkInBlocked: true,
      reason:
        input.reviewKind === "membership" && input.submittedMembership === "current"
          ? "membership dues remain unresolved"
          : "registration review remains unresolved",
    };
  }

  if (input.hasActiveCurrentSeasonMembership) {
    return {
      state: "verified",
      checkInBlocked: false,
      reason:
        input.manualCollectionMarkerCount === 1
          ? "active membership and manual collection evidence verified"
          : "active current-season membership verified",
    };
  }

  return {
    state: "invariant_failure",
    checkInBlocked: true,
    reason: "no active membership and no actionable review queue item",
  };
}
