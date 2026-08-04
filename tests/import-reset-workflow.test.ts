import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("selected-tournament import reset", () => {
  const migration = readFileSync("supabase/migrations/202608020004_add_import_verification_and_reset.sql", "utf8");

  it("clears only selected tournament import rows and derived closeout", () => {
    expect(migration).toContain("where tournament_id = p_tournament_id");
    expect(migration).toContain("delete from public.tournament_result_entries");
    expect(migration).toContain("delete from public.on_site_tournament_closeouts");
    expect(migration).toContain("result_status = 'pending'");
    expect(migration).toContain("results_verified_at = null");
    expect(migration).not.toContain("delete from public.tournament_registrations");
    expect(migration).not.toContain("delete from public.tournaments");
  });

  it("preserves schedule, registration, payment, and Insurance Pot configuration", () => {
    expect(migration).not.toMatch(/insurance_payout\s*=|tournament_date\s*=|registration_/);
  });

  it("records reset audit history and blocks published reset without override", () => {
    expect(migration).toContain("tournament_import_reset_audit");
    expect(migration).toContain("AITT_PUBLISHED_RESULTS_OVERRIDE_REQUIRED");
    expect(migration).toContain("p_override_published");
  });

  it("invalidates generated payout and unpublished downstream workflow state", () => {
    expect(migration).toContain("delete from public.on_site_tournament_closeouts");
    expect(migration).toContain("weighfish_imported_at = null");
    expect(migration).toContain("result_status = 'pending'");
  });

  it("provides explicit verification after durable rows exist", () => {
    expect(migration).toContain("verify_tournament_import");
    expect(migration).toContain("results_verified_at = now()");
    expect(migration).toContain("AITT_IMPORT_HAS_NO_ROWS");
  });
});
