"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Banknote, CalendarDays, Check, ChevronDown, ClipboardCheck, FileUp, Globe2, ShieldCheck, Trophy, type LucideIcon } from "lucide-react";
import { getInitialAdminTournament } from "@/lib/admin-tournaments";
import type { Tournament } from "@/types/tournament";
import type { OnSiteCloseoutRecord } from "@/types/on-site-closeout";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import type { TournamentImportEvidence } from "@/lib/tournament-import-status";
import { resolveTournamentWorkflowState, type TournamentWorkflowStep as Stage, type TournamentWorkflowStepNumber as StageNumber } from "@/lib/tournament-workflow-state";
import type { SupplementalWorkflowEvidence } from "@/lib/tournament-workflow-evidence";
import type { TournamentRegistrationRosterSummary } from "@/lib/tournament-registration-roster";
import type { TournamentCollectionSummary } from "@/lib/tournament-collection-calculator";
import WeighfishCsvUploader from "@/components/admin/WeighfishCsvUploader";
import ImportedResultsReview, { type ImportedRow } from "@/components/admin/ImportedResultsReview";
import InsurancePotWorkflow from "@/components/admin/InsurancePotWorkflow";
import OnSiteCloseoutCalculator from "@/components/admin/OnSiteCloseoutCalculator";
import PublishTournamentForm from "@/components/admin/PublishTournamentForm";
import StaleOfficialResultsReset from "@/components/admin/StaleOfficialResultsReset";
import PrepareMembershipReminder from "@/components/admin/PrepareMembershipReminder";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import type { TournamentResultsRecord } from "@/types/results";
import { isInsurancePotWinnerDraftComplete } from "@/lib/insurance-pot";
import { getTournamentPreparationStatus } from "@/lib/tournament-preparation";
import TournamentRegistrationAvailabilityControl from "@/components/admin/TournamentRegistrationAvailabilityControl";

interface AdminTournamentDashboardProps {
  tournaments: readonly Tournament[];
  initialTournamentId?: string;
  comparisonDate: string;
  showTournamentTools?: boolean;
  closeouts?: Record<string, OnSiteCloseoutRecord>;
  insuranceResults?: Record<string, TournamentInsurancePotResultRecord>;
  importEvidence?: Record<string, TournamentImportEvidence>;
  initialExpandedStage?: StageNumber;
  supplementalEvidence?: Record<string, SupplementalWorkflowEvidence>;
  registrationSummaries?: Record<string, TournamentRegistrationRosterSummary>;
  importedRows?: Record<string, ImportedRow[]>;
  resultsRecords?: Record<string, TournamentResultsRecord>;
  collectionSummaries?: Record<string, TournamentCollectionSummary>;
}

const stageIcons: Record<StageNumber, LucideIcon> = {
  1: ClipboardCheck,
  2: FileUp,
  3: ShieldCheck,
  4: Banknote,
  5: Globe2,
  6: Trophy,
};

export default function AdminTournamentDashboard({ tournaments, initialTournamentId, comparisonDate, showTournamentTools = false, closeouts = {}, insuranceResults = {}, importEvidence = {}, initialExpandedStage, supplementalEvidence = {}, registrationSummaries = {}, importedRows = {}, resultsRecords = {} }: AdminTournamentDashboardProps) {
  const initialTournament = getInitialAdminTournament(tournaments, new Date(comparisonDate), initialTournamentId);
  const [currentTournament, setCurrentTournament] = useState(initialTournament);
  const stages = useMemo(() => currentTournament ? resolveTournamentWorkflowState(currentTournament, { tournamentId: currentTournament.id, importEvidence: importEvidence[currentTournament.id], insuranceResult: insuranceResults[currentTournament.id], closeout: closeouts[currentTournament.id], officialPublicationExists: supplementalEvidence[currentTournament.id]?.officialPublicationExists ?? false, aoyCalculationExists: supplementalEvidence[currentTournament.id]?.aoyCalculationExists ?? false, aoyCurrentProjectionExists: supplementalEvidence[currentTournament.id]?.aoyCurrentProjectionExists ?? false, preparationStatus: getTournamentPreparationStatus(currentTournament, registrationSummaries[currentTournament.id]) }) : [], [closeouts, currentTournament, importEvidence, insuranceResults, registrationSummaries, supplementalEvidence]);
  const firstIncomplete = stages.find((stage) => stage.status !== "Complete") ?? stages[5];
  const [expandedStage, setExpandedStage] = useState<StageNumber | null>(initialExpandedStage ?? firstIncomplete?.number ?? 1);
  function selectTournament(tournament: Tournament) {
    setCurrentTournament(tournament);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tournament", tournament.id);
      window.history.replaceState(window.history.state, "", url);
    }
    const nextStage = resolveTournamentWorkflowState(tournament, { tournamentId: tournament.id, importEvidence: importEvidence[tournament.id], insuranceResult: insuranceResults[tournament.id], closeout: closeouts[tournament.id], officialPublicationExists: supplementalEvidence[tournament.id]?.officialPublicationExists ?? false, aoyCalculationExists: supplementalEvidence[tournament.id]?.aoyCalculationExists ?? false, aoyCurrentProjectionExists: supplementalEvidence[tournament.id]?.aoyCurrentProjectionExists ?? false, preparationStatus: getTournamentPreparationStatus(tournament, registrationSummaries[tournament.id]) }).find((stage) => stage.status !== "Complete");
    setExpandedStage(nextStage?.number ?? 6);
  }

  if (!currentTournament) return <p className="border border-white/10 bg-[#111111] p-5 text-sm text-neutral-300">No tournaments are available to manage.</p>;
  if (!showTournamentTools) return <CompactTournamentSummary tournament={currentTournament} stages={stages} />;

  const identifier = encodeURIComponent(currentTournament.slug || currentTournament.id);

  return <div className="space-y-4">
    <header className="border-b border-white/10 pb-3">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
        AITT Admin Center
      </p>

      <h1 className="mt-1 text-2xl font-black uppercase text-white">
        Tournament Manager
      </h1>
    </div>

    
  </div>
