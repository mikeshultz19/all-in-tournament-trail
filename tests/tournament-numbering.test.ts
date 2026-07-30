import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { isMembershipEligibleForTournament } from "@/lib/membership-eligibility";
import type { Membership } from "@/types/aoy";

const migration = readFileSync(
  "supabase/migrations/202607290002_add_immutable_regular_season_number.sql",
  "utf8",
);

const membership: Membership = {
  id: "11111111-1111-4111-8111-111111111111",
  angler_id: "22222222-2222-4222-8222-222222222222",
  season_id: "33333333-3333-4333-8333-333333333333",
  status: "active",
  effective_date: "2026-07-01",
  first_eligible_tournament_id:
    "44444444-4444-4444-8444-444444444444",
  source: "admin",
  payment_reference: null,
  admin_notes: null,
  created_at: "2026-07-01T12:00:00Z",
  updated_at: "2026-07-01T12:00:00Z",
};

describe("immutable regular-season tournament numbering", () => {
  it("supports the complete constitutional 1-8 schedule", () => {
    expect(new Set(Array.from({ length: 8 }, (_, index) => index + 1))).toEqual(
      new Set([1, 2, 3, 4, 5, 6, 7, 8]),
    );
    expect(migration).toContain(
      "regular_season_number between 1 and 8",
    );
  });

  it("requires Championship events to remain unnumbered", () => {
    expect(migration).toContain(
      "event_type = 'championship' and regular_season_number is null",
    );
  });

  it("rejects duplicate numbers within one season", () => {
    expect(migration).toContain(
      "tournaments_unique_regular_season_number_idx",
    );
    expect(migration).toContain(
      "(season_id, regular_season_number)",
    );
  });

  it("numbers the official November Eagle Mountain and safely ignores an unused March copy", () => {
    expect(migration).toContain("date '2026-11-01'");
    expect(migration).toContain("v_official_eagle_count > 1");
    expect(migration).toContain(
      "AITT_REGULAR_SEASON_NUMBER_AMBIGUOUS_EAGLE_MOUNTAIN",
    );
    expect(migration).toContain("date '2027-03-14'");
    expect(migration).toContain("set season_id = null");
    expect(migration).toContain("public.tournament_registrations");
    expect(migration).toContain("public.tournament_results");
    expect(migration).toContain("public.tournament_aoy_points");
    expect(migration).toContain("membership.first_eligible_tournament_id");
  });

  it("makes the number, season, and regular-season identity immutable", () => {
    expect(migration).toContain(
      "AITT_REGULAR_SEASON_IDENTITY_IMMUTABLE",
    );
    expect(migration).toContain(
      "before update of regular_season_number, season_id, event_type",
    );
    expect(migration).not.toContain(
      "before update of tournament_date",
    );
  });

  it("does not derive numbering from tournament dates", () => {
    expect(migration).not.toMatch(
      /row_number\s*\(\s*\)\s*over\s*\(\s*order by\s+tournament_date/i,
    );
    expect(migration).toContain("where id = v_official_eagle_id");
  });

  it("uses tournament numbers for First Eligible Tournament ordering", () => {
    expect(migration).toContain(
      "AITT_MEMBERSHIP_FIRST_ELIGIBLE_TOURNAMENT_REVIEW_REQUIRED",
    );
    expect(migration).toContain(
      "AITT_MEMBERSHIP_FIRST_ELIGIBLE_TOURNAMENT_INVALID",
    );
    expect(
      isMembershipEligibleForTournament(
        membership,
        membership.season_id,
        3,
        4,
      ),
    ).toBe(false);
    expect(
      isMembershipEligibleForTournament(
        membership,
        membership.season_id,
        4,
        4,
      ),
    ).toBe(true);
    expect(
      isMembershipEligibleForTournament(
        membership,
        membership.season_id,
        8,
        4,
      ),
    ).toBe(true);
  });

  it("retains eligibility order when a postponed tournament date moves", () => {
    const postponedTournamentNumber = 3;
    const firstEligibleTournamentNumber = 4;

    expect(
      isMembershipEligibleForTournament(
        membership,
        membership.season_id,
        postponedTournamentNumber,
        firstEligibleTournamentNumber,
      ),
    ).toBe(false);
  });

  it("keeps active membership valid through an unnumbered Championship", () => {
    expect(
      isMembershipEligibleForTournament(
        membership,
        membership.season_id,
        null,
        4,
        "championship",
      ),
    ).toBe(true);
  });
});
