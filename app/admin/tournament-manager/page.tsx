import AdminTournamentDashboard from "@/components/admin/AdminTournamentDashboard";
import {
  getActiveSeasonSchedule,
  getNextUpcomingTournament,
} from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";
import { listOnSiteCloseouts } from "@/lib/on-site-closeout";
import { calculateTournamentInsurancePotResult, listTournamentInsurancePotResults } from "@/lib/insurance-pot-results";
import { isInsurancePotWinnerDraftComplete } from "@/lib/insurance-pot";
import type { OnSiteCloseoutRecord } from "@/types/on-site-closeout";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import { listTournamentImportEvidence, listTournamentImportedRows } from "@/lib/tournament-import-evidence";
import type { ImportedRow } from "@/components/admin/ImportedResultsReview";
import { listTournamentResultsRecords } from "@/lib/results";
import type { TournamentResultsRecord } from "@/types/results";
import type { TournamentImportEvidence } from "@/lib/tournament-import-status";
import { listSupplementalWorkflowEvidence, type SupplementalWorkflowEvidence } from "@/lib/tournament-workflow-evidence";
import { listTournamentRegistrationRosterSummaries } from "@/lib/tournament-registration-roster";
import type { TournamentRegistrationRosterSummary } from "@/lib/tournament-registration-roster";
import { listTournamentCollectionSummaries, type TournamentCollectionSummary } from "@/lib/tournament-collection-summary";
import {
  buildTournamentPublishReadinessPlan,
  listTournamentPublishReviewRegistrations,
  syncTournamentPublishReadiness,
  type TournamentPublishReviewRegistration,
  type RegistrationRow,
  type WorkingResultRow,
} from "@/lib/tournament-publish-readiness";
import { getSeasonAoyStandings } from "@/lib/aoy-engine";
import { getSeasonChampionshipQualifications } from "@/lib/championship-qualification";
import type { AoyStanding } from "@/types/aoy-engine";
import type { ChampionshipQualification } from "@/types/championship-qualification";

export const dynamic = "force-dynamic";

class TournamentWorkspaceLoadError extends Error {
  constructor(
    readonly step: string,
    readonly safeCode: string | null,
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "TournamentWorkspaceLoadError";
  }
}

function safeSupabaseError(error: unknown) {
  const candidate = error instanceof Error && error.cause ? error.cause : error;
  if (candidate && typeof candidate === "object") {
    const record = candidate as { code?: unknown; message?: unknown };
    return {
      code: typeof record.code === "string" ? record.code : null,
      message: typeof record.message === "string" ? record.message : error instanceof Error ? error.message : "Unknown loader error",
    };
  }
  return { code: null, message: error instanceof Error ? error.message : "Unknown loader error" };
}

async function workspaceStep<T>(step: string, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const safe = safeSupabaseError(error);
    console.error("Tournament workspace load failed", {
      step,
      errorCode: safe.code,
      message: safe.message,
    });
    throw new TournamentWorkspaceLoadError(step, safe.code, safe.message, error);
  }
}

interface TournamentManagerPageProps {
  searchParams: Promise<{ tournament?: string | string[]; step?: string | string[] }>;
}

