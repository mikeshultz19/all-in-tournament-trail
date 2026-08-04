import AdminTournamentDashboard from "@/components/admin/AdminTournamentDashboard";
import {
  getActiveSeasonSchedule,
  getNextUpcomingTournament,
} from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";
import { listOnSiteCloseouts } from "@/lib/on-site-closeout";
import { listTournamentInsurancePotResults } from "@/lib/insurance-pot-results";
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

export const dynamic = "force-dynamic";

interface TournamentManagerPageProps {
  searchParams: Promise<{ tournament?: string | string[]; step?: string | string[] }>;
}

export default async function TournamentManagerPage({ searchParams }: TournamentManagerPageProps) {
  const params = await searchParams;
  const requestedTournament = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;
  const requestedStepValue = Array.isArray(params.step) ? params.step[0] : params.step;
  const requestedStep = requestedStepValue && ["1", "2", "3", "4", "5", "6"].includes(requestedStepValue)
    ? Number(requestedStepValue) as 1 | 2 | 3 | 4 | 5 | 6
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

  try {
    [tournaments, currentTournament] = await Promise.all([
        getActiveSeasonSchedule(),
        getNextUpcomingTournament(),
      ]);
    if (requestedTournament) {
      currentTournament = tournaments.find(
        (tournament) => tournament.id === requestedTournament || tournament.slug === requestedTournament,
      ) ?? currentTournament;
    }
    const [loadedCloseouts, loadedInsuranceResults, loadedImportEvidence, supplementalLoad, loadedRegistrationSummaries, loadedImportedRows, loadedResultsRecords] = await Promise.all([
      listOnSiteCloseouts(tournaments.map((tournament) => tournament.id)),
      listTournamentInsurancePotResults(tournaments.map((tournament) => tournament.id)),
      listTournamentImportEvidence(tournaments.map((tournament) => tournament.id)),
      listSupplementalWorkflowEvidence(tournaments.map((tournament) => tournament.id)),
      listTournamentRegistrationRosterSummaries(tournaments.map((tournament) => tournament.id)),
      listTournamentImportedRows(tournaments.map((tournament) => tournament.id)),
      listTournamentResultsRecords(tournaments.map((tournament) => tournament.id)),
    ]);
    closeouts = loadedCloseouts;
    insuranceResults = loadedInsuranceResults;
    importEvidence = loadedImportEvidence;
    supplementalEvidence = supplementalLoad.evidence;
    workflowWarning = supplementalLoad.warning;
    registrationSummaries = loadedRegistrationSummaries;
    importedRows = loadedImportedRows;
    resultsRecords = loadedResultsRecords;
    collectionSummaries = await listTournamentCollectionSummaries(tournaments.map((tournament) => tournament.id), insuranceResults);
  } catch (error) {
    console.error("Tournament workspace load failed.", error);

    return (
      <section className="border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-xl font-black uppercase text-white">
          Tournament Workspace Unavailable
        </h1>
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
      collectionSummaries={collectionSummaries}
    />
    </>
  );
}
