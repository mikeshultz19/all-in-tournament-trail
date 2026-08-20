import Link from "next/link";
import type { ReactNode } from "react";

import RegistrationReviewResolutionForm from "@/components/admin/RegistrationReviewResolutionForm";
import RegistrationContactReviewForm from "@/components/admin/RegistrationContactReviewForm";
import HistoricalMembershipReviewForm from "@/components/admin/HistoricalMembershipReviewForm";
import RegistrationCheckInControl from "@/components/admin/RegistrationCheckInControl";
import PrepareMembershipReminder from "@/components/admin/PrepareMembershipReminder";
import { AddWalkUpControl, RegistrationEditControl } from "@/components/admin/RegistrationOperationsControls";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { reopenRegistrationReviewAction } from "@/app/admin/registration-review/actions";
import { requireAdminUser } from "@/lib/admin-auth";
import { listRegistrationReviewItems, listReviewAnglerOptions } from "@/lib/registration-identity-review";
import { getTournamentRegistrationRoster, summarizeTournamentRegistrationRoster, type TournamentRegistrationRosterRow } from "@/lib/tournament-registration-roster";
import { getActiveSeasonSchedule, getNextUpcomingTournament } from "@/lib/tournaments";
import { getPreparationUndoProtection } from "@/lib/tournament-preparation-protection";

export const dynamic = "force-dynamic";
type RosterFilter = "all" | "needs_review" | "walk_ups";

export default async function RegistrationReviewPage({ searchParams }: { searchParams: Promise<{ tournament?: string; filter?: string }> }) {
  await requireAdminUser();
  const { tournament, filter: requestedFilter } = await searchParams;
  const filter: RosterFilter = requestedFilter === "needs_review" || requestedFilter === "walk_ups" ? requestedFilter : "all";
  const [tournaments, currentTournament] = await Promise.all([getActiveSeasonSchedule(), getNextUpcomingTournament()]);
  const selectedTournament = tournaments.find((item) => item.id === tournament || item.slug === tournament)
    ?? currentTournament
    ?? tournaments[0]
    ?? null;
  const [allRows, reviewItems, anglers, undoProtection] = selectedTournament
    ? await Promise.all([getTournamentRegistrationRoster(selectedTournament.id), listRegistrationReviewItems(selectedTournament.id), listReviewAnglerOptions(), getPreparationUndoProtection(selectedTournament.id)])
    : [[], [], [], { blockers: [] }];
  const reviewsByRegistration = new Map<string, typeof reviewItems>();
  for (const item of reviewItems) reviewsByRegistration.set(item.registrationId, [...(reviewsByRegistration.get(item.registrationId) ?? []), item]);
  const pendingReviewIds = new Set(reviewItems.filter((item) => item.status === "review_required").map((item) => item.registrationId));
  const rows = filter === "needs_review"
    ? allRows.filter((row) => row.needsReview || pendingReviewIds.has(row.id))
    : filter === "walk_ups"
      ? allRows
          .filter((row) => row.registrationSource === "walk_up")
          .toSorted((left, right) => (left.boatNumber ?? Number.MAX_SAFE_INTEGER) - (right.boatNumber ?? Number.MAX_SAFE_INTEGER) || left.registeredAt.localeCompare(right.registeredAt))
      : allRows;
  const baseSummary = summarizeTournamentRegistrationRoster(allRows);
  const summary = {
    ...baseSummary,
    needReview: allRows.filter((row) => row.needsReview || pendingReviewIds.has(row.id)).length,
    walkUps: allRows.filter((row) => row.registrationSource === "walk_up").length,
  };
  const tournamentValue = selectedTournament?.id ?? "";
  const queryBase = tournamentValue ? `tournament=${encodeURIComponent(tournamentValue)}` : "";

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
            <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-3 text-sm"><Metric label="Registrations" value={summary.total} /><Metric label="Paid" value={summary.paid} /><Metric label="Needs Review" value={summary.needReview} /><Metric label="Walk-Ups" value={summary.walkUps} /></dl>
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

      <nav aria-label="Registration filters" className="mt-5 flex flex-wrap gap-2">
        <FilterLink href={`/admin/registration-review?${queryBase}&filter=all`} active={filter === "all"}>All Registrations</FilterLink>
        <FilterLink href={`/admin/registration-review?${queryBase}&filter=needs_review`} active={filter === "needs_review"}>Needs Review</FilterLink>
        <FilterLink href={`/admin/registration-review?${queryBase}&filter=walk_ups`} active={filter === "walk_ups"}>Walk-Ups</FilterLink>
      </nav>

      <div className="mt-4 grid gap-3 md:hidden" data-testid="mobile-registration-roster">
        {rows.map((row) => <MobileRosterCard key={row.id} row={row} tournamentId={selectedTournament.id} reviews={reviewsByRegistration.get(row.id) ?? []} anglers={anglers} />)}
        {!rows.length ? <p className="border border-white/10 bg-[#111] px-4 py-10 text-center text-sm text-neutral-500">{emptyRosterMessage(filter)}</p> : null}
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-md border border-white/10 bg-[#0f0f0f] md:block">
        <table className="w-full min-w-[1450px] text-left text-xs">
          <thead className="border-b border-white/15 bg-black/40 font-black uppercase tracking-[0.06em] text-neutral-400"><tr>
            {['Team / Solo','Boat #','Anglers & Membership','Benefits','Entry Options','Financial','Payment','Registration','Review / Check-In'].map((label) => <th key={label} className="px-3 py-3 align-top">{label}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => <RosterRow key={row.id} row={row} tournamentId={selectedTournament.id} reviews={reviewsByRegistration.get(row.id) ?? []} anglers={anglers} />)}
            {!rows.length ? <tr><td colSpan={9} className="px-4 py-10 text-center text-neutral-500">{emptyRosterMessage(filter)}</td></tr> : null}
          </tbody>
        </table>
      </div>
    </> : <p className="mt-6 border border-white/10 bg-[#111] p-5 text-neutral-400">Select a tournament to load its registration roster and export actions.</p>}
  </>;
}

