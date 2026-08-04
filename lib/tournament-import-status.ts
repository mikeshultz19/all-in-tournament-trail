import type { Tournament } from "@/types/tournament";

export type TournamentImportStatus =
  | "Complete"
  | "In Progress"
  | "Needs Attention"
  | "Not Started";

export interface TournamentImportEvidence {
  tournamentId: string;
  persistedRowCount: number;
  validationFailed?: boolean;
}

export function getTournamentImportStatus(
  tournament: Pick<
    Tournament,
    "id" | "weighfish_imported" | "weighfish_imported_at" | "results_verified_at" | "results_verified_by" | "result_status"
  >,
  evidence?: TournamentImportEvidence,
): TournamentImportStatus {
  if (!evidence || evidence.tournamentId !== tournament.id) {
    return "Not Started";
  }

  if (evidence.validationFailed) return "Needs Attention";
  if (evidence.persistedRowCount <= 0) return "Not Started";
  if (tournament.result_status === "under_review") return "Needs Attention";

  const durableImportComplete =
    tournament.weighfish_imported === true &&
    Boolean(tournament.weighfish_imported_at) &&
    Boolean(tournament.results_verified_at) &&
    Boolean(tournament.results_verified_by) &&
    tournament.result_status !== "pending";

  return durableImportComplete ? "Complete" : "In Progress";
}
