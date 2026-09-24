import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  applyParticipantReviewTruth,
  buildRosterAngler,
  type RegistrationParticipantContactSnapshot,
} from "@/lib/tournament-registration-roster";

const contactReviewForm = readFileSync(
  "components/admin/RegistrationContactReviewForm.tsx",
  "utf8",
);

function submittedContact(overrides: Partial<RegistrationParticipantContactSnapshot> = {}): RegistrationParticipantContactSnapshot {
  return {
    firstName: "bob",
    lastName: "jagoff",
    streetAddress: "14 jagoffway",
    city: "fort worth",
    state: "TX",
    zipCode: "76022",
    email: "bob@example.com",
    phone: "5764763333",
    membership: "joining",
    ...overrides,
  };
}

describe("tournament registration roster identity presentation", () => {
  it("keeps mixed-team membership review truth independent in either participant order", () => {
    const current = { submittedClassification: "current", resolvedClassification: "current", status: "active", eligibleForTournament: true };
    const unresolved = { participant_position: 2, review_status: "review_required", canonical_angler_id: null, submitted_membership: "current" };
    expect(applyParticipantReviewTruth(current, undefined)).toMatchObject({ resolvedClassification: "current" });
    expect(applyParticipantReviewTruth(current, unresolved)).toMatchObject({ submittedClassification: "current", resolvedClassification: undefined });
    expect(applyParticipantReviewTruth(undefined, { ...unresolved, participant_position: 1 })).toMatchObject({ submittedClassification: "current", resolvedClassification: undefined });
  });

  it("represents registration #16's resolved existing member separately from its unresolved teammate", () => {
    const stale = { submittedClassification: "current", eligibleForTournament: false };
    const resolved = applyParticipantReviewTruth(stale, { participant_position: 1, review_status: "resolved_existing", canonical_angler_id: "existing-1", submitted_membership: "current" });
    const unresolved = applyParticipantReviewTruth(stale, { participant_position: 2, review_status: "review_required", canonical_angler_id: null, submitted_membership: "current" });
    expect(resolved).toMatchObject({ resolvedClassification: "current", status: "active" });
    expect(unresolved).toMatchObject({ resolvedClassification: undefined });
  });

  it("keeps a Boat #21-style resolved identity with missing membership actionable", () => {
    const resolvedIdentity = applyParticipantReviewTruth(
      { submittedClassification: "current", eligibleForTournament: false },
      { participant_position: 1, review_status: "resolved_existing", canonical_angler_id: "synthetic-21", submitted_membership: "current" },
    );

    expect(resolvedIdentity).toMatchObject({ resolvedClassification: "current" });
    expect(resolvedIdentity?.eligibleForTournament).toBe(true);
    expect(readFileSync("scripts/staging-reconciliation-core.ts", "utf8")).toContain("no active membership and no actionable review queue item");
  });
  it("keeps Boat #23 on the submitted identity while review remains unresolved", () => {
    const angler = buildRosterAngler(
      "bob jagoff",
      "joe-angler-id",
      { eligibleForTournament: true, resolvedClassification: "current", status: "active" },
      new Map([
        [
          "joe-angler-id",
          {
            id: "joe-angler-id",
            first_name: "Joe",
            last_name: "Johnson",
            display_name: "Joe Johnson",
            email: "joe@example.com",
            phone: "6767676767",
          },
        ],
      ]),
      submittedContact(),
      true,
    );

    expect(angler.displayName).toBe("Bob Jagoff");
    expect(angler.firstName).toBe("Bob");
    expect(angler.lastName).toBe("Jagoff");
    expect(angler.email).toBe("bob@example.com");
    expect(angler.phone).toBe("5764763333");
  });

  it("keeps the review card comparison path unchanged", () => {
    expect(contactReviewForm).toContain("Existing Member");
    expect(contactReviewForm).toContain("Registration Submission");
    expect(contactReviewForm).toContain("submitted");
    expect(contactReviewForm).toContain("existing");
  });

  it("keeps normal registrations canonical when no review is unresolved", () => {
    const joe = buildRosterAngler(
      "bob jagoff",
      "joe-angler-id",
      { eligibleForTournament: true, resolvedClassification: "current", status: "active" },
      new Map([
        [
          "joe-angler-id",
          {
            id: "joe-angler-id",
            first_name: "Joe",
            last_name: "Johnson",
            display_name: "Joe Johnson",
            email: "joe@example.com",
            phone: "6767676767",
          },
        ],
      ]),
      submittedContact(),
      false,
    );

    expect(joe.displayName).toBe("Joe Johnson");
    expect(joe.email).toBe("joe@example.com");
    expect(joe.phone).toBe("6767676767");
  });

  it("keeps SAME PERSON resolution canonical", () => {
    const joe = buildRosterAngler(
      "bob jagoff",
      "joe-angler-id",
      { eligibleForTournament: true, resolvedClassification: "current", status: "active" },
      new Map([
        [
          "joe-angler-id",
          {
            id: "joe-angler-id",
            first_name: "Joe",
            last_name: "Johnson",
            display_name: "Joe Johnson",
            email: "joe@example.com",
            phone: "6767676767",
          },
        ],
      ]),
      submittedContact(),
      false,
    );

    expect(joe.displayName).toBe("Joe Johnson");
  });

  it("keeps DIFFERENT PERSON resolution canonical for the new angler", () => {
    const bob = buildRosterAngler(
      "bob jagoff",
      "bob-angler-id",
      { eligibleForTournament: true, resolvedClassification: "current", status: "active" },
      new Map([
        [
          "bob-angler-id",
          {
            id: "bob-angler-id",
            first_name: "Bob",
            last_name: "Jagoff",
            display_name: "Bob Jagoff",
            email: "bob@example.com",
            phone: "5764763333",
          },
        ],
      ]),
      submittedContact(),
      false,
    );

    expect(bob.displayName).toBe("Bob Jagoff");
    expect(bob.email).toBe("bob@example.com");
  });
});
