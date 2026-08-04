import { describe, expect, it } from "vitest";
import { getTournamentImportStatus } from "@/lib/tournament-import-status";
import { databaseTournament } from "@/tests/tournament-db-fixture";

const importedTournament = {
  ...databaseTournament,
  id: "tournament-a",
  weighfish_imported: true,
  weighfish_imported_at: "2026-08-02T12:00:00Z",
  results_verified_at: "2026-08-02T12:05:00Z",
  results_verified_by: "admin-1",
  result_status: "imported" as const,
};

describe("Tournament Manager import status", () => {
  it("uses Not Started when no durable import record exists", () => {
    expect(getTournamentImportStatus(importedTournament)).toBe("Not Started");
  });

  it("never treats empty imported rows as Complete", () => {
    expect(getTournamentImportStatus(importedTournament, { tournamentId: importedTournament.id, persistedRowCount: 0 })).toBe("Not Started");
  });

  it("uses In Progress for persisted rows that are not verified as imported", () => {
    expect(getTournamentImportStatus({ ...importedTournament, weighfish_imported: false, weighfish_imported_at: null, results_verified_at: null, result_status: "pending" }, { tournamentId: importedTournament.id, persistedRowCount: 3 })).toBe("In Progress");
  });

  it("uses Complete only for verified persisted import evidence", () => {
    expect(getTournamentImportStatus(importedTournament, { tournamentId: importedTournament.id, persistedRowCount: 3 })).toBe("Complete");
  });

  it("requires the verifying administrator as durable verification evidence", () => {
    expect(getTournamentImportStatus({ ...importedTournament, results_verified_by: null }, { tournamentId: importedTournament.id, persistedRowCount: 3 })).toBe("In Progress");
  });

  it("uses Needs Attention for failed validation", () => {
    expect(getTournamentImportStatus(importedTournament, { tournamentId: importedTournament.id, persistedRowCount: 3, validationFailed: true })).toBe("Needs Attention");
  });

  it("does not inherit another tournament's import evidence", () => {
    expect(getTournamentImportStatus(importedTournament, { tournamentId: "tournament-b", persistedRowCount: 3 })).toBe("Not Started");
  });
});
