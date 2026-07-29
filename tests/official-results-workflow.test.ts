import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202607290006_add_official_results_workflow.sql",
  "utf8",
);
const importAction = readFileSync(
  "app/admin/tournament-manager/import/actions.ts",
  "utf8",
);
const publishAction = readFileSync(
  "app/admin/tournament-manager/publish/actions.ts",
  "utf8",
);
const correctionActions = readFileSync(
  "app/admin/results/correction-actions.ts",
  "utf8",
);
const legacyActions = readFileSync(
  "app/admin/results/actions.ts",
  "utf8",
);
const resultsService = readFileSync("lib/results.ts", "utf8");

describe("Official Results workflow", () => {
  it("imports editable Working Results transactionally", () => {
    expect(importAction).toContain("import_working_results");
    expect(migration).toContain(
      "create or replace function public.import_working_results",
    );
    expect(migration).toContain("delete from public.tournament_result_entries");
    expect(migration).toContain("result_status = 'imported'");
  });

  it("preserves original imported source values and import history", () => {
    expect(migration).toContain("original_import_data");
    expect(migration).toContain("working_result_audit");
    expect(migration).toContain("'replace_import'");
    expect(migration).toContain("previous_value");
    expect(migration).toContain("new_value");
  });

  it("allows documented corrections while results are working", () => {
    expect(migration).toContain(
      "create or replace function public.correct_working_result",
    );
    expect(migration).toContain("AITT_WORKING_CORRECTION_INPUT_INVALID");
    expect(migration).toContain("result_status = 'under_review'");
    expect(correctionActions).toContain("correctWorkingResult");
  });

  it("blocks publication while registration identity review is pending", () => {
    expect(migration).toContain(
      "identity_review_status = 'review_required'",
    );
    expect(migration).toContain(
      "AITT_OFFICIAL_RESULTS_IDENTITY_REVIEW_REQUIRED",
    );
  });

  it("requires canonical Competitive Records and valid immutable numbering", () => {
    expect(migration).toContain("competitive_record_id is null");
    expect(migration).toContain(
      "v_tournament.regular_season_number not between 1 and 8",
    );
    expect(migration).toContain("record.season_id <> v_tournament.season_id");
  });

  it("publishes one immutable Official Results snapshot atomically", () => {
    expect(publishAction).toContain("publishOfficialResults");
    expect(migration).toContain(
      "create or replace function public.publish_official_results",
    );
    expect(migration).toContain("insert into public.official_result_entries");
    expect(migration).toContain("official_results_publication_audit");
    expect(migration).toContain("result_status = 'official'");
    expect(migration).toContain("status = 'Results Published'");
  });

  it("freezes placements, weights, penalties, identities, and ownership", () => {
    expect(migration).toContain("official_result_entries_prevent_update");
    expect(migration).toContain("working_results_prevent_official_changes");
    expect(migration).toContain("AITT_OFFICIAL_RESULTS_IMMUTABLE");
    expect(migration).toContain("competitive_record_id uuid not null");
    expect(migration).toContain("penalty_weight numeric not null");
  });

  it("requires audited constitutional correction reasons", () => {
    expect(migration).toContain(
      "create or replace function public.correct_official_result",
    );
    expect(migration).toContain("official_result_corrections");
    expect(migration).toContain("previous_value");
    expect(migration).toContain("new_value");
    expect(migration).toContain("p_admin_user_id");
    expect(correctionActions).toContain("correctOfficialResult");
  });

  it("protects import, publication, and corrections server-side", () => {
    expect(importAction).toContain("requireAdminUser()");
    expect(publishAction).toContain("requireAdminUser()");
    expect(correctionActions.match(/requireAdminUser\(\)/g)?.length).toBe(4);
    expect(migration).toContain("to service_role");
    expect(migration).toContain("from public, anon, authenticated");
  });

  it("removes the legacy Results editor as a publication bypass", () => {
    expect(legacyActions).toContain(
      "Use Tournament Manager to import, review, and publish Official Results.",
    );
    expect(legacyActions).not.toContain("saveTournamentResults(");
  });

  it("serves only official snapshots to public Results pages", () => {
    expect(resultsService).toContain(
      'tournament?.result_status !== "official"',
    );
    expect(resultsService).toContain('.eq("result_status", "official")');
    expect(resultsService).toContain("regular_season_number");
  });

  it("does not implement AOY or Championship calculations", () => {
    expect(migration).not.toContain("insert into public.tournament_aoy_points");
    expect(migration).not.toContain("championship_qualification");
  });
});
