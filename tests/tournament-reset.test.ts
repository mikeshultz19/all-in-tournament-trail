import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202607280012_safe_tournament_reset.sql",
  "utf8",
);

describe("production-safe tournament reset", () => {
  it("scopes every activity delete to the selected tournament UUID", () => {
    for (const table of [
      "tournament_registrations",
      "tournament_result_entries",
      "tournament_results",
      "tournament_aoy_points",
    ]) {
      expect(migration).toMatch(
        new RegExp(
          `delete from public\\.${table}[\\s\\S]*?where tournament_id = p_tournament_id`,
          "i",
        ),
      );
    }
  });

  it("never deletes members, memberships, seasons, tournaments, or Admin users", () => {
    for (const table of [
      "anglers",
      "memberships",
      "seasons",
      "tournaments",
      "auth.users",
    ]) {
      expect(migration.toLowerCase()).not.toContain(
        `delete from public.${table}`,
      );
    }
  });

  it("preserves tournament configuration and logs the reset", () => {
    expect(migration).toContain("where id = p_tournament_id");
    expect(migration).toContain("status = 'Ready for Registration'");
    expect(migration).toContain("insert into public.tournament_reset_log");
    expect(migration).toContain("admin_user_id");
    expect(migration).toContain("registrations_deleted");
    expect(migration).not.toContain("season_id = null");
    expect(migration).not.toContain("practice_information = null");
    expect(migration).not.toContain("registration_information = null");
  });

  it("requires the production feature flag and two confirmations", () => {
    const helper = readFileSync("lib/tournament-reset.ts", "utf8");
    const action = readFileSync(
      "app/admin/tournament-manager/reset/actions.ts",
      "utf8",
    );
    const form = readFileSync(
      "components/admin/TournamentResetForm.tsx",
      "utf8",
    );

    expect(helper).toContain("ENABLE_PRODUCTION_TOURNAMENT_RESET");
    expect(action).toContain("requireAdminUser");
    expect(action).toContain("RESET ${tournament.name.toUpperCase()}");
    expect(form).toContain(
      "I understand this removes tournament activity but does not remove members.",
    );
    expect(form).toContain(
      "Members, Membership Seasons, and Tournament Configuration are NOT affected",
    );
    expect(form).toContain("dialog");
    expect(form).toContain("Cancel");
  });

  it("exposes reset only from the Tournament Detail danger zone", () => {
    const detail = readFileSync("app/admin/tournament/page.tsx", "utf8");
    const manager = readFileSync(
      "app/admin/tournament-manager/page.tsx",
      "utf8",
    );

    expect(detail).toContain("Danger Zone");
    expect(detail).toContain("TournamentResetForm");
    expect(detail).toContain("Tournament reset completed successfully.");
    expect(manager).not.toContain("Tournament Reset");
    expect(manager).not.toContain("/tournament-manager/reset");
  });
});
