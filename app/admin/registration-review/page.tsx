import Link from "next/link";

import RegistrationReviewResolutionForm from "@/components/admin/RegistrationReviewResolutionForm";
import RegistrationContactReviewForm from "@/components/admin/RegistrationContactReviewForm";
import HistoricalMembershipReviewForm from "@/components/admin/HistoricalMembershipReviewForm";
import RegistrationCheckInControl from "@/components/admin/RegistrationCheckInControl";
import RegistrationCheckInSummaryStat from "@/components/admin/RegistrationCheckInSummaryStat";
import PrepareMembershipReminder from "@/components/admin/PrepareMembershipReminder";
import { AddWalkUpControl } from "@/components/admin/RegistrationOperationsControls";
import RegistrationRosterToolbar from "@/components/admin/RegistrationRosterToolbar";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { requireAdminUser } from "@/lib/admin-auth";
import { listRegistrationReviewItems, listReviewAnglerOptions } from "@/lib/registration-identity-review";
import { filterTournamentRegistrationRosterRows, getTournamentRegistrationRoster, paginateTournamentRegistrationRosterRows, summarizeTournamentRegistrationRoster, type RegistrationRosterFilter, type TournamentRegistrationRosterRow } from "@/lib/tournament-registration-roster";
import { getRegistrationReviewPresentation } from "@/lib/registration-review-presentation";
import { getActiveSeasonSchedule, getNextUpcomingTournament } from "@/lib/tournaments";
import { getPreparationUndoProtection } from "@/lib/tournament-preparation-protection";

export const dynamic = "force-dynamic";

const pageSizes = [25, 50, 100] as const;