</header>

    
    <AdminPanel accent className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-red-500/30 bg-red-500/10 text-red-400"><CalendarDays aria-hidden="true" className="size-4" /></span><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">Current Tournament</p><h1 className="mt-1 truncate text-xl font-black uppercase text-white sm:text-2xl">{currentTournament.name}</h1><p className="mt-2 text-sm text-neutral-500">
  {stages.filter((s) => s.status === "Complete").length} of {stages.length} workflow steps complete
</p></div></div>
        <label className="text-xs font-black uppercase tracking-wide text-neutral-500 lg:w-72">Change Tournament<select value={currentTournament.id} onChange={(event) => selectTournament(tournaments.find((tournament) => tournament.id === event.target.value) ?? currentTournament)} className="mt-2 w-full border border-white/15 bg-black px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-white focus:border-[#D4A017] focus:outline-none">{tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.name}</option>)}</select></label>
      </div>
    </AdminPanel>

    <div className="divide-y divide-white/10 overflow-hidden rounded-md border border-white/10 bg-[#111111] shadow-[0_16px_40px_rgba(0,0,0,0.16)]">{stages.map((stage) => {
      const open = expandedStage === stage.number;
      const complete = stage.status === "Complete";
      const StageIcon = stageIcons[stage.number];
      return <section key={stage.number} aria-labelledby={`manager-stage-${stage.number}`} className={open ? "bg-gradient-to-r from-red-950/15 via-white/[0.025] to-transparent shadow-[inset_2px_0_0_rgba(220,38,38,0.7)]" : complete ? "bg-emerald-950/[0.035]" : ""}>
        <button type="button" aria-expanded={open} aria-controls={`manager-stage-panel-${stage.number}`} onClick={() => setExpandedStage(open ? null : stage.number)} className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-white/[0.025] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#D4A017] sm:px-5"><span className={`flex size-8 shrink-0 items-center justify-center gap-0.5 rounded-sm border text-xs font-black ${complete ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : open ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-white/15 bg-black/20 text-neutral-300"}`}>{stage.number}{complete ? <Check aria-label={`Stage ${stage.number} complete`} className="size-3" /> : null}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className={`flex size-6 items-center justify-center rounded-sm border ${open ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-white/10 bg-black/20 text-neutral-500"}`}><StageIcon aria-hidden="true" className="size-3.5" /></span><span id={`manager-stage-${stage.number}`} className="font-black uppercase text-white">{stage.title}</span><AdminStatusBadge>{stage.status}</AdminStatusBadge></span><span className="mt-1 block truncate text-sm text-neutral-500">{stage.description}</span></span><ChevronDown aria-hidden="true" className={`size-5 shrink-0 text-neutral-500 transition ${open ? "rotate-180 text-white" : ""}`} /></button>
        {open ? <div id={`manager-stage-panel-${stage.number}`} className="border-t border-white/10 px-4 py-5 sm:px-5">{stage.number === 1 ? <PrepareStage tournament={currentTournament} identifier={identifier} summary={registrationSummaries[currentTournament.id]} undoBlockers={[
          ...((importedRows[currentTournament.id]?.length ?? 0) > 0 || currentTournament.weighfish_imported || currentTournament.weighfish_imported_at ? ["Imported Results"] : []),
          ...(insuranceResults[currentTournament.id] ? ["Insurance Pot"] : []),
          ...(closeouts[currentTournament.id] ? ["Generated Checks / Payout Closeout"] : []),
          ...(supplementalEvidence[currentTournament.id]?.officialPublicationExists ? ["Published Results"] : []),
          ...(supplementalEvidence[currentTournament.id]?.aoyCalculationExists ? ["AOY Processing"] : []),
        ]} /> : stage.number === 2 ? <ImportStage tournament={currentTournament} rows={importedRows[currentTournament.id] ?? []} publicationExists={supplementalEvidence[currentTournament.id]?.officialPublicationExists ?? false} locked={stage.locked} /> : stage.number === 3 ? <InsuranceStage tournament={currentTournament} importedRows={importedRows[currentTournament.id] ?? []} insuranceResult={insuranceResults[currentTournament.id] ?? null} locked={stage.locked} strongerResetWarning={stages.find((item) => item.number === 4)?.status === "Complete"} /> : stage.number === 4 ? <PayoutStage tournament={currentTournament} importedRows={importedRows[currentTournament.id] ?? []} closeout={closeouts[currentTournament.id]} insuranceResult={insuranceResults[currentTournament.id] ?? null} locked={stage.locked} publicationExists={supplementalEvidence[currentTournament.id]?.officialPublicationExists ?? false} /> : stage.number === 5 ? <PublishStage tournament={currentTournament} importedRows={importedRows[currentTournament.id] ?? []} results={resultsRecords[currentTournament.id]} insuranceResult={insuranceResults[currentTournament.id] ?? null} locked={stage.locked} payoutComplete={stages.find((item) => item.number === 4)?.status === "Complete"} /> : <AoyStage />}</div> : null}
      </section>;
    })}</div>

  </div>;
}