function RosterRow({ row, tournamentId, reviews, anglers }: { row: TournamentRegistrationRosterRow; tournamentId: string; reviews: Awaited<ReturnType<typeof listRegistrationReviewItems>>; anglers: Awaited<ReturnType<typeof listReviewAnglerOptions>> }) {
  return <tr className="align-top transition-colors hover:bg-white/[0.025]">
    <td className="px-3 py-4"><AdminStatusBadge>{row.registrationType}</AdminStatusBadge><p className="mt-2 font-mono text-[10px] text-neutral-500">{row.registrationKey}</p></td>
    <td className="px-3 py-4 text-lg font-black text-white">{row.boatNumber ?? "—"}</td>
    <td className="px-3 py-4 text-neutral-300"><AnglerLine label="A1" name={row.angler1.displayName} membership={row.angler1.membership} />{row.angler2 ? <AnglerLine label="A2" name={row.angler2.displayName} membership={row.angler2.membership} /> : null}</td>
    <td className="px-3 py-4"><AdminStatusBadge tone={row.memberBenefitsEligible ? "positive" : "neutral"}>{row.memberBenefitsEligible ? "Eligible" : "Not Eligible"}</AdminStatusBadge></td>
    <td className="px-3 py-4 leading-5 text-neutral-300"><p>{row.entryType}</p><p>Big Bass: {yesNo(row.bigBass)}</p><p>Member Pot: {row.memberPot ? title(row.memberPot) : "None"}</p><p>Insurance: {yesNo(row.insurance)}</p></td>
    <td className="px-3 py-4 text-neutral-300"><MoneyLine label="Entry" value={row.entryAmountCents} /><MoneyLine label="Membership" value={row.membershipAmountCents} /><MoneyLine label="Big Bass" value={row.bigBassAmountCents} /><MoneyLine label={row.memberPot ? `${title(row.memberPot)} Pot` : "Member Pot"} value={row.memberPotAmountCents} /><MoneyLine label="Insurance" value={row.insuranceAmountCents} /><MoneyLine label="Card Fee" value={row.processingFeeCents} /><p className="mt-1 border-t border-white/10 pt-1 font-black text-white">Total: {money(row.totalPaidCents)}</p></td>
    <td className="px-3 py-4"><AdminStatusBadge tone={row.paymentStatus === "Paid" ? "positive" : "attention"}>{row.paymentStatus}</AdminStatusBadge></td>
    <td className="px-3 py-4 text-neutral-300"><p>{row.registrationPeriod}</p><p className="mt-1 whitespace-nowrap text-[10px] text-neutral-500">{dateTime(row.registeredAt)}</p></td>
    <td className="max-w-sm px-3 py-4"><RosterActions row={row} tournamentId={tournamentId} reviews={reviews} anglers={anglers} /></td>
  </tr>;
}

