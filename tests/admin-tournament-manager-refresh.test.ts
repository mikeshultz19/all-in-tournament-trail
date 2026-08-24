import { describe, expect, it } from "vitest";

import { resolveManagedTournament } from "@/components/admin/AdminTournamentDashboard";
import { databaseTournament } from "@/tests/tournament-db-fixture";

describe("Tournament Manager refresh selection", () => {
  it("rebinds the selected tournament to refreshed props after verification", () => {
    const refreshedTournament = {
      ...databaseTournament,
      weighfish_imported: true,
      weighfish_imported_at: "2026-08-24T18:00:00Z",
      results_verified_at: "2026-08-24T18:01:00Z",
      result_status: "pending" as const,
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
    });
  });
});