export default async function RegistrationReviewPage({ searchParams }: { searchParams: Promise<{ tournament?: string; filter?: string; search?: string; page?: string; pageSize?: string }> }) {
  await requireAdminUser();
  const { tournament, filter: requestedFilter, search: requestedSearch, page: requestedPage, pageSize: requestedPageSize } = await searchParams;
  const filter: RegistrationRosterFilter = requestedFilter === "needs_review" || requestedFilter === "walk_ups" || requestedFilter === "check_ins" ? requestedFilter : "all";
  const search = requestedSearch?.trim() ?? "";
  const pageSize: 25 | 50 | 100 = requestedPageSize === "50"
    ? 50
    : requestedPageSize === "100"
      ? 100
      : 25;
  const requestedPageNumber = Number.parseInt(requestedPage ?? "1", 10);
  const [tournaments, currentTournament] = await Promise.all([getActiveSeasonSchedule(), getNextUpcomingTournament()]);
  const selectedTournament = tournaments.find((item) => item.id === tournament || item.slug === tournament)
    ?? currentTournament
    ?? tournaments[0]
    ?? null;
  const [allRows, reviewItems, anglers, undoProtection] = selectedTournament
    ? await Promise.all([getTournamentRegistrationRoster(selectedTournament.id), listRegistrationReviewItems(selectedTournament.id), listReviewAnglerOptions(selectedTournament.id), getPreparationUndoProtection(selectedTournament.id)])
    : [[], [], [], { blockers: [] }];
  const reviewsByRegistration = new Map<string, typeof reviewItems>();
  for (const item of reviewItems) reviewsByRegistration.set(item.registrationId, [...(reviewsByRegistration.get(item.registrationId) ?? []), item]);
  const pendingReviewIds = new Set(reviewItems.filter((item) => item.status === "review_required").map((item) => item.registrationId));
  const checkInRemainingCount = allRows.filter((row) => row.checkedInAt === null).length;
  const filteredRows = filterTournamentRegistrationRosterRows(
    allRows.filter((row) => filter !== "needs_review" || row.needsReview || pendingReviewIds.has(row.id)),
    filter === "needs_review" ? "all" : filter,
    search,
  );
  const { pageRows: rows, totalRows, totalPages, currentPage, rangeStart, rangeEnd } = paginateTournamentRegistrationRosterRows(filteredRows, requestedPageNumber, pageSize);
  const baseSummary = summarizeTournamentRegistrationRoster(allRows);
  const summary = {
    ...baseSummary,
    needReview: allRows.filter((row) => row.needsReview || pendingReviewIds.has(row.id)).length,
    walkUps: allRows.filter((row) => row.registrationSource === "walk_up").length,
  };
  const tournamentValue = selectedTournament?.id ?? "";
  const queryBaseParams = new URLSearchParams();
  if (tournamentValue) queryBaseParams.set("tournament", tournamentValue);
  if (filter !== "all") queryBaseParams.set("filter", filter);
  if (search) queryBaseParams.set("search", search);
  const queryBase = queryBaseParams.toString();

  return <>
    <header>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">Tournament Operations</p>
      <h1 className="mt-2 text-4xl font-black uppercase text-white">Registration &amp; Check-In</h1>
      <p className="mt-3 max-w-3xl text-neutral-400">The authoritative tournament roster for registration review, payment verification, preparation, and tournament-morning check-in.</p>
    </header>

    <form className="mt-6 flex max-w-2xl gap-3">
      <select name="tournament" defaultValue={tournamentValue} className="min-h-11 flex-1 border border-white/15 bg-[#111] px-3 text-sm text-white">
        <option value="">Select a tournament</option>
        {tournaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <input type="hidden" name="filter" value={filter} />
      <button className={adminButtonStyles("primary", "min-h-11 px-5")}>View Roster</button>
    </form>

    {selectedTournament ? <>
      <AdminPanel accent className="mt-6 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4A017]">
          {selectedTournament.id === currentTournament?.id ? "Current Tournament" : "Selected Tournament"}
        </p>
        <h2 className="mt-2 text-2xl font-black uppercase text-white">
          {selectedTournament.name} — {dateOnly(selectedTournament.tournament_date)}
        </h2>
        <p className="mt-2 text-xs text-neutral-500">Changing the selector only changes the roster being viewed. It never moves or modifies registrations.</p>
      </AdminPanel>

      <AdminPanel className="mt-6 p-4">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="text-sm font-bold uppercase text-white">{selectedTournament.name}</h2>
            <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-3 text-sm"><Metric label="Registrations" value={summary.total} /><Metric label="Needs Review" value={summary.needReview} /><Metric label="Walk-Ups" value={summary.walkUps} /><RegistrationCheckInSummaryStat tournamentId={selectedTournament.id} filter={filter} search={search} pageSize={pageSize} count={checkInRemainingCount} /></dl>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Export / Share</p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/registration-review/print?${queryBase}`} className={adminButtonStyles("primary")} target="_blank">Download PDF / Print List</Link>
              <Link href={`/admin/registration-review/export?${queryBase}`} className={adminButtonStyles("secondary")}>Download CSV</Link>
            </div>
          </div>
        </div>
      </AdminPanel>

      <div className="mt-5">
        <AddWalkUpControl tournamentId={selectedTournament.id} />
      </div>

      <div className="mt-5">
        <PrepareMembershipReminder
          tournamentId={selectedTournament.id}
          tournamentName={selectedTournament.name}
          tournamentIdentifier={encodeURIComponent(selectedTournament.slug || selectedTournament.id)}
          needReviewCount={summary.needReview}
          hasExistingImport={Boolean(selectedTournament.weighfish_imported || selectedTournament.weighfish_imported_at)}
          initialRegistrationReviewComplete={Boolean(selectedTournament.prepare_registration_review_complete)}
          initialPaperMembershipsConfirmed={Boolean(selectedTournament.paper_membership_reminder_checked)}
          undoBlockers={undoProtection.blockers}
          returnHref={`/admin/registration-review?tournament=${encodeURIComponent(selectedTournament.id)}`}
        />
      </div>

      <section id="registration-entries" className="mt-5 overflow-hidden rounded-md border border-white/10 bg-[#0f0f0f]">
       <RegistrationRosterToolbar
          key={`${filter}:${search}:${pageSize}`}
          tournamentId={tournamentValue}
          filter={filter}
          search={search}
          page={currentPage}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
        />
      <div className="grid gap-3 p-3 md:hidden" data-testid="mobile-registration-roster">
        {rows.map((row) => <MobileRosterCard key={row.id} row={row} tournamentId={selectedTournament.id} reviews={reviewsByRegistration.get(row.id) ?? []} anglers={anglers} />)}
        {!rows.length ? <p className="border border-white/10 bg-[#111] px-4 py-10 text-center text-sm text-neutral-500">{emptyRosterMessage(filter)}</p> : null}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1080px] text-left text-xs">
          <thead className="border-b border-white/15 bg-black/40 font-black uppercase tracking-[0.06em] text-neutral-400"><tr>
             {['Boat #','Type','Participants','Member Status','Member Pots','Insurance','Big Bass','Registered','Check-In / Review','Weight'].map((label) => <th key={label} className={label === 'Weight' ? "w-20 px-3 py-3 align-top" : "px-3 py-3 align-top"}>{label}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => <RosterRow key={row.id} row={row} tournamentId={selectedTournament.id} reviews={reviewsByRegistration.get(row.id) ?? []} anglers={anglers} />)}
             {!rows.length ? <tr><td colSpan={10} className="px-4 py-10 text-center text-neutral-500">{emptyRosterMessage(filter)}</td></tr> : null}
          </tbody>
        </table>
      </div>
      </section>
    </> : <p className="mt-6 border border-white/10 bg-[#111] p-5 text-neutral-400">Select a tournament to load its registration roster and export actions.</p>}
  </>;
}

