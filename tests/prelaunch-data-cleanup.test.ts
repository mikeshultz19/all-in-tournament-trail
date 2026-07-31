import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const cleanup = readFileSync(
  "supabase/migrations/202607300002_remove_prelaunch_operational_test_data.sql",
  "utf8",
);

describe("pre-launch operational data cleanup", () => {
  it("removes only registrations, results, leaderboards, and AOY test rows", () => {
    for (const table of [
      "tournament_registrations",
      "tournament_result_entries",
      "tournament_results",
      "tournament_aoy_points",
    ]) {
      expect(cleanup).toContain(`delete from public.${table}`);
    }
  });

  it("does not delete protected production content or member records", () => {
    for (const table of [
      "tournaments",
      "news",
      "seasons",
      "anglers",
      "memberships",
      "teams",
      "team_members",
    ]) {
      expect(cleanup).not.toContain(`delete from public.${table}`);
    }
  });

  it("aborts if the audited live row counts change", () => {
    expect(cleanup).toContain("registration_count <> 6");
    expect(cleanup).toContain("result_entry_count <> 60");
    expect(cleanup).toContain("result_summary_count <> 2");
    expect(cleanup).toContain("aoy_point_count <> 6");
    expect(cleanup).toContain("AITT_PRELAUNCH_CLEANUP_DATA_CHANGED");
  });

  it("preserves official-results immutability after the cleanup transaction", () => {
    expect(cleanup).toContain(
      "set_config('aitt.official_correction', 'on', true)",
    );
    expect(cleanup).toContain(
      "disable trigger working_results_prevent_official_changes",
    );
    expect(cleanup).toContain(
      "enable trigger working_results_prevent_official_changes",
    );
  });
});
