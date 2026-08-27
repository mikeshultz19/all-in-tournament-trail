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
const permissiveMigration = readFileSync(
  "supabase/migrations/202608220003_make_registration_identity_review_permissive.sql",
  "utf8",
);
const highConfidenceMigration = readFileSync(
  "supabase/migrations/202608250002_auto_resolve_high_confidence_registration_identity.sql",
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
  it("automatically verifies normalized email and phone on the same canonical angler", () => {
    const result = classifyRegistrationIdentity(
      [submitted({ email: " JOHN@EXAMPLE.COM ", mobilePhone: "817 555 0100" })],
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

  it("uses matching email and phone as authoritative without rewriting the submitted name", () => {
    const result = classifyRegistrationIdentity(
      [submitted({ firstName: "Jonathan" })],
      [angler("11111111-1111-4111-8111-111111111111", "John", "Smith", "john@example.com", "817-555-0100")],
    );
    expect(result.participants[0]).toMatchObject({
      status: "verified",
      reason: null,
      suggestedAnglerIds: ["11111111-1111-4111-8111-111111111111"],
    });
  });

  it("treats a name difference by itself as a separate person", () => {
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
    ).toBe("verified");
  });

  it("requires review for a name-only match", () => {
    const result = classifyRegistrationIdentity(
      [submitted({ firstName: "Joe", lastName: "Johnson", email: "joe-two@example.com", mobilePhone: "817-555-2222", streetAddress: "99 Different Road", city: "Azle", zipCode: "76020" })],
      [angler("b02874df-b3d9-4828-a240-12486a404463", "Joe", "Johnson", "joe-one@example.com", "817-555-0100")],
    );
    expect(result.status).toBe("review_required");
    expect(result.participants).toHaveLength(1);
    expect(result.participants[0]).toMatchObject({
      status: "review_required",
      suggestedAnglerIds: ["b02874df-b3d9-4828-a240-12486a404463"],
    });
  });

  it("flags a same-tournament strong identity overlap as a duplicate participation review", () => {
    const result = classifyRegistrationIdentity(
      [submitted({ firstName: "Joe", lastName: "Johnson", email: "allintournamenttrail@gmail.com", mobilePhone: "676-767-6767" })],
      [angler("b02874df-b3d9-4828-a240-12486a404463", "Joe", "Johnson", "allintournamenttrail@gmail.com", "676-767-6767")],
      { activeTournamentAnglerIds: new Set(["b02874df-b3d9-4828-a240-12486a404463"]) },
    );
    expect(result.status).toBe("review_required");
    expect(result.participants[0].reason).toBe("Possible duplicate tournament participation: Joe Johnson is already entered in this tournament.");
  });

  it("keeps a high-confidence email and phone match despite other submitted snapshot differences", () => {
    const existing = {
      ...angler("11111111-1111-4111-8111-111111111111", "John", "Smith", "john@example.com", "817-555-0100"),
      street_address: "1 Existing Road",
      city: "Azle",
      state: "TX",
      zip_code: "76020",
    };
    const result = classifyRegistrationIdentity(
      [submitted({ streetAddress: "99 Submitted Road", city: "Azle", zipCode: "76020" })],
      [existing],
    );
    expect(result.status).toBe("verified");
    expect(result.participants[0]).toMatchObject({
      status: "verified",
      reason: null,
      suggestedAnglerIds: ["11111111-1111-4111-8111-111111111111"],
    });
  });

  it("reviews an email-only match when the submitted phone differs", () => {
    const result = classifyRegistrationIdentity(
      [submitted({ mobilePhone: "817-555-0199" })],
      [angler("11111111-1111-4111-8111-111111111111", "John", "Smith", "john@example.com", "817-555-0100")],
    );
    expect(result.status).toBe("review_required");
  });

  it("reviews a phone-only match when the submitted email differs", () => {
    const result = classifyRegistrationIdentity(
      [submitted({ email: "changed@example.com" })],
      [angler("11111111-1111-4111-8111-111111111111", "John", "Smith", "john@example.com", "817-555-0100")],
    );
    expect(result.status).toBe("review_required");
  });

  it("reviews conflicting email and phone candidates", () => {
    const result = classifyRegistrationIdentity([submitted()], [
      angler("11111111-1111-4111-8111-111111111111", "John", "Smith", "john@example.com", "817-555-0199"),
      angler("22222222-2222-4222-8222-222222222222", "Other", "Person", "other@example.com", "817-555-0100"),
    ]);
    expect(result.status).toBe("review_required");
    expect(result.participants[0].reason).toBe("Submitted email and phone are associated with different existing anglers.");
  });

  it("does not force review for name-only similarity", () => {
    expect(
      classifyRegistrationIdentity(
        [
          submitted({
            firstName: "Rob",
            lastName: "Jones",
            email: "rob@new.example",
            mobilePhone: "817-555-0191",
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
    ).toBe("verified");
  });

  it("requires review for name-only overlap without stronger identity evidence", () => {
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
    expect(classifyRegistrationIdentity([submitted({ membership: "current" })], []).status).toBe("review_required");
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
  it("auto-resolves only a verified single-candidate participant in a mixed review", () => {
    expect(highConfidenceMigration).toContain(
      "v_classification ->> 'status' = 'verified'",
    );
    expect(highConfidenceMigration).toContain(
      "jsonb_array_length(v_candidate_ids) = 1",
    );
    expect(highConfidenceMigration).toContain(
      "review_status = 'resolved_existing'",
    );
    expect(highConfidenceMigration).toContain(
      "resolution_method = 'automatic_email_phone_match'",
    );
    expect(highConfidenceMigration).toContain(
      "angler1_id = case when v_index = 0 then v_candidate_id",
    );
    expect(highConfidenceMigration).toContain(
      "angler2_id = case when v_index = 1 then v_candidate_id",
    );
    expect(highConfidenceMigration).toContain(
      "participant_contact_snapshot = v_contact_snapshot",
    );
    expect(highConfidenceMigration).toContain(
      "membership_snapshot = v_membership_snapshot",
    );
    expect(highConfidenceMigration).not.toMatch(
      /update public\.anglers\s+set/i,
    );
    expect(highConfidenceMigration).not.toMatch(
      /insert into public\.anglers/i,
    );
  });

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
    expect(resolutionForm).toContain("Confirm Match");
    expect(resolutionForm).not.toContain("Confirm Existing");
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

  it("lets an Admin explicitly approve a separate person despite a shared contact value", () => {
    expect(permissiveMigration).toContain("shared contact value is evidence for review");
    expect(permissiveMigration).not.toContain("AITT_REGISTRATION_REVIEW_DUPLICATE_ANGLER");
    expect(permissiveMigration).toContain("registration-review-new-person:");
  });

  it("defers disputed membership entitlement but not Competitive Record creation", () => {
    expect(permissiveMigration).toContain("Possible Duplicate Membership Purchase:");
    expect(permissiveMigration).toContain("new.review_kind <> 'membership'");
    expect(permissiveMigration).toContain("canonical_angler_id is null");
    expect(permissiveMigration).toContain("public.create_competitive_record");
    expect(permissiveMigration).toContain("set review_kind = 'membership', review_status = 'review_required'");
    expect(permissiveMigration).toContain("Membership Needs Review:");
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
