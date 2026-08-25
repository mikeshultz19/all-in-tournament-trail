import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608240001_limit_publish_review_blocker_to_active_registrations.sql",
  "utf8",
);

describe("Official Results active registration review protection", () => {
  it("ignores cancelled review-required registrations", () => {
    expect(migration).toMatch(
      /registration_status = 'active'\s+and identity_review_status = 'review_required'/,
    );
  });

  it("keeps active review-required registrations blocked", () => {
    expect(migration).toContain("AITT_OFFICIAL_RESULTS_IDENTITY_REVIEW_REQUIRED");
    expect(migration).toMatch(
      /if exists \(\s+select 1 from public\.tournament_registrations[\s\S]*?registration_status = 'active'[\s\S]*?identity_review_status = 'review_required'[\s\S]*?\) then/,
    );
  });

  it("preserves the remaining publication protections", () => {
    for (const protection of [
      "AITT_OFFICIAL_RESULTS_INVALID_SEASON",
      "AITT_OFFICIAL_RESULTS_IMMUTABLE",
      "AITT_OFFICIAL_RESULTS_INVALID_TOURNAMENT_NUMBER",
      "AITT_OFFICIAL_RESULTS_VALIDATION_FAILED",
      "record.season_id <> v_tournament.season_id",
      "imported.reconciliation_status <> 'confirmed'",
    ]) {
      expect(migration).toContain(protection);
    }
  });
});
