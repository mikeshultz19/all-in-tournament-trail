import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { resolveManagedTournament } from "@/components/admin/AdminTournamentDashboard";
import { databaseTournament } from "@/tests/tournament-db-fixture";

describe("Tournament Manager refresh selection", () => {
  it("keeps preparation confirmations in every publish-readiness tournament reload", () => {
    const source = readFileSync("lib/tournament-publish-readiness.ts", "utf8");

    expect(source.match(/prepare_registration_review_complete/g)).toHaveLength(2);
    expect(source.match(/paper_membership_reminder_checked/g)).toHaveLength(2);
  });

  it("rebinds the selected tournament to refreshed props after verification", () => {
    const refreshedTournament = {
      ...databaseTournament,
      weighfish_imported: true,
      weighfish_imported_at: "2026-08-24T18:00:00Z",
      results_verified_at: "2026-08-24T18:01:00Z",
      result_status: "pending" as const,
      prepare_registration_review_complete: true,
      paper_membership_reminder_checked: true,
    };

    const resolvedTournament = resolveManagedTournament(
      [refreshedTournament],
      databaseTournament.id,
      databaseTournament,
    );

    expect(resolvedTournament).toMatchObject({
      id: databaseTournament.id,
      weighfish_imported: true,
      weighfish_imported_at: "2026-08-24T18:00:00Z",
      results_verified_at: "2026-08-24T18:01:00Z",
      prepare_registration_review_complete: true,
      paper_membership_reminder_checked: true,
    });
  });
});
