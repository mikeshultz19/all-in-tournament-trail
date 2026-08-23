import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  createCanonicalCompetitiveRecordKey,
  createCanonicalTeamKey,
  normalizeAnglerDisplayName,
  normalizeAnglerName,
} from "@/lib/identity-normalization";
import { isMembershipEligibleForTournament } from "@/lib/membership-eligibility";
import {
  COMPETITIVE_RECORD_TYPES,
  TOURNAMENT_EVENT_TYPES,
  type Membership,
} from "@/types/aoy";

const ANGLER_A = "11111111-1111-4111-8111-111111111111";
const ANGLER_B = "22222222-2222-4222-8222-222222222222";
const SEASON_ID = "33333333-3333-4333-8333-333333333333";

const activeMembership: Membership = {
  id: "44444444-4444-4444-8444-444444444444",
  angler_id: ANGLER_A,
  season_id: SEASON_ID,
  status: "active",
  effective_date: "2026-03-01",
  first_eligible_tournament_id: null,
  source: "admin",
  payment_reference: null,
  admin_notes: null,
  created_at: "2026-03-01T12:00:00Z",
  updated_at: "2026-03-01T12:00:00Z",
};

describe("AITT identity primitives", () => {
  it("normalizes only safe name spacing, punctuation, and case", () => {
    expect(normalizeAnglerName("  John   O' Neal - Jr. ")).toBe(
      "john o'neal-jr.",
    );
    expect(normalizeAnglerDisplayName("  John   O' Neal ")).toBe(
      "John O'Neal",
    );
  });

  it("creates the same canonical key regardless of partner order", () => {
    expect(createCanonicalTeamKey([ANGLER_A, ANGLER_B])).toBe(
      createCanonicalTeamKey([ANGLER_B, ANGLER_A]),
    );
  });

  it("creates a stable canonical key for a genuine solo team", () => {
    expect(createCanonicalTeamKey([ANGLER_A])).toBe(ANGLER_A);
  });

  it("requires exactly two stable anglers for a Team Competitive Record", () => {
    expect(
      createCanonicalCompetitiveRecordKey("team", [
        ANGLER_B,
        ANGLER_A,
      ]),
    ).toBe(`${ANGLER_A}:${ANGLER_B}`);
    expect(() =>
      createCanonicalCompetitiveRecordKey("team", [ANGLER_A]),
    ).toThrow("exactly 2 stable anglers");
  });

  it("requires exactly one stable angler for a Solo Competitive Record", () => {
    expect(
      createCanonicalCompetitiveRecordKey("solo", [ANGLER_A]),
    ).toBe(ANGLER_A);
    expect(() =>
      createCanonicalCompetitiveRecordKey("solo", [
        ANGLER_A,
        ANGLER_B,
      ]),
    ).toThrow("exactly 1 stable angler");
  });

  it("rejects duplicate or more-than-two team members", () => {
    expect(() =>
      createCanonicalTeamKey([ANGLER_A, ANGLER_A]),
    ).toThrow("one or two distinct angler UUIDs");
    expect(() =>
      createCanonicalTeamKey([ANGLER_A, ANGLER_B, SEASON_ID]),
    ).toThrow("one or two distinct angler UUIDs");
  });
});

describe("AITT membership eligibility", () => {
  it("accepts an active same-season membership on its first eligible tournament date", () => {
      expect(
        isMembershipEligibleForTournament(
          {
            ...activeMembership,
            first_eligible_tournament_id:
              "77777777-7777-4777-8777-777777777777",
          },
          SEASON_ID,
          1,
          1,
        ),
      ).toBe(true);
    });

  it("rejects membership before its first eligible tournament", () => {
      expect(
        isMembershipEligibleForTournament(
          {
            ...activeMembership,
            first_eligible_tournament_id:
              "77777777-7777-4777-8777-777777777777",
          },
          SEASON_ID,
          1,
          2,
        ),
      ).toBe(false);
  });

  it("rejects cancelled membership", () => {
    expect(
        isMembershipEligibleForTournament(
          {
            ...activeMembership,
            status: "cancelled",
            first_eligible_tournament_id:
              "77777777-7777-4777-8777-777777777777",
          },
          SEASON_ID,
          2,
          1,
      ),
    ).toBe(false);
  });

  it("rejects membership from another season", () => {
    expect(
        isMembershipEligibleForTournament(
          {
            ...activeMembership,
            first_eligible_tournament_id:
              "77777777-7777-4777-8777-777777777777",
          },
          "55555555-5555-4555-8555-555555555555",
          2,
          1,
      ),
    ).toBe(false);
  });
});

