import type { Tournament } from "@/types/tournament";
import type { TournamentRegistrationRosterSummary } from "@/lib/tournament-registration-roster";

export type TournamentPreparationStatus =
  | "Complete"
  | "In Progress"
  | "Needs Attention"
  | "Not Started";

export function getTournamentPreparationStatus(
  tournament: Pick<
    Tournament,
    "prepare_registration_review_complete" | "paper_membership_reminder_checked"
  >,
  summary?: Pick<TournamentRegistrationRosterSummary, "needReview">,
): TournamentPreparationStatus {
  const unresolvedCount = summary?.needReview ?? 0;
  const registrationReviewComplete = Boolean(
    tournament.prepare_registration_review_complete,
  );
  const paperMembershipsConfirmed = Boolean(
    tournament.paper_membership_reminder_checked,
  );

  if (unresolvedCount > 0) return "Needs Attention";
  if (registrationReviewComplete && paperMembershipsConfirmed) return "Complete";
  if (registrationReviewComplete || paperMembershipsConfirmed) return "In Progress";
  return "Not Started";
}

export function isTournamentPreparationComplete(
  tournament: Pick<
    Tournament,
    "prepare_registration_review_complete" | "paper_membership_reminder_checked"
  >,
  summary?: Pick<TournamentRegistrationRosterSummary, "needReview">,
): boolean {
  return getTournamentPreparationStatus(tournament, summary) === "Complete";
}