function MobileRosterCard({ row, tournamentId, reviews, anglers }: { row: TournamentRegistrationRosterRow; tournamentId: string; reviews: Awaited<ReturnType<typeof listRegistrationReviewItems>>; anglers: Awaited<ReturnType<typeof listReviewAnglerOptions>> }) {
  return <article className="border border-white/10 bg-[#111] p-4" data-testid="mobile-registration-card"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-base font-black text-white">{row.angler1.displayName}</p>{row.angler2 ? <p className="mt-1 text-sm font-bold text-neutral-300">{row.angler2.displayName}</p> : null}<p className="mt-2 text-[10px] uppercase text-neutral-500">{row.registrationPeriod} · {row.paymentStatus}</p></div><div className="shrink-0 text-right"><p className="text-[10px] font-black uppercase text-neutral-500">Boat #</p><p className="mt-1 text-2xl font-black text-[#D4A017]">{row.boatNumber ?? "—"}</p></div></div><dl className="mt-4 grid grid-cols-2 gap-3 border-y border-white/10 py-3 text-xs"><div><dt className="uppercase text-neutral-500">Membership</dt><dd className="mt-1 font-bold text-white">{row.membershipStatus}</dd></div><div><dt className="uppercase text-neutral-500">Options</dt><dd className="mt-1 font-bold text-white">{row.sidePots.length ? row.sidePots.join(", ") : "None"}</dd></div></dl><div className="mt-4"><RosterActions row={row} tournamentId={tournamentId} reviews={reviews} anglers={anglers} /></div></article>;
}

function RosterActions({ row, tournamentId, reviews, anglers }: { row: TournamentRegistrationRosterRow; tournamentId: string; reviews: Awaited<ReturnType<typeof listRegistrationReviewItems>>; anglers: Awaited<ReturnType<typeof listReviewAnglerOptions>> }) {
  const needsReview = row.needsReview || reviews.some((review) => review.status === "review_required");
  return <>
    <div className="flex flex-wrap items-start gap-2"><AdminStatusBadge tone={needsReview ? "attention" : "positive"}>{needsReview ? "Needs Review" : row.checkedInAt ? "Locked / Confirmed" : "Ready"}</AdminStatusBadge><RegistrationCheckInControl tournamentId={tournamentId} registrationId={row.id} checkedInAt={row.checkedInAt} /></div>
    <RegistrationEditControl tournamentId={tournamentId} registrationId={row.id} boatNumber={row.boatNumber} bigBass={row.bigBass} memberPot={row.memberPot} insurance={row.insurance} checkedIn={Boolean(row.checkedInAt)} walkUp={row.registrationSource === "walk_up"} contactSnapshot={row.participantContactSnapshot} />
    {reviews.map((review) => <div key={review.id} className="mt-3 border-t border-white/10 pt-3">
      <p className="text-xs text-neutral-300"><span className="font-bold text-white">{review.participantName}:</span> {review.reason}</p>
      {review.status === "review_required" ? review.reviewKind === "contact" && review.existingContact && review.submittedContact
        ? <RegistrationContactReviewForm reviewId={review.id} existing={review.existingContact} submitted={review.submittedContact} differingFields={review.differingFields} />
        : review.reviewKind === "membership" ? <HistoricalMembershipReviewForm reviewId={review.id} />
        : <RegistrationReviewResolutionForm reviewId={review.id} anglers={anglers} suggestedAnglerIds={review.suggestedAnglers.map((angler) => angler.id)} />
        : review.reviewKind === "identity" ? <form action={reopenRegistrationReviewAction} className="mt-2 flex gap-2"><input type="hidden" name="reviewId" value={review.id} /><input name="reviewNote" aria-label={`Reason for reopening ${review.participantName}`} placeholder="Reason for reopening" className="min-h-9 min-w-0 flex-1 border border-white/15 bg-[#0B0B0B] px-2 text-xs text-white" /><button className={adminButtonStyles("destructive", "min-h-9 px-2 text-[10px]")}>Reopen Review</button></form>
        : <p className="mt-2 text-xs text-emerald-300">Review complete.</p>}
    </div>)}
  </>;
}

function AnglerLine({ label, name, membership }: { label: string; name: string; membership: string }) { return <div className="mb-2 last:mb-0"><p className="font-bold text-white">{label}: {name}</p><p className="mt-0.5 text-[10px] text-neutral-500">{membership}</p></div>; }
function MoneyLine({ label, value }: { label: string; value: number | null }) { return <p className="flex justify-between gap-3"><span>{label}</span><span className="tabular-nums">{money(value)}</span></p>; }
function Metric({ label, value }: { label: string; value: number }) { return <div><dt className="text-[10px] uppercase text-neutral-500">{label}</dt><dd className="mt-1 font-black tabular-nums text-white">{value}</dd></div>; }
function FilterLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) { return <Link href={href} aria-current={active ? "page" : undefined} className={adminButtonStyles(active ? "primary" : "secondary", "min-h-9 px-3")}>{children}</Link>; }
function emptyRosterMessage(filter: RosterFilter) { return filter === "needs_review" ? "No registrations need review." : filter === "walk_ups" ? "No active walk-ups are available for this tournament." : "No registrations are available for this tournament."; }
function money(value: number | null) { return value === null ? "Not stored" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100); }
function dateTime(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
function dateOnly(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", dateStyle: "medium" }).format(new Date(`${value.slice(0, 10)}T12:00:00-05:00`)); }
function title(value: string) { return value[0].toUpperCase() + value.slice(1); }
function yesNo(value: boolean) { return value ? "Yes" : "No"; }