describe("AITT AOY foundation migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202607280001_add_aoy_foundation.sql",
    "utf8",
  );

  it("supports regular-season and Championship event types", () => {
    expect(TOURNAMENT_EVENT_TYPES).toContain("championship");
    expect(migration).toContain(
      "event_type in ('regular_season', 'championship')",
    );
  });

  it("allows only one active season", () => {
    expect(migration).toContain("seasons_one_active_idx");
    expect(migration).toContain("where is_active = true");
  });

  it("limits teams to two positions", () => {
    expect(migration).toContain(
      "team_members_position_check check (member_position in (1, 2))",
    );
    expect(migration).toContain(
      "team_members_unique_position unique (team_id, member_position)",
    );
  });

  it("prevents duplicate unordered teams in one season", () => {
    expect(migration).toContain("teams_unique_season_members unique");
    expect(migration).toContain("canonical_member_key");
  });

  it("does not grant anonymous access to sensitive identity tables", () => {
    expect(migration).toContain(
      "grant select on table public.seasons to anon",
    );
    expect(migration).not.toMatch(
      /grant .*public\.(anglers|memberships|teams|team_members) to anon/,
    );
  });
});

describe("AITT Competitive Record foundation migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202607290001_add_competitive_record_foundation.sql",
    "utf8",
  );

  it("supports exactly Team and Solo Competitive Record types", () => {
    expect(COMPETITIVE_RECORD_TYPES).toEqual(["team", "solo"]);
    expect(migration).toContain(
      "check (record_type in ('team', 'solo'))",
    );
  });

  it("atomically creates records with exact stable membership", () => {
    expect(migration).toContain(
      "create or replace function public.create_competitive_record",
    );
    expect(migration).toContain(
      "AITT_COMPETITIVE_RECORD_MEMBER_COUNT_MISMATCH",
    );
    expect(migration).toContain(
      "grant execute on function public.create_competitive_record",
    );
    expect(migration).toContain("to service_role");
  });

  it("reuses one Solo Competitive Record for repeated registrations in the same season", () => {
    expect(migration).toContain("where season_id = p_season_id");
    expect(migration).toContain("and canonical_member_key = v_canonical_key");
    expect(migration).toContain("if found then");
    expect(migration).toContain("return v_record");
  });

  it("makes Competitive Record identity and membership immutable", () => {
    expect(migration).toContain(
      "AITT_COMPETITIVE_RECORD_IDENTITY_IMMUTABLE",
    );
    expect(migration).toContain(
      "AITT_COMPETITIVE_RECORD_MEMBERSHIP_IMMUTABLE",
    );
    expect(migration).toContain(
      "team_members_prevent_competitive_record_membership_change",
    );
  });

  it("requires new registrations to reference a Competitive Record", () => {
    expect(migration).toContain(
      "add column if not exists competitive_record_id uuid",
    );
    expect(migration).toContain(
      "tournament_registrations_competitive_record_id_fkey",
    );
    expect(migration).toContain(
      "AITT_REGISTRATION_COMPETITIVE_RECORD_REQUIRED",
    );
    expect(migration).toContain("before insert or update of competitive_record_id");
  });

  it("preserves legacy registrations for reviewed reconciliation and harmless updates", () => {
    expect(migration).toContain(
      "preventing harmless",
    );
    expect(migration).not.toContain(
      "delete from public.tournament_registrations",
    );
    expect(migration).not.toContain(
      "check (competitive_record_id is not null) not valid",
    );
  });

  it("enforces matching registration and Competitive Record types", () => {
    expect(migration).toContain(
      "AITT_REGISTRATION_COMPETITIVE_RECORD_TYPE_MISMATCH",
    );
    expect(migration).toContain(
      "AITT_REGISTRATION_COMPETITIVE_RECORD_SEASON_MISMATCH",
    );
  });
});