function PrepareStage({ tournament, identifier, summary = { total: 0, paid: 0, needReview: 0 }, undoBlockers }: { tournament: Tournament; identifier: string; summary?: TournamentRegistrationRosterSummary; undoBlockers: string[] }) {
  return <div className="max-w-4xl space-y-5"><TournamentRegistrationAvailabilityControl key={`${tournament.id}:${tournament.status}`} tournamentId={tournament.id} initialStatus={tournament.status} /><section><h3 className="font-bold text-white">Registration &amp; Check-In</h3><dl className="mt-3 grid grid-cols-3 gap-3 text-sm"><CompactValue label="Teams" value={summary.total} /><CompactValue label="Paid" value={summary.paid} /><CompactValue label="Need Review" value={summary.needReview} /></dl><div className="mt-5 flex flex-wrap gap-3"><Link href={`/admin/registration-review?tournament=${encodeURIComponent(tournament.id)}`} className={adminButtonStyles("primary", "min-h-11")}>Open Registration &amp; Check-In</Link><Link href={`/admin/registration-review/print?tournament=${encodeURIComponent(tournament.id)}`} target="_blank" className={adminButtonStyles("secondary", "min-h-11")}>Print Check-In List</Link></div></section><PrepareMembershipReminder tournamentId={tournament.id} tournamentName={tournament.name} tournamentIdentifier={identifier} needReviewCount={summary.needReview} hasExistingImport={Boolean(tournament.weighfish_imported || tournament.weighfish_imported_at)} initialRegistrationReviewComplete={Boolean(tournament.prepare_registration_review_complete)} initialPaperMembershipsConfirmed={Boolean(tournament.paper_membership_reminder_checked)} undoBlockers={undoBlockers} returnHref={`/admin/tournament-manager?tournament=${identifier}&step=1`} /></div>;
}
function CompactValue({ label, value }: { label: string; value: number }) { return <div><dt className="text-xs uppercase text-neutral-500">{label}</dt><dd className="mt-1 font-black text-white">{value}</dd></div>; }