function RosterRow({ row, tournamentId, reviews, anglers }: { row: TournamentRegistrationRosterRow; tournamentId: string; reviews: Awaited<ReturnType<typeof listRegistrationReviewItems>>; anglers: Awaited<ReturnType<typeof listReviewAnglerOptions>> }) {
  return <tr className="align-top transition-colors hover:bg-white/[0.025]">
    <td className="px-3 py-3 text-lg font-black text-[#D4A017]">#{row.boatNumber ?? "—"}</td>
    <td className="whitespace-nowrap px-3 py-3 font-bold text-neutral-300">{title(row.registrationType)}</td>
    <td className="px-3 py-3 font-bold text-white">{row.angler1.displayName}{row.angler2 ? ` / ${row.angler2.displayName}` : ""}</td>
    <td className="px-3 py-3 text-neutral-300"><p>{row.angler1.memberStatus}</p>{row.angler2 ? <p>{row.angler2.memberStatus}</p> : null}</td>
    <td className="px-3 py-3 font-bold text-white">{row.memberPot ? title(row.memberPot) : "None"}</td>
    <td className="px-3 py-3 text-neutral-300">{yesNo(row.insurance)}</td>
    <td className="px-3 py-3 text-neutral-300">{yesNo(row.bigBass)}</td>
    <td className="whitespace-nowrap px-3 py-3 text-neutral-300">{compactDateTime(row.registeredAt)}</td>
    <td className="max-w-sm px-3 py-3"><RosterActions row={row} tournamentId={tournamentId} reviews={reviews} anglers={anglers} /></td>
    <td aria-label={`Blank weight for boat ${row.boatNumber ?? "unassigned"}`} className="w-20 px-3 py-3">&nbsp;</td>
  </tr>;
}

