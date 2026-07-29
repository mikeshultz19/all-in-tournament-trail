import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  createDeterministicSourceIdentityKey,
  findCompetitiveRecordByMembers,
  findRegistrationEvidence,
  matchSourceAnglerIdentity,
  prepareImportedParticipant,
} from "@/lib/identity-reconciliation-core";
import type {
  Angler,
  TeamWithMembers,
  TournamentRegistration,
} from "@/types/aoy";
import type { SourceAnglerIdentity } from "@/types/identity-reconciliation";

const migration = readFileSync(
  "supabase/migrations/202607290004_add_identity_reconciliation_foundation.sql",
  "utf8",
);
const actions = readFileSync(
  "app/admin/tournament-manager/import/reconciliation-actions.ts",
  "utf8",
);

const ANGLER_A = "11111111-1111-4111-8111-111111111111";
const ANGLER_B = "22222222-2222-4222-8222-222222222222";
const ANGLER_C = "33333333-3333-4333-8333-333333333333";
const SEASON = "44444444-4444-4444-8444-444444444444";
const TOURNAMENT = "55555555-5555-4555-8555-555555555555";
const TEAM = "66666666-6666-4666-8666-666666666666";

function angler(
  id: string,
  displayName: string,
  email: string | null = null,
): Angler {
  const [firstName, ...lastParts] = displayName.split(" ");
  return {
    id,
    first_name: firstName,
    last_name: lastParts.join(" "),
    display_name: displayName,
    normalized_name: displayName.toLowerCase(),
    email,
    phone: null,
    is_active: true,
    merged_into_angler_id: null,
    created_at: "2026-07-29T00:00:00Z",
    updated_at: "2026-07-29T00:00:00Z",
  };
}

function sourceIdentity(
  values: Partial<SourceAnglerIdentity> = {},
): SourceAnglerIdentity {
  return {
    id: "77777777-7777-4777-8777-777777777777",
    source_system: "weighfish",
    source_identity_key: "source-1",
    source_display_name: "Jon Smith",
    normalized_name: "jon smith",
    source_metadata: {},
    angler_id: null,
    reconciliation_status: "unresolved",
    resolution_method: null,
    resolved_at: null,
    resolved_by_admin_id: null,
    created_at: "2026-07-29T00:00:00Z",
    updated_at: "2026-07-29T00:00:00Z",
    ...values,
  };
}

function record(
  id: string,
  type: "team" | "solo",
  anglers: Angler[],
): TeamWithMembers {
  return {
    id,
    season_id: SEASON,
    record_type: type,
    display_name: anglers.map((item) => item.display_name).join(" / "),
    canonical_member_key: anglers
      .map((item) => item.id)
      .sort()
      .join(":"),
    is_active: true,
    created_at: "2026-07-29T00:00:00Z",
    updated_at: "2026-07-29T00:00:00Z",
    members: anglers.map((item, index) => ({
      team_id: id,
      angler_id: item.id,
      member_position: (index + 1) as 1 | 2,
      created_at: "2026-07-29T00:00:00Z",
      angler: item,
    })),
  };
}

