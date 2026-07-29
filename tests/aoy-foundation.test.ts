import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  createCanonicalTeamKey,
  normalizeAnglerDisplayName,
  normalizeAnglerName,
} from "@/lib/identity-normalization";
import { isMembershipEligibleOnDate } from "@/lib/membership-eligibility";
import {
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
        isMembershipEligibleOnDate(
          {
            ...activeMembership,
            first_eligible_tournament_id:
              "77777777-7777-4777-8777-777777777777",
          },
          SEASON_ID,
          "2026-03-01T06:00:00-06:00",
          "2026-03-01T06:00:00-06:00",
        ),
      ).toBe(true);
    });

  it("rejects membership before its first eligible tournament", () => {
      expect(
        isMembershipEligibleOnDate(
          {
            ...activeMembership,
            first_eligible_tournament_id:
              "77777777-7777-4777-8777-777777777777",
          },
          SEASON_ID,
          "2026-02-28",
          "2026-03-01",
        ),
      ).toBe(false);
  });

  it("rejects cancelled membership", () => {
    expect(
        isMembershipEligibleOnDate(
          {
            ...activeMembership,
            status: "cancelled",
            first_eligible_tournament_id:
              "77777777-7777-4777-8777-777777777777",
          },
          SEASON_ID,
          "2026-04-01",
          "2026-03-01",
      ),
    ).toBe(false);
  });

  it("rejects membership from another season", () => {
    expect(
        isMembershipEligibleOnDate(
          {
            ...activeMembership,
            first_eligible_tournament_id:
              "77777777-7777-4777-8777-777777777777",
          },
          "55555555-5555-4555-8555-555555555555",
          "2026-04-01",
          "2026-03-01",
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