export default async function TournamentManagerPage({ searchParams }: TournamentManagerPageProps) {
  const params = await searchParams;
  const requestedTournament = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;
  const requestedStepValue = Array.isArray(params.step) ? params.step[0] : params.step;
  const requestedStep = requestedStepValue && ["1", "2", "3", "4", "5"].includes(requestedStepValue)
    ? Number(requestedStepValue) as 1 | 2 | 3 | 4 | 5
    : undefined;
  const now = new Date();
  let tournaments: Tournament[] = [];
  let currentTournament: Tournament | null = null;
  let closeouts: Record<string, OnSiteCloseoutRecord> = {};
  let insuranceResults: Record<string, TournamentInsurancePotResultRecord> = {};
  let importEvidence: Record<string, TournamentImportEvidence> = {};
  let supplementalEvidence: Record<string, SupplementalWorkflowEvidence> = {};
  let workflowWarning: string | null = null;
  let registrationSummaries: Record<string, TournamentRegistrationRosterSummary> = {};
  let importedRows: Record<string, ImportedRow[]> = {};
  let resultsRecords: Record<string, TournamentResultsRecord> = {};
  let collectionSummaries: Record<string, TournamentCollectionSummary> = {};
  let publishReviewRegistrations: Record<string, TournamentPublishReviewRegistration[]> = {};
  let manualReviewRows: Record<string, { resultId: string; place: number | null; teamName: string; reason: string }[]> = {};
  let aoyStandingsBySeason: Record<string, AoyStanding[]> = {};
  let championshipQualificationsBySeason: Record<string, ChampionshipQualification[]> = {};

  try {
    [tournaments, currentTournament] = await Promise.all([
        workspaceStep("Active Season Schedule", getActiveSeasonSchedule),
        workspaceStep("Next Upcoming Tournament", getNextUpcomingTournament),
      ]);
    if (requestedTournament) {
      currentTournament = tournaments.find(
        (tournament) => tournament.id === requestedTournament || tournament.slug === requestedTournament,
      ) ?? currentTournament;
    }
    if (currentTournament) {
      const currentTournamentId = currentTournament.id;
      const readinessSync = await workspaceStep(
        "Tournament Publish Readiness",
        () => syncTournamentPublishReadiness(currentTournamentId),
      );
      if (readinessSync.tournament) {
        currentTournament = readinessSync.tournament;
        tournaments = tournaments.map((tournament) =>
          tournament.id === readinessSync.tournament?.id
            ? readinessSync.tournament!
            : tournament,
        );
      }
    }
    const [loadedCloseouts, loadedInsuranceResults, loadedImportEvidence, supplementalLoad, loadedRegistrationSummaries, loadedImportedRows, loadedResultsRecords, loadedPublishReviewRegistrations] = await Promise.all([
      workspaceStep("On-Site Closeouts", () => listOnSiteCloseouts(tournaments.map((tournament) => tournament.id))),
      workspaceStep("Insurance Pot Results", () => listTournamentInsurancePotResults(tournaments.map((tournament) => tournament.id))),
      workspaceStep("Import Evidence", () => listTournamentImportEvidence(tournaments.map((tournament) => tournament.id))),
      workspaceStep("Supplemental Workflow Evidence", () => listSupplementalWorkflowEvidence(tournaments.map((tournament) => tournament.id))),
      workspaceStep("Registration Roster Summaries", () => listTournamentRegistrationRosterSummaries(tournaments.map((tournament) => tournament.id))),
      workspaceStep("Imported Results", () => listTournamentImportedRows(tournaments.map((tournament) => tournament.id))),
      workspaceStep("Results Records", () => listTournamentResultsRecords(tournaments.map((tournament) => tournament.id))),
      workspaceStep("Publish Review Registrations", () => listTournamentPublishReviewRegistrations(tournaments.map((tournament) => tournament.id))),
    ]);
    closeouts = loadedCloseouts;
    const computedInsuranceResults = await Promise.all(
      tournaments.map(async (tournament) => {
        const savedResult = loadedInsuranceResults[tournament.id];
        if (savedResult && isInsurancePotWinnerDraftComplete({
          entryCount: savedResult.entry_count,
          totalPotCents: savedResult.total_pot_cents,
          placesPaid: savedResult.places_paid,
          winners: savedResult.winners,
          published: savedResult.published,
        })) return [tournament.id, savedResult] as const;
        const calculatedResult = await workspaceStep(
          "Insurance Pot Calculation",
          () => calculateTournamentInsurancePotResult(tournament.id),
        );
        return calculatedResult ? [tournament.id, toInsuranceResultRecord(tournament.id, calculatedResult)] as const : null;
      }),
    );
    insuranceResults = Object.fromEntries(
      computedInsuranceResults.filter((entry): entry is readonly [string, TournamentInsurancePotResultRecord] => Boolean(entry)),
    );
    importEvidence = loadedImportEvidence;
    supplementalEvidence = supplementalLoad.evidence;
    workflowWarning = supplementalLoad.warning;
    registrationSummaries = loadedRegistrationSummaries;
    importedRows = loadedImportedRows;
    resultsRecords = loadedResultsRecords;
    publishReviewRegistrations = loadedPublishReviewRegistrations;
    manualReviewRows = Object.fromEntries(
      tournaments.map((tournament) => {
        const rows = buildTournamentPublishReadinessPlan({
          resultRows: (importedRows[tournament.id] ?? []) as unknown as WorkingResultRow[],
          registrations: (publishReviewRegistrations[tournament.id] ?? []) as RegistrationRow[],
          reviewerAdminId: tournament.results_verified_by ?? tournament.updated_by ?? null,
        }).manualReviewRows;
        return [tournament.id, rows];
      }),
    );
    collectionSummaries = await listTournamentCollectionSummaries(tournaments.map((tournament) => tournament.id), insuranceResults);
    const seasonIds = [...new Set(tournaments.flatMap((tournament) => tournament.season_id ? [tournament.season_id] : []))];
    const seasonProjections = await Promise.all(
      seasonIds.map(async (seasonId) => {
        const [aoyStandings, championshipQualifications] = await Promise.all([
          workspaceStep("AOY Standings", () => getSeasonAoyStandings(seasonId)),
          workspaceStep("Championship Qualifications", () => getSeasonChampionshipQualifications(seasonId)),
        ]);
        return { seasonId, aoyStandings, championshipQualifications };
      }),
    );
    aoyStandingsBySeason = Object.fromEntries(
      seasonProjections.map((item) => [item.seasonId, item.aoyStandings]),
    );
    championshipQualificationsBySeason = Object.fromEntries(
      seasonProjections.map((item) => [item.seasonId, item.championshipQualifications]),
    );
  } catch (error) {
    const diagnostic = error instanceof TournamentWorkspaceLoadError
      ? error
      : null;
    console.error("Tournament workspace load failed", {
      step: diagnostic?.step ?? "Unknown",
      errorCode: diagnostic?.safeCode ?? null,
      message: diagnostic?.message ?? "Unknown loader error",
    });

    return (
      <section className="border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-xl font-black uppercase text-white">
          Tournament Workspace Unavailable
        </h1>
        {diagnostic ? (
          <p className="mt-3 text-sm font-bold text-red-200">
            Failed loading: {diagnostic.step}
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          We could not load tournament information. Please try again.
        </p>
      </section>
    );
  }

  return (
    <>
    {workflowWarning ? <p className="mb-4 border border-[#D4A017]/30 bg-[#D4A017]/5 px-4 py-3 text-sm text-neutral-300" role="status">{workflowWarning}</p> : null}
    <AdminTournamentDashboard
      key={currentTournament?.id}
      tournaments={tournaments}
      initialTournamentId={currentTournament?.id}
      comparisonDate={now.toISOString()}
      showTournamentTools
      closeouts={closeouts}
      insuranceResults={insuranceResults}
      importEvidence={importEvidence}
      initialExpandedStage={requestedStep}
      supplementalEvidence={supplementalEvidence}
      registrationSummaries={registrationSummaries}
      importedRows={importedRows}
      resultsRecords={resultsRecords}
      manualReviewRows={manualReviewRows}
      publishReviewRegistrations={publishReviewRegistrations}
      collectionSummaries={collectionSummaries}
      aoyStandingsBySeason={aoyStandingsBySeason}
      championshipQualificationsBySeason={championshipQualificationsBySeason}
    />
    </>
  );
}

function toInsuranceResultRecord(
  tournamentId: string,
  result: Awaited<ReturnType<typeof calculateTournamentInsurancePotResult>>,
): TournamentInsurancePotResultRecord {
  if (!result) {
    throw new Error(`Cannot convert a missing Insurance Pot result for tournament ${tournamentId}.`);
  }

  const now = new Date().toISOString();
  return {
    id: `computed-${tournamentId}`,
    tournament_id: tournamentId,
    entry_count: result.entryCount,
    total_pot_cents: result.totalPotCents,
    places_paid: result.placesPaid,
    calculated_payouts: result.winners.map((winner) => winner.amountCents),
    winners: result.winners,
    published: result.published,
    published_at: result.publishedAt ?? null,
    created_at: now,
    updated_at: now,
  };
}
