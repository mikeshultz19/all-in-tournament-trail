import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202607290007_add_official_results_historical_snapshot.sql",
  "utf8",
);

describe("Official Results historical snapshot foundation", () => {
  it("preserves registration and stable Competitive Record ownership", () => {
    expect(migration).toContain("registration_id uuid");
    expect(migration).toContain("competitive_record_id");
    expect(migration).toContain("record_type text");
    expect(migration).toContain("AITT_RESULT_HISTORICAL_OWNERSHIP_INVALID");
    expect(migration).toContain(
      "unique (tournament_id, registration_id)",
    );
  });

  it("preserves every constitutional participation state", () => {
    for (const status of [
      "participated",
      "withdrew_after_start",
      "no_show",
      "disqualified",
    ]) {
      expect(migration).toContain(status);
    }
    expect(migration).toContain("source_placement");
    expect(migration).toContain("alter column place drop not null");
  });

  it("persists a reviewed historical eligibility snapshot", () => {
    expect(migration).toContain("aoy_eligible boolean");
    expect(migration).toContain("aoy_eligibility_snapshot jsonb");
    expect(migration).toContain("eligibility_reviewed_at");
    expect(migration).toContain("eligibility_reviewed_by_admin_id");
    expect(migration).toContain("'membershipSnapshot'");
  });

  it("blocks publication until every historical fact is reviewed", () => {
    expect(migration).toContain(
      "AITT_OFFICIAL_RESULTS_HISTORICAL_REVIEW_REQUIRED",
    );
    expect(migration).toContain(
      "review_working_result_history",
    );
  });

  it("preserves raw import data separately from corrected values", () => {
    expect(migration).toContain("original_import_data");
    expect(migration).toContain("source_placement");
    expect(migration).not.toContain(
      "set original_import_data =",
    );
  });

  it("keeps post-publication corrections audited and protected", () => {
    expect(migration).toContain("correct_official_result_history");
    expect(migration).toContain("official_result_corrections");
    expect(migration).toContain("previous_value");
    expect(migration).toContain("new_value");
    expect(migration).toContain("p_reason");
    expect(migration).toContain("p_admin_user_id");
    expect(migration).toContain(
      "from public, anon, authenticated",
    );
  });

  it("does not implement AOY or Championship calculations", () => {
    expect(migration).not.toContain("aoy_points :=");
    expect(migration).not.toContain("championship_qualification");
  });
});
