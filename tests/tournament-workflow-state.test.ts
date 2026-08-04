import { describe, expect, it } from "vitest";
import { resolveTournamentWorkflowState, type TournamentWorkflowEvidence } from "@/lib/tournament-workflow-state";
import { databaseTournament } from "@/tests/tournament-db-fixture";
import type { OnSiteCloseoutRecord } from "@/types/on-site-closeout";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import type { Tournament } from "@/types/tournament";

const tournament: Tournament = { ...databaseTournament, id: "event-a", weighfish_imported: false, weighfish_imported_at: null, results_verified_at: null, result_status: "pending" };
const verifiedTournament: Tournament = { ...tournament, weighfish_imported: true, weighfish_imported_at: "2026-08-02T12:00:00Z", results_verified_at: "2026-08-02T12:05:00Z", results_verified_by: "admin-1", result_status: "imported" };
const insuranceResult: TournamentInsurancePotResultRecord = {
  id: "insurance-1",
  tournament_id: tournament.id,
  entry_count: 20,
  total_pot_cents: 40000,
  places_paid: 4,
  calculated_payouts: [10000, 10000, 10000, 10000],
  winners: [
    { entryName: "Brown / Davis", finishingPosition: 8, amountCents: 10000 },
    { entryName: "Wilson / Lee", finishingPosition: 10, amountCents: 10000 },
    { entryName: "Taylor / Moore", finishingPosition: 11, amountCents: 10000 },
    { entryName: "Smith / Jones", finishingPosition: 14, amountCents: 10000 },
  ],
  published: false,
  published_at: null,
  created_at: "",
  updated_at: "",
};
const baseEvidence: TournamentWorkflowEvidence = { tournamentId: tournament.id, importEvidence: { tournamentId: tournament.id, persistedRowCount: 0 }, officialPublicationExists: false, aoyCalculationExists: false, aoyCurrentProjectionExists: false };
const closeout = (status: "draft" | "complete", difference = 0): OnSiteCloseoutRecord => ({ id: "closeout", tournament_id: tournament.id, source_file_name: "results.csv", source_rows: [], entry_count: 0, total_collected_cents: 0, total_paid_cents: 0, trail_retained_cents: 0, difference_cents: difference, checks: [], status, completed_at: null, completed_by_admin_id: null, created_at: "", updated_at: "" });
const statuses = (evidence: TournamentWorkflowEvidence, selected: Tournament = tournament) => resolveTournamentWorkflowState(selected, evidence).map((step) => step.status);

describe("shared Tournament Manager workflow resolver", () => {
  it("keeps every step Not Started without an import", () => expect(statuses(baseEvidence)).toEqual(["Not Started", "Not Started", "Not Started", "Not Started", "Not Started", "Not Started"]));
  it("keeps downstream work stopped for an unverified upload", () => expect(statuses({ ...baseEvidence, importEvidence: { tournamentId: tournament.id, persistedRowCount: 2 } }, { ...tournament, weighfish_imported: true, weighfish_imported_at: "now", result_status: "imported" })).toEqual(["Not Started", "In Progress", "Not Started", "Not Started", "Not Started", "Not Started"]));
  it("keeps downstream work stopped after failed validation", () => expect(statuses({ ...baseEvidence, importEvidence: { tournamentId: tournament.id, persistedRowCount: 2, validationFailed: true } })).toEqual(["Not Started", "Needs Attention", "Not Started", "Not Started", "Not Started", "Not Started"]));
  it("makes verified downstream steps eligible but not started", () => expect(statuses({ ...baseEvidence, importEvidence: { tournamentId: tournament.id, persistedRowCount: 2 } }, verifiedTournament)).toEqual(["Not Started", "Complete", "Not Started", "Not Started", "Not Started", "Not Started"]));
  it("marks saved payout work In Progress and invalid reconciliation Needs Attention", () => {
    const evidence = { ...baseEvidence, importEvidence: { tournamentId: tournament.id, persistedRowCount: 2 }, insuranceResult, closeout: closeout("draft") };
    expect(statuses(evidence, verifiedTournament)[3]).toBe("In Progress");
    expect(statuses({ ...evidence, closeout: closeout("draft", 1) }, verifiedTournament)[3]).toBe("Needs Attention");
  });
  it("requires a real publication audit for Publish Complete", () => {
    const evidence = { ...baseEvidence, importEvidence: { tournamentId: tournament.id, persistedRowCount: 2 }, insuranceResult, closeout: closeout("complete") };
    expect(statuses(evidence, { ...verifiedTournament, result_status: "official" })[4]).toBe("Not Started");
    expect(statuses({ ...evidence, officialPublicationExists: true }, { ...verifiedTournament, result_status: "official" })[4]).toBe("Complete");
  });
  it("does not begin AOY without verified import and completes only on the current projection", () => {
    expect(statuses({ ...baseEvidence, aoyCalculationExists: true, aoyCurrentProjectionExists: true })[5]).toBe("Not Started");
    const evidence = { ...baseEvidence, importEvidence: { tournamentId: tournament.id, persistedRowCount: 2 }, insuranceResult, closeout: closeout("complete"), officialPublicationExists: true, aoyCalculationExists: true };
    expect(statuses(evidence, verifiedTournament)[5]).toBe("In Progress");
    expect(statuses({ ...evidence, aoyCurrentProjectionExists: true }, verifiedTournament)[5]).toBe("Complete");
  });
  it("locks Import Results until preparation is complete", () => {
    const locked = resolveTournamentWorkflowState(verifiedTournament, {
      ...baseEvidence,
      preparationStatus: "Not Started",
      importEvidence: { tournamentId: tournament.id, persistedRowCount: 2 },
    });
    const unlocked = resolveTournamentWorkflowState(verifiedTournament, {
      ...baseEvidence,
      preparationStatus: "Complete",
      importEvidence: { tournamentId: tournament.id, persistedRowCount: 2 },
    });

    expect(locked[1].locked).toBe(true);
    expect(unlocked[1].locked).toBe(false);
  });
  it("reset evidence returns all steps to Not Started", () => expect(statuses(baseEvidence, tournament)).toEqual(["Not Started", "Not Started", "Not Started", "Not Started", "Not Started", "Not Started"]));
  it("never inherits another tournament's evidence", () => expect(statuses({ ...baseEvidence, tournamentId: "event-b", importEvidence: { tournamentId: "event-b", persistedRowCount: 4 }, closeout: { ...closeout("complete"), tournament_id: "event-b" }, officialPublicationExists: true, aoyCalculationExists: true, aoyCurrentProjectionExists: true }, verifiedTournament)).toEqual(["Not Started", "Not Started", "Not Started", "Not Started", "Not Started", "Not Started"]));
});
