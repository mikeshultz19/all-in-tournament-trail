import { getTournamentImportStatus, type TournamentImportEvidence, type TournamentImportStatus } from "@/lib/tournament-import-status";
import type { OnSiteCloseoutRecord } from "@/types/on-site-closeout";
import type { Tournament } from "@/types/tournament";

export type TournamentWorkflowStatus = TournamentImportStatus;
export type TournamentWorkflowStepNumber = 1 | 2 | 3 | 4 | 5;

export interface TournamentWorkflowEvidence {
  tournamentId: string;
  importEvidence?: TournamentImportEvidence;
  closeout?: OnSiteCloseoutRecord;
  officialPublicationExists: boolean;
  aoyCalculationExists: boolean;
  aoyCurrentProjectionExists: boolean;
  preparationStatus?: TournamentWorkflowStatus;
}

export interface TournamentWorkflowStep {
  number: TournamentWorkflowStepNumber;
  title: string;
  status: TournamentWorkflowStatus;
  description: string;
  nextStep: string;
  locked: boolean;
}

export function resolveTournamentWorkflowState(
  tournament: Tournament,
  evidence?: TournamentWorkflowEvidence,
): TournamentWorkflowStep[] {
  const scopedEvidence = evidence?.tournamentId === tournament.id ? evidence : undefined;
  const preparationComplete = scopedEvidence?.preparationStatus === "Complete";
  const importStatus = getTournamentImportStatus(tournament, scopedEvidence?.importEvidence);
  const importComplete = importStatus === "Complete";
  let payoutStatus: TournamentWorkflowStatus = "Not Started";
  if (importComplete && scopedEvidence?.closeout) {
    payoutStatus = scopedEvidence.closeout.status === "complete"
      ? scopedEvidence.closeout.difference_cents === 0 ? "Complete" : "Needs Attention"
      : scopedEvidence.closeout.difference_cents === 0 ? "In Progress" : "Needs Attention";
  }
  const payoutComplete = payoutStatus === "Complete";

  let publishStatus: TournamentWorkflowStatus = "Not Started";
  if (importComplete && payoutComplete) {
    if (scopedEvidence?.officialPublicationExists) publishStatus = "Complete";
    else if (tournament.result_status === "under_review") publishStatus = "Needs Attention";
    else if (tournament.result_status === "ready_to_publish") publishStatus = "In Progress";
  }

  let aoyStatus: TournamentWorkflowStatus = "Not Started";
  if (importComplete && scopedEvidence?.officialPublicationExists) {
    if (scopedEvidence.aoyCurrentProjectionExists) aoyStatus = "Complete";
    else if (scopedEvidence.aoyCalculationExists) aoyStatus = "In Progress";
  }

  return [
    { number: 1, title: "Prepare Tournament", status: scopedEvidence?.preparationStatus ?? "Not Started", nextStep: preparationComplete ? "Import and verify the WeighFish CSV" : scopedEvidence?.preparationStatus === "Needs Attention" ? "Resolve the registration review before importing results" : "Confirm tournament preparation and review the registration roster", description: "Review entries, payments, memberships, side pots, and check-in materials.", locked: false },
    { number: 2, title: "Import Results", status: importStatus, nextStep: preparationComplete ? "Import and verify the WeighFish CSV" : "Complete tournament preparation before importing results", description: "Upload, review, validate, verify, reset, or replace the WeighFish CSV.", locked: !preparationComplete },
    { number: 3, title: "Payout Summary", status: payoutStatus, nextStep: importComplete ? "Approve payouts and finalize the closeout" : "Verify imported results before reviewing payouts", description: "Review every tournament payout before approving the closeout.", locked: !importComplete },
    { number: 4, title: "Publish Results", status: publishStatus, nextStep: payoutComplete ? "Review and publish website results" : "Approve payouts before publishing", description: "Review winners, photos, and public results before publishing.", locked: !importComplete || !payoutComplete },
    { number: 5, title: "Calculate AOY", status: aoyStatus, nextStep: scopedEvidence?.officialPublicationExists ? "Calculate and review AOY standings" : "Publish official results before calculating AOY", description: "Review membership eligibility, points changes, and AOY standings.", locked: !importComplete || !scopedEvidence?.officialPublicationExists },
  ];
}