function MobileRosterCard({ row, tournamentId, reviews, anglers }: { row: TournamentRegistrationRosterRow; tournamentId: string; reviews: Awaited<ReturnType<typeof listRegistrationReviewItems>>; anglers: Awaited<ReturnType<typeof listReviewAnglerOptions>> }) {
  return <article className="border border-white/10 bg-[#111] p-4" data-testid="mobile-registration-card"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-base font-black text-white">{row.angler1.displayName}</p>{row.angler2 ? <p className="mt-1 text-sm font-bold text-neutral-300">{row.angler2.displayName}</p> : null}<p className="mt-2 text-[10px] text-neutral-500">Registered {compactDateTime(row.registeredAt)}</p></div><div className="shrink-0 text-right"><p className="text-[10px] font-black uppercase text-neutral-500">Boat #</p><p className="mt-1 text-2xl font-black text-[#D4A017]">{row.boatNumber ?? "—"}</p></div></div><dl className="mt-4 grid grid-cols-2 gap-3 border-y border-white/10 py-3 text-xs"><div><dt className="uppercase text-neutral-500">Type</dt><dd className="mt-1 font-bold text-white">{title(row.registrationType)}</dd></div><div><dt className="uppercase text-neutral-500">Member Status</dt><dd className="mt-1 font-bold text-white">{row.membershipStatus}</dd></div><div><dt className="uppercase text-neutral-500">Member Pots</dt><dd className="mt-1 font-bold text-white">{row.memberPot ? title(row.memberPot) : "None"}</dd></div><div><dt className="uppercase text-neutral-500">Insurance</dt><dd className="mt-1 font-bold text-white">{yesNo(row.insurance)}</dd></div><div><dt className="uppercase text-neutral-500">Big Bass</dt><dd className="mt-1 font-bold text-white">{yesNo(row.bigBass)}</dd></div></dl><div className="mt-4"><RosterActions row={row} tournamentId={tournamentId} reviews={reviews} anglers={anglers} /><div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3"><span className="text-[10px] font-black uppercase text-neutral-500">Weight</span><span aria-label={`Blank weight for boat ${row.boatNumber ?? "unassigned"}`} className="h-6 min-w-20 flex-1 border-b border-white/25" /></div></div></article>;
}

function RosterActions({ row, tournamentId, reviews, anglers }: { row: TournamentRegistrationRosterRow; tournamentId: string; reviews: Awaited<ReturnType<typeof listRegistrationReviewItems>>; anglers: Awaited<ReturnType<typeof listReviewAnglerOptions>> }) {
  const pendingReviews = reviews.filter((review) => review.status === "review_required");
  const needsReview = row.needsReview || pendingReviews.length > 0;
  return <>
    <div className="flex flex-wrap items-start gap-2">{needsReview ? <AdminStatusBadge tone="attention">Needs Review</AdminStatusBadge> : null}<RegistrationCheckInControl tournamentId={tournamentId} registrationId={row.id} checkedInAt={row.checkedInAt} /></div>
    {pendingReviews.map((review) => {
      const presentation = getRegistrationReviewPresentation(review);
      return <details key={review.id} className="mt-3 border-t border-white/10 pt-3">
      <summary className="cursor-pointer text-xs font-bold text-amber-200">{review.participantName} — {presentation.heading}</summary>
      {review.reviewKind === "contact" ? null : <div className="mt-2 text-xs text-neutral-300"><p><span className="font-bold text-white">Issue:</span> {presentation.issue}</p>{presentation.identityFollowUp ? <p className="mt-1 text-neutral-400">{presentation.identityFollowUp}</p> : null}</div>}
      {review.reviewKind === "contact" && review.existingContact && review.submittedContact
        ? <RegistrationContactReviewForm reviewId={review.id} participantName={review.participantName} reviewReason={review.reason} existing={review.existingContact} submitted={review.submittedContact} differingFields={review.differingFields} />
        : review.reviewKind === "membership" ? <HistoricalMembershipReviewForm reviewId={review.id} />
        : <RegistrationReviewResolutionForm reviewId={review.id} anglers={anglers} suggestedAnglerIds={review.suggestedAnglers.map((angler) => angler.id)} submission={{ name: review.participantName, email: review.email, phone: review.phone, membership: review.submittedMembership }} />}
    </details>})}
  </>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div><dt className="text-[10px] uppercase text-neutral-500">{label}</dt><dd className="mt-1 font-black tabular-nums text-white">{value}</dd></div>; }
function emptyRosterMessage(filter: RegistrationRosterFilter) { return filter === "needs_review" ? "No registrations need review." : filter === "walk_ups" ? "No active walk-ups are available for this tournament." : filter === "check_ins" ? "No unchecked registrations remain." : "No registrations are available for this tournament."; }
function compactDateTime(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
function dateOnly(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", dateStyle: "medium" }).format(new Date(`${value.slice(0, 10)}T12:00:00-05:00`)); }
function title(value: string) { return value[0].toUpperCase() + value.slice(1); }
function yesNo(value: boolean) { return value ? "Yes" : "No"; }
