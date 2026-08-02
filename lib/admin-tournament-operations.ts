import type { Tournament } from "@/types/tournament";

export type OperationItemStatus =
  | "complete"
  | "incomplete"
  | "not_tracked"
  | "not_available";

export interface TournamentOperationItem {
  label: string;
  status: OperationItemStatus;
}

export interface TournamentOperationStep {
  number: 1 | 2 | 3;
  title: string;
  purpose: string;
  actionLabel: string;
  actionHref: string;
  items: TournamentOperationItem[];
  state: "completed" | "current" | "upcoming";
  completedDate: string | null;
  completedBy: string | null;
}

const CLOSED_STATUSES = new Set([
  "Registration Closed",
  "Tournament Day",
  "Results Published",
]);

export function getTournamentRegistrationStatus(
  tournament: Tournament,
  now: Date,
): "Open" | "Closed" | "Scheduled" {
  if (
    CLOSED_STATUSES.has(tournament.status) ||
    (tournament.registration_closes &&
      new Date(tournament.registration_closes).getTime() <= now.getTime())
  ) {
    return "Closed";
  }

  if (
    tournament.status === "Registration Open" &&
    (!tournament.registration_opens ||
      new Date(tournament.registration_opens).getTime() <= now.getTime())
  ) {
    return "Open";
  }

  return "Scheduled";
}

function complete(label: string, value: boolean): TournamentOperationItem {
  return {
    label,
    status: value ? "complete" : "incomplete",
  };
}

export function getTournamentOperationSteps(
  tournament: Tournament,
  now: Date,
): TournamentOperationStep[] {
  const registrationStatus = getTournamentRegistrationStatus(
    tournament,
    now,
  );
  const tournamentContext = encodeURIComponent(
    tournament.slug || tournament.id,
  );

  const prepareItems: TournamentOperationItem[] = [
    complete(
      "Tournament Information Complete",
      Boolean(
        tournament.name.trim() &&
          tournament.lake.trim() &&
          tournament.tournament_date &&
          tournament.description?.trim(),
      ),
    ),
    complete(
      "Registration Information Complete",
      Boolean(
        tournament.registration_opens &&
          tournament.registration_closes &&
          tournament.morning_registration,
      ),
    ),
    complete("Launch Ramp Complete", Boolean(tournament.ramp?.trim())),
    complete(
      "Practice Information Complete",
      Boolean(tournament.practice_information?.trim()),
    ),
    complete("Website Published", tournament.show_on_homepage),
  ];

  const registrationFinalized =
    tournament.weighfish_imported ||
    tournament.status === "Results Published";
  const registrationItems: TournamentOperationItem[] = [
    complete("Registration Closed", registrationStatus === "Closed"),
    complete("Copy registrations to WeighFish", registrationFinalized),
    complete(
      "Verify tournament morning registrations entered",
      registrationFinalized,
    ),
    complete("Verify final tournament field", registrationFinalized),
  ];

  const closeoutItems: TournamentOperationItem[] = [
    complete("Import WeighFish CSV", tournament.weighfish_imported),
    complete("Calculate Insurance Pot Payouts", tournament.insurance_reviewed),
    complete("Upload Winner Photo", Boolean(tournament.champion_photo_url)),
    complete("Upload Big Bass Photo", Boolean(tournament.big_bass_photo_url)),
    complete("Publish Results", tournament.status === "Results Published"),
    {
      label: "Update Membership Standings",
      status: "not_available",
    },
    {
      label: "Publish AOY",
      status: "not_available",
    },
    {
      label: "Tournament Complete",
      status: "not_available",
    },
  ];

  const currentStepNumber: 1 | 2 | 3 = tournament.weighfish_imported
    ? 3
    : registrationStatus === "Closed"
      ? 2
      : 1;

  const makeState = (
    number: 1 | 2 | 3,
  ): TournamentOperationStep["state"] =>
    number < currentStepNumber
      ? "completed"
      : number === currentStepNumber
        ? "current"
        : "upcoming";

  const updatedBy = tournament.updated_by ?? "AITT Staff";

  return [
    {
      number: 1,
      title: "Prepare Tournament",
      purpose:
        "Complete this immediately after creating the tournament. This information is visible to anglers and drives registration.",
      actionLabel: "Continue Tournament Setup",
      actionHref: `/admin/tournament?tournament=${tournamentContext}`,
      items: prepareItems,
      state: makeState(1),
      // No dedicated setup-completion audit fields exist yet.
      completedDate: null,
      completedBy: null,
    },
    {
      number: 2,
      title: "Registration Finalization",
      purpose:
        "Complete after registration closes and before tournament morning.",
      actionLabel: "Finalize Registration",
      actionHref: "/registrations",
      items: registrationItems,
      state: makeState(2),
      completedDate:
        currentStepNumber > 2
          ? tournament.weighfish_imported_at ?? tournament.updated_at
          : null,
      completedBy: currentStepNumber > 2 ? updatedBy : null,
    },
    {
      number: 3,
      title: "Tournament Closeout",
      purpose: "Complete after weigh-in.",
      actionLabel: "Complete Tournament",
      actionHref: `/admin/tournament-manager?tournament=${tournamentContext}`,
      items: closeoutItems,
      state: makeState(3),
      completedDate: null,
      completedBy: null,
    },
  ];
}
