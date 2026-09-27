import { describe, expect, it } from "vitest";

import { reconcileParticipant } from "../scripts/staging-reconciliation-core";

const base = {
  registrationId: "synthetic-registration",
  boatNumber: 21,
  participantPosition: 1 as const,
  submittedMembership: "current",
  checkedIn: false,
};

describe("read-only staging reconciliation invariants", () => {
  it("keeps resolved identity plus missing membership as a failure instead of silently passing", () => {
    expect(reconcileParticipant({
      ...base,
      hasActiveCurrentSeasonMembership: false,
      reviewStatus: "resolved_existing",
      reviewKind: "membership",
    })).toMatchObject({ state: "invariant_failure", checkInBlocked: true });
  });

  it("keeps an unresolved membership obligation actionable and check-in blocked", () => {
    expect(reconcileParticipant({
      ...base,
      hasActiveCurrentSeasonMembership: false,
      reviewStatus: "review_required",
      reviewKind: "membership",
    })).toMatchObject({ state: "actionable", checkInBlocked: true, reason: "membership dues remain unresolved" });
  });

  it("accepts one active membership after the review is resolved", () => {
    expect(reconcileParticipant({
      ...base,
      hasActiveCurrentSeasonMembership: true,
      reviewStatus: "resolved_existing",
      reviewKind: "membership",
    })).toMatchObject({ state: "verified", checkInBlocked: false });
  });

});
