import { getTournamentImportStatus, type TournamentImportEvidence, type TournamentImportStatus } from "@/lib/tournament-import-status";
import { expectedInsurancePotCents, getInsurancePotPlaces, isInsurancePotWinnerDraftComplete, validateInsurancePotResult } from "@/lib/insurance-pot";
import type { OnSiteCloseoutRecord } from "@/types/on-site-closeout";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import type { InsurancePotResult } from "@/lib/insurance-pot";
import type { Tournament } from "@/types/tournament";

export type TournamentWorkflowStatus = TournamentImportStatus;
export type TournamentWorkflowStepNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface TournamentWorkflowEvidence {
  tournamentId: string;
  importEvidence?: TournamentImportEvidence;
  insuranceResult?: TournamentInsurancePotResultRecord | null;
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

  let insuranceStatus: TournamentWorkflowStatus = "Not Started";
  const insuranceResult = scopedEvidence?.insuranceResult ?? null;
  if (importComplete && insuranceResult) {
    const entryCountValid = Number.isInteger(insuranceResult.entry_count) && insuranceResult.entry_count >= 0;
    const totalPotValid = Number.isInteger(insuranceResult.total_pot_cents) && insuranceResult.total_pot_cents >= 0;
    const placesPaid = getInsurancePotPlaces(insuranceResult.entry_count);
    const calculationValid = insuranceResult.entry_count === 0
      ? insuranceResult.total_pot_cents === 0 && insuranceResult.places_paid === 0 && insuranceResult.winners.length === 0
      : insuranceResult.total_pot_cents === expectedInsurancePotCents(insuranceResult.entry_count) && insuranceResult.places_paid === placesPaid;
    const resultForValidation: InsurancePotResult = {
      entryCount: insuranceResult.entry_count,
      totalPotCents: insuranceResult.total_pot_cents,
      placesPaid: insuranceResult.places_paid,
      winners: insuranceResult.winners,
      published: insuranceResult.published,
    };
    const draftComplete = isInsurancePotWinnerDraftComplete(resultForValidation);
    const validationErrors = validateInsurancePotResult(resultForValidation);
    if (!entryCountValid || !totalPotValid || !calculationValid || validationErrors.length) insuranceStatus = "Needs Attention";
    else if (draftComplete) insuranceStatus = "Complete";
    else insuranceStatus = "In Progress";
  }

  let payoutStatus: TournamentWorkflowStatus = "Not Started";
  const insuranceComplete = insuranceStatus === "Complete";
  if (importComplete && insuranceComplete && scopedEvidence?.closeout) {
    payoutStatus = scopedEvidence.closeout.status === "complete"
      ? scopedEvidence.closeout.difference_cents === 0 ? "Complete" : "Needs Attention"
      : scopedEvidence.closeout.difference_cents === 0 ? "In Progress" : "Needs Attention";
  }
  const payoutComplete = payoutStatus === "Complete";

  let publishStatus: TournamentWorkflowStatus = "Not Started";
  if (importComplete && insuranceComplete && payoutComplete) {
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
    { number: 3, title: "Insurance Pot", status: insuranceStatus, nextStep: importComplete ? "Calculate and save Insurance Pot winners" : "Verify imported results before calculating the Insurance Pot", description: "Calculate the manual Insurance Pot, enter winners, and save the draft for publication.", locked: !importComplete },
    { number: 4, title: "Calculate Payouts", status: payoutStatus, nextStep: insuranceComplete ? "Calculate and reconcile tournament payouts" : "Complete the Insurance Pot before calculating payouts", description: "Calculate every tournament payout and generate the final checks.", locked: !importComplete || !insuranceComplete },
    { number: 5, title: "Publish Results", status: publishStatus, nextStep: payoutComplete ? "Review and publish website results" : insuranceComplete ? "Complete payout closeout before publishing" : "Complete the Insurance Pot before publishing", description: "Review winners, photos, and public results before publishing.", locked: !importComplete || !insuranceComplete },
    { number: 6, title: "Calculate AOY", status: aoyStatus, nextStep: scopedEvidence?.officialPublicationExists ? "Calculate and review AOY standings" : "Publish official results before calculating AOY", description: "Review membership eligibility, points changes, and AOY standings.", locked: !importComplete || !scopedEvidence?.officialPublicationExists },
  ];
}