describe("Identity Reconciliation matching", () => {
  const john = angler(ANGLER_A, "John Smith", "john@example.com");
  const mike = angler(ANGLER_B, "Mike Jones", "mike@example.com");

  it("reuses an exact confirmed alias before attempting candidate matching", () => {
    expect(
      matchSourceAnglerIdentity(
        sourceIdentity({
          angler_id: john.id,
          reconciliation_status: "confirmed",
        }),
        [],
      ),
    ).toMatchObject({
      status: "confirmed",
      anglerId: john.id,
      method: "confirmed_alias",
    });
  });

  it("confirms one exact trusted email match", () => {
    expect(
      matchSourceAnglerIdentity(
        sourceIdentity({
          source_metadata: { email: " JOHN@EXAMPLE.COM " },
        }),
        [john, mike],
      ),
    ).toMatchObject({
      status: "confirmed",
      anglerId: john.id,
      method: "trusted_email",
    });
  });

  it("confirms one exact normalized canonical name", () => {
    expect(
      matchSourceAnglerIdentity(
        sourceIdentity({ normalized_name: "john smith" }),
        [john, mike],
      ),
    ).toMatchObject({
      status: "confirmed",
      anglerId: john.id,
      method: "exact_normalized_name",
    });
  });

  it("requires review for duplicate normalized names", () => {
    const duplicate = angler(ANGLER_C, "John Smith");
    expect(
      matchSourceAnglerIdentity(
        sourceIdentity({ normalized_name: "john smith" }),
        [john, duplicate],
      ),
    ).toMatchObject({
      status: "review_required",
      anglerId: null,
      code: "AITT_IDENTITY_REVIEW_REQUIRED",
    });
  });

  it("produces suggestions only for partial name matches", () => {
    expect(
      matchSourceAnglerIdentity(sourceIdentity(), [
        angler(ANGLER_A, "Jonathan Smith"),
      ]),
    ).toMatchObject({
      status: "suggested",
      anglerId: null,
      method: "partial_name",
    });
  });

  it("creates stable deterministic keys when a source key is unavailable", () => {
    const first = createDeterministicSourceIdentityKey(
      "WeighFish",
      " John Smith ",
      "JOHN@example.com",
    );
    const second = createDeterministicSourceIdentityKey(
      "weighfish",
      "Different Display",
      "john@example.com",
    );
    expect(first).toBe(second);
    expect(
      prepareImportedParticipant("weighfish", {
        displayName: " John Smith ",
        email: "JOHN@example.com",
      }).sourceIdentityKey,
    ).toBe(first);
  });

  it("matches Team membership independent of source member order", () => {
    const team = record(TEAM, "team", [john, mike]);
    expect(
      findCompetitiveRecordByMembers(
        "team",
        [mike.id, john.id],
        [team],
      )?.id,
    ).toBe(team.id);
  });

  it("never resolves Team identities to Solo records or Solo to Team", () => {
    const team = record(TEAM, "team", [john, mike]);
    const solo = record(ANGLER_C, "solo", [john]);
    expect(
      findCompetitiveRecordByMembers("team", [john.id, mike.id], [
        solo,
        team,
      ])?.id,
    ).toBe(team.id);
    expect(
      findCompetitiveRecordByMembers("solo", [john.id], [team, solo])?.id,
    ).toBe(solo.id);
  });

  it("uses same-tournament durable registration as trusted evidence", () => {
    const registration: TournamentRegistration = {
      id: "88888888-8888-4888-8888-888888888888",
      registration_key: "AITT-TEST",
      tournament_id: TOURNAMENT,
      competitive_record_id: TEAM,
      angler1_id: john.id,
      angler2_id: mike.id,
      registered_at: "2026-07-29T00:00:00Z",
      registration_type: "team",
      angler1_name: john.display_name,
      angler2_name: mike.display_name,
      big_bass: false,
      member_pot: null,
      insurance: false,
      payment_reference: "payment",
      membership_snapshot: [],
      price_snapshot: {},
      rules_version: "1.0",
      waiver_version: "1.0",
      rules_accepted_at: "2026-07-29T00:00:00Z",
      identity_review_status: "verified",
      admin_notes: null,
      created_at: "2026-07-29T00:00:00Z",
      updated_at: "2026-07-29T00:00:00Z",
    };

    expect(
      findRegistrationEvidence(
        TOURNAMENT,
        "team",
        [mike.id, john.id],
        [registration],
      )?.id,
    ).toBe(registration.id);
  });
});

describe("Identity Reconciliation database integrity", () => {
  it("preserves source values and immutable tournament sequence", () => {
    expect(migration).toContain("AITT_SOURCE_IDENTITY_IMMUTABLE");
    expect(migration).toContain("AITT_IMPORTED_IDENTITY_SOURCE_IMMUTABLE");
    expect(migration).toContain(
      "regular_season_number is distinct from old.regular_season_number",
    );
  });

  it("makes repeated source and imported entry recording idempotent", () => {
    expect(migration).toContain(
      "unique (source_system, source_identity_key)",
    );
    expect(migration).toContain(
      "unique (source_system, source_entry_key)",
    );
    expect(migration).toContain("record_imported_competitive_identity");
    expect(migration).toContain("return v_imported;");
    expect(migration).toContain("AITT_IMPORTED_IDENTITY_KEY_COLLISION");
    expect(migration).toContain(
      "on conflict (source_system, source_identity_key) do nothing",
    );
  });

  it("prevents duplicate Angler or Competitive Record creation", () => {
    expect(migration).not.toContain("insert into public.anglers");
    expect(migration).not.toContain("insert into public.teams");
    expect(actions).toContain("createAndResolveImportedIdentity");
  });

  it("enforces canonical member composition and Team/Solo type", () => {
    expect(migration).toContain(
      "AITT_IDENTITY_COMPETITIVE_RECORD_MISMATCH",
    );
    expect(migration).toContain(
      "AITT_IDENTITY_COMPETITIVE_RECORD_MEMBERS_MISMATCH",
    );
    expect(migration).toContain(
      "and record_type = v_previous.record_type",
    );
  });

  it("records confirmation, rejection, and reassignment history", () => {
    expect(migration).toContain("source_angler_identity_history");
    expect(migration).toContain("imported_competitive_identity_history");
    expect(actions).toContain("admin_confirmation");
    expect(actions).toContain("admin_reassignment");
    expect(actions).toContain("admin_rejection");
  });

  it("persists candidate references without silently resolving them", () => {
    expect(migration).toContain("set_source_identity_candidates");
    expect(migration).toContain("set_imported_identity_candidates");
    expect(migration).toContain(
      "p_status not in ('unresolved', 'suggested', 'review_required')",
    );
  });

  it("protects writes with Admin authorization and service-role RPCs", () => {
    expect(actions.match(/requireAdminUser\(\)/g)?.length).toBe(5);
    expect(migration).toContain(
      "grant execute on function public.resolve_source_angler_identity",
    );
    expect(migration).toContain(
      "grant execute on function public.resolve_imported_competitive_identity",
    );
    expect(migration).toContain("to service_role");
    expect(migration).toContain("from public, anon, authenticated");
  });

  it("does not implement publication, AOY, or Championship calculations", () => {
    expect(migration).not.toContain("insert into public.tournament_results");
    expect(migration).not.toContain("insert into public.tournament_aoy_points");
    expect(migration).not.toContain("championship_qualification");
  });
});
