import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("stale official-results recovery", () => {
  const component = readFileSync("components/admin/StaleOfficialResultsReset.tsx", "utf8");
  const resetAction = readFileSync("app/admin/tournament-manager/import/workflow-actions.ts", "utf8");
  const migration = readFileSync("supabase/migrations/202608020004_add_import_verification_and_reset.sql", "utf8");

  it("reuses the authorized tournament-scoped reset workflow", () => {
    expect(component).toContain("resetImportedResultsAction(tournamentId, true)");
    expect(component).toContain("Reset Tournament Results and Start Over");
    expect(resetAction).toContain('rpc("reset_tournament_import"');
  });

  it("preserves tournament setup while resetting downstream result state", () => {
    expect(migration).toContain("where tournament_id = p_tournament_id");
    expect(migration).toContain("result_status = 'pending'");
    expect(migration).toContain("results_verified_at = null");
    expect(migration).not.toContain("delete from public.tournament_registrations");
    expect(migration).not.toContain("delete from public.tournaments");
  });
});