function ImportStage({ tournament, rows, publicationExists, locked }: { tournament: Tournament; rows: ImportedRow[]; publicationExists: boolean; locked: boolean }) {
  const identifier = encodeURIComponent(tournament.slug || tournament.id);
  const hasImportedRows = rows.length > 0;
  const hasStaleOfficialLock = tournament.result_status === "official" && !hasImportedRows && !publicationExists && !tournament.official_results_published_at;
  if (locked && !hasImportedRows) return <div className="max-w-3xl border-y border-white/10 py-4"><p className="font-black uppercase text-white">Complete Tournament Preparation before importing results.</p><p className="mt-2 text-sm leading-6 text-neutral-400">Resolve registration review issues and confirm the paper membership checklist first.</p><div className="mt-4 flex flex-wrap gap-3"><Link href={`/admin/registration-review?tournament=${identifier}`} className="inline-flex min-h-10 items-center border border-white/15 px-4 text-xs font-black uppercase text-white transition hover:border-[#D4A017] hover:text-[#D4A017]">Registration &amp; Check-In</Link><Link href={`/admin/members?tournament=${identifier}&returnTo=${encodeURIComponent(`/admin/tournament-manager?tournament=${identifier}&step=1`)}`} className="inline-flex min-h-10 items-center border border-white/15 px-4 text-xs font-black uppercase text-white transition hover:border-[#D4A017] hover:text-[#D4A017]">{tournament.name} Members List →</Link></div></div>;
  return <div className="max-w-5xl space-y-5">{hasImportedRows ? <ImportedResultsReview tournamentId={tournament.id} tournamentSlug={tournament.slug || tournament.id} rows={rows} verified={Boolean(tournament.results_verified_at)} published={tournament.result_status === "official"} /> : <><WeighfishCsvUploader key={tournament.id} tournamentId={tournament.id} />{hasStaleOfficialLock ? <div className="mt-5"><StaleOfficialResultsReset tournamentId={tournament.id} /></div> : null}</>}<Link href={`/admin/tournament-manager/import?tournament=${identifier}`} className="inline-flex text-xs font-black uppercase text-neutral-500 hover:text-[#D4A017]">Open Full Import Workspace →</Link></div>;
}
function InsuranceStage({ tournament, importedRows, insuranceResult, locked, strongerResetWarning }: { tournament: Tournament; importedRows: ImportedRow[]; insuranceResult?: TournamentInsurancePotResultRecord | null; locked: boolean; strongerResetWarning: boolean }) {
  const identifier = encodeURIComponent(tournament.slug || tournament.id);
  if (locked) return <div className="max-w-3xl border-y border-white/10 py-4"><p className="font-black uppercase text-white">Complete the Import Results step before calculating the Insurance Pot.</p><p className="mt-2 text-sm leading-6 text-neutral-400">Verify imported results first, then return here to calculate and save Insurance Pot winners.</p><Link href={`/admin/tournament-manager?tournament=${identifier}&step=3`} className="mt-4 inline-flex min-h-10 items-center border border-white/15 px-4 text-xs font-black uppercase text-white transition hover:border-[#D4A017] hover:text-[#D4A017]">Go to Insurance Pot</Link></div>;
  return <InsurancePotWorkflow tournament={tournament} importedRows={importedRows} insuranceResult={insuranceResult ?? null} strongerResetWarning={strongerResetWarning} />;
}

