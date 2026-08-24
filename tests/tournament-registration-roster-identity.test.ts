import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
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
