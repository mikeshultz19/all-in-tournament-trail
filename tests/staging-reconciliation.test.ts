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
      manualCollectionMarkerCount: 0,
    })).toMatchObject({ state: "invariant_failure", checkInBlocked: true });
  });

  it("keeps an unresolved membership obligation actionable and check-in blocked", () => {
    expect(reconcileParticipant({
      ...base,
      hasActiveCurrentSeasonMembership: false,
      reviewStatus: "review_required",
      reviewKind: "membership",
      manualCollectionMarkerCount: 0,
    })).toMatchObject({ state: "actionable", checkInBlocked: true, reason: "membership dues remain unresolved" });
  });

  it("accepts one active membership with one qualifying manual collection marker", () => {
    expect(reconcileParticipant({
      ...base,
      hasActiveCurrentSeasonMembership: true,
      reviewStatus: "resolved_existing",
      reviewKind: "membership",
      manualCollectionMarkerCount: 1,
    })).toMatchObject({ state: "verified", checkInBlocked: false });
  });

  it("rejects duplicate manual evidence for one review", () => {
    expect(reconcileParticipant({
      ...base,
      hasActiveCurrentSeasonMembership: true,
      reviewStatus: "resolved_existing",
      reviewKind: "membership",
      manualCollectionMarkerCount: 2,
    })).toMatchObject({ state: "invariant_failure" });
  });
});