function PayoutStage({ tournament, importedRows, closeout, insuranceResult, locked, publicationExists }: { tournament: Tournament; importedRows: ImportedRow[]; closeout?: OnSiteCloseoutRecord; insuranceResult?: TournamentInsurancePotResultRecord | null; locked: boolean; publicationExists: boolean }) {
  const identifier = encodeURIComponent(tournament.slug || tournament.id);
  const verifiedSourceRows = importedRows.flatMap((row) => row.participation_status !== "disqualified" && row.original_import_data ? [row.original_import_data] : []);
  if (locked) return <div className="max-w-3xl border-y border-white/10 py-4"><p className="font-black uppercase text-white">Complete the Insurance Pot step before generating final payout checks.</p><p className="mt-2 text-sm leading-6 text-neutral-400">Return to Insurance Pot to save the calculation and winners first.</p><Link href={`/admin/tournament-manager?tournament=${identifier}&step=3`} className="mt-4 inline-flex min-h-10 items-center border border-white/15 px-4 text-xs font-black uppercase text-white transition hover:border-[#D4A017] hover:text-[#D4A017]">Go to Insurance Pot</Link></div>;
  return <div className="max-w-6xl space-y-8">
    <OnSiteCloseoutCalculator key={tournament.id} tournament={tournament} initialImportedRows={verifiedSourceRows} initialCloseout={closeout ?? null} insuranceResult={insuranceResult ?? null} strongerResetWarning={Boolean(publicationExists || insuranceResult?.published || closeout?.checks.some((check) => check.status === "delivered"))} />
  </div>;
}
function PublishStage({
  tournament,
  importedRows,
  results,
  insuranceResult,
  locked,
  payoutComplete,
}: {
  tournament: Tournament;
  importedRows: ImportedRow[];
  results?: TournamentResultsRecord;
  insuranceResult?: TournamentInsurancePotResultRecord;
  locked: boolean;
  payoutComplete: boolean;
}) {
  if (locked) {
    return (
      <div className="max-w-3xl border-y border-white/10 py-4">
        <p className="font-black uppercase text-white">Publish Results is locked</p>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Complete Tournament Payouts before publishing public results.
        </p>
      </div>
    );
  }

  const identifier = encodeURIComponent(tournament.slug || tournament.id);
  const insuranceReady = Boolean(
    insuranceResult?.published ||
      (insuranceResult &&
        isInsurancePotWinnerDraftComplete({
          entryCount: insuranceResult.entry_count,
          totalPotCents: insuranceResult.total_pot_cents,
          placesPaid: insuranceResult.places_paid,
          winners: insuranceResult.winners,
          published: insuranceResult.published,
        })),
  );

  const readyChecks = [
    {
      label: "Results",
      ready: Boolean(results?.entries?.length || importedRows.length),
    },
    {
      label: "Payouts",
      ready: payoutComplete,
    },
    {
      label: "Insurance Pot",
      ready: insuranceReady,
    },
    {
      label: "Winner Photos",
      ready: Boolean(
        tournament.champion_photo_url &&
          tournament.big_bass_photo_url &&
          tournament.photos_reviewed,
      ),
    },
  ] as const;

  return (
    <div className="max-w-5xl space-y-6">
      <AdminPanel className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
              Ready to Publish
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              Final Website Check
            </h3>
          </div>

          <Link
            href={`/admin/tournament-manager/publish?tournament=${identifier}#public-preview`}
            className="inline-flex min-h-11 items-center border border-white/15 px-4 text-xs font-black uppercase text-white transition hover:border-[#D4A017] hover:text-[#D4A017]"
          >
            Preview Website
          </Link>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {readyChecks.map((check) => (
            <PublicationCheck
              key={check.label}
              label={check.label}
              ready={check.ready}
            />
          ))}
        </dl>
      </AdminPanel>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/admin/results?tournament=${identifier}`}
          className="flex min-h-14 items-center justify-between border border-white/15 bg-black/20 px-5 text-sm font-black uppercase text-white transition hover:border-[#D4A017] hover:text-[#D4A017]"
        >
          Edit Results
          <span aria-hidden="true">→</span>
        </Link>

        <Link
          href={`/admin/tournament-manager/photos?tournament=${identifier}`}
          className="flex min-h-14 items-center justify-between border border-white/15 bg-black/20 px-5 text-sm font-black uppercase text-white transition hover:border-[#D4A017] hover:text-[#D4A017]"
        >
          Winner Photos
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      {payoutComplete ? (
        <PublishTournamentForm
          tournamentId={tournament.id}
          identifier={tournament.slug || tournament.id}
        />
      ) : (
        <section className="border border-[#D4A017]/30 bg-[#D4A017]/5 p-5">
          <h3 className="text-xl font-black uppercase text-white">
            Publish Results
          </h3>
          <p className="mt-2 text-sm text-neutral-300">
            Complete Tournament Payouts before publishing.
          </p>
        </section>
      )}
    </div>
  );
}

function PublicationCheck({ label, ready }: { label: string; ready: boolean }) {
  return <div className="flex items-center justify-between gap-4 rounded-sm border border-white/10 bg-black/40 px-4 py-3"><dt className="text-sm text-neutral-300">{label}</dt><dd><AdminStatusBadge tone={ready ? "positive" : "attention"}>{ready ? "Ready" : "Pending"}</AdminStatusBadge></dd></div>;
}
function AoyStage() { return <div className="max-w-3xl border-y border-white/10 py-4"><p className="text-sm text-neutral-400">AOY management tools are not implemented yet.</p></div>; }


function CompactTournamentSummary({ tournament, stages }: { tournament: Tournament; stages: Stage[] }) { return <AdminPanel accent className="p-5"><p className="text-xs font-black uppercase tracking-wider text-red-500">Current Tournament</p><h1 className="mt-2 text-2xl font-black uppercase text-white">{tournament.name}</h1><dl className="mt-4 grid gap-3 sm:grid-cols-2">{stages.map((stage) => <div key={stage.number} className="flex items-center justify-between gap-4"><dt className="text-sm text-neutral-300">{stage.title}</dt><dd><AdminStatusBadge>{stage.status}</AdminStatusBadge></dd></div>)}</dl></AdminPanel>; }
