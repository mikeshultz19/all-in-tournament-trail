import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  classifyRegistrationIdentity,
  summarizeRegistrationReviewStatuses,
} from "@/lib/registration-identity-review-core";
import type { OnlineRegistrationAngler } from "@/lib/online-registration";
import type { Angler } from "@/types/aoy";

const migration = readFileSync(
  "supabase/migrations/202607290005_add_registration_identity_review_queue.sql",
  "utf8",
);
const durableService = readFileSync("lib/durable-registration.ts", "utf8");
const rosterService = readFileSync(
  "lib/tournament-registrations.ts",
  "utf8",
);
const actions = readFileSync(
  "app/admin/registration-review/actions.ts",
  "utf8",
);
const resolutionForm = readFileSync(
  "components/admin/RegistrationReviewResolutionForm.tsx",
  "utf8",
);

function submitted(
  values: Partial<OnlineRegistrationAngler> = {},
): OnlineRegistrationAngler {
  return {
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    mobilePhone: "817-555-0100",
    streetAddress: "",
    city: "",
    state: "TX",
    zipCode: "",
    membership: "non-member",
    ...values,
  };
}

function angler(
  id: string,
  firstName: string,
  lastName: string,
  email: string | null,
  phone: string | null,
): Angler {
  return {
    id,
    first_name: firstName,
    last_name: lastName,
    display_name: `${firstName} ${lastName}`,
    normalized_name: `${firstName} ${lastName}`.toLowerCase(),
    email,
    phone,
    is_active: true,
    merged_into_angler_id: null,
    created_at: "2026-07-29T00:00:00Z",
    updated_at: "2026-07-29T00:00:00Z",
  };
}

describe("registration identity classification", () => {
  it("automatically verifies one exact trusted email identity", () => {
    const result = classifyRegistrationIdentity(
      [submitted()],
      [
        angler(
          "11111111-1111-4111-8111-111111111111",
          "John",
          "Smith",
          "JOHN@example.com",
          "(817) 555-0100",
        ),
      ],
    );
    expect(result.status).toBe("verified");
    expect(result.participants[0].suggestedAnglerIds).toHaveLength(1);
  });

  it("sends spelling differences to review instead of merging", () => {
    expect(
      classifyRegistrationIdentity(
        [submitted({ firstName: "Jon", email: "jon@new.example" })],
        [
          angler(
            "11111111-1111-4111-8111-111111111111",
            "John",
            "Smith",
            "john@example.com",
            null,
          ),
        ],
      ).status,
    ).toBe("review_required");
  });

  it("sends nickname-like identities to review", () => {
    expect(
      classifyRegistrationIdentity(
        [
          submitted({
            firstName: "Rob",
            lastName: "Jones",
            email: "rob@new.example",
          }),
        ],
        [
          angler(
            "11111111-1111-4111-8111-111111111111",
            "Robert",
            "Jones",
            "robert@example.com",
            null,
          ),
        ],
      ).status,
    ).toBe("review_required");
  });

  it("requires review when normalized names are duplicated", () => {
    const first = angler(
      "11111111-1111-4111-8111-111111111111",
      "John",
      "Smith",
      null,
      null,
    );
    const second = angler(
      "22222222-2222-4222-8222-222222222222",
      "John",
      "Smith",
      null,
      null,
    );
    const result = classifyRegistrationIdentity(
      [submitted({ email: "unknown@example.com", mobilePhone: "" })],
      [first, second],
    );
    expect(result.status).toBe("review_required");
    expect(result.participants[0].suggestedAnglerIds).toHaveLength(2);
  });

  it("requires review for an unlinked current-membership claim", () => {
    expect(
      classifyRegistrationIdentity(
        [submitted({ membership: "current" })],
        [],
      ).status,
    ).toBe("review_required");
  });

  it("keeps Team and Solo classification participant counts separate", () => {
    expect(classifyRegistrationIdentity([submitted()], []).participants)
      .toHaveLength(1);
    expect(
      classifyRegistrationIdentity(
        [
          submitted(),
          submitted({
            firstName: "Mike",
            lastName: "Jones",
            email: "mike@example.com",
          }),
        ],
        [],
      ).participants,
    ).toHaveLength(2);
  });
});

describe("durable review persistence and Admin workflow", () => {
  it("persists paid review registrations instead of rolling them back", () => {
    expect(durableService).toContain(
      "complete_registration_for_identity_review",
    );
    expect(migration).toContain(
      "identity_review_status = 'review_required'",
    );
    expect(migration).toContain("p_payment_reference");
    expect(migration).toContain("return v_registration");
  });

  it("keeps pending registrations visible through the existing roster query", () => {
    expect(rosterService).not.toContain("identity_review_status");
    expect(rosterService).toContain(".eq(\"tournament_id\", tournamentId)");
  });

  it("preserves original submitted values", () => {
    expect(migration).toContain("original_first_name");
    expect(migration).toContain("original_last_name");
    expect(migration).toContain("original_email");
    expect(migration).toContain("original_phone");
    expect(migration).toContain(
      "AITT_REGISTRATION_REVIEW_SOURCE_IMMUTABLE",
    );
  });

  it("supports existing, different-existing, and approved-new resolution", () => {
    expect(actions).toContain("existingAnglerId");
    expect(resolutionForm).toContain("Confirm Existing");
    expect(resolutionForm).toContain("Approve New Angler");
    expect(migration).toContain("admin_confirmed_existing");
    expect(migration).toContain("admin_approved_new");
  });

  it("prevents duplicate new Anglers", () => {
    expect(migration).toContain(
      "AITT_REGISTRATION_REVIEW_DUPLICATE_ANGLER",
    );
    expect(migration).toContain("pg_advisory_xact_lock");
  });

  it("creates or reuses the validated Team or Solo Competitive Record", () => {
    expect(migration).toContain("public.create_competitive_record");
    expect(migration).toContain("v_registration.registration_type");
  });

  it("records auditable resolution and reopen history", () => {
    expect(migration).toContain("registration_identity_review_history");
    expect(migration).toContain("previous_status");
    expect(migration).toContain("previous_competitive_record_id");
    expect(migration).toContain("resolved_by_admin_id");
    expect(migration).toContain("admin_reopened");
    expect(actions).toContain("reopenRegistrationIdentityReview");
  });

  it("calculates pending and tournament summary counts accurately", () => {
    expect(
      summarizeRegistrationReviewStatuses([
        "verified",
        "review_required",
        "resolved_existing",
        "approved_new",
      ]),
    ).toEqual({ total: 4, verified: 1, pending: 1, resolved: 2 });
  });

  it("protects all review actions with Admin authorization", () => {
    expect(actions.match(/requireAdminUser\(\)/g)?.length).toBe(7);
    expect(migration).toContain("to service_role");
    expect(migration).toContain("from public, anon, authenticated");
  });

  it("exposes the future publication readiness helper without publishing", () => {
    const service = readFileSync(
      "lib/registration-identity-review.ts",
      "utf8",
    );
    expect(service).toContain("areAllRegistrationIdentitiesVerified");
    expect(migration).not.toContain("insert into public.tournament_results");
    expect(migration).not.toContain("tournament_aoy_points");
    expect(migration).not.toContain("championship_qualification");
  });
});
