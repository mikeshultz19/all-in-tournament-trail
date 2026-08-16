import Link from "next/link";
import type { ReactNode } from "react";

import RegistrationReviewResolutionForm from "@/components/admin/RegistrationReviewResolutionForm";
import RegistrationCheckInControl from "@/components/admin/RegistrationCheckInControl";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { reopenRegistrationReviewAction } from "@/app/admin/registration-review/actions";
import { requireAdminUser } from "@/lib/admin-auth";
import { listRegistrationReviewItems, listReviewAnglerOptions } from "@/lib/registration-identity-review";
import { getTournamentRegistrationRoster, summarizeTournamentRegistrationRoster, type TournamentRegistrationRosterRow } from "@/lib/tournament-registration-roster";
import { getActiveSeasonSchedule } from "@/lib/tournaments";

export const dynamic = "force-dynamic";
type RosterFilter = "all" | "needs_review";

export default async function RegistrationReviewPage({ searchParams }: { searchParams: Promise<{ tournament?: string; filter?: string }> }) {
  await requireAdminUser();
  const { tournament, filter: requestedFilter } = await searchParams;
  const filter: RosterFilter = requestedFilter === "needs_review" ? "needs_review" : "all";
  const tournaments = await getActiveSeasonSchedule();
  const selectedTournament = tournaments.find((item) => item.id === tournament || item.slug === tournament) ?? null;
  const [allRows, reviewItems, anglers] = selectedTournament
    ? await Promise.all([getTournamentRegistrationRoster(selectedTournament.id), listRegistrationReviewItems(selectedTournament.id), listReviewAnglerOptions()])
    : [[], [], []];
  const rows = filter === "needs_review" ? allRows.filter((row) => row.needsReview) : allRows;
  const summary = summarizeTournamentRegistrationRoster(allRows);
  const reviewsByRegistration = new Map<string, typeof reviewItems>();
  for (const item of reviewItems) reviewsByRegistration.set(item.registrationId, [...(reviewsByRegistration.get(item.registrationId) ?? []), item]);
  const tournamentValue = selectedTournament?.id ?? "";
  const queryBase = tournamentValue ? `tournament=${encodeURIComponent(tournamentValue)}` : "";

  return <>
    <header>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">Tournament Operations</p>
      <h1 className="mt-2 text-4xl font-black uppercase text-white">Registration Review</h1>
      <p className="mt-3 max-w-3xl text-neutral-400">The complete website-registration roster for pre-tournament review, payment verification, and check-in.</p>
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
      <AdminPanel className="mt-6 p-4">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="text-sm font-bold uppercase text-white">{selectedTournament.name}</h2>
            <dl className="mt-3 flex gap-8 text-sm"><Metric label="Registrations" value={summary.total} /><Metric label="Paid" value={summary.paid} /><Metric label="Needs Review" value={summary.needReview} /></dl>
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

      <nav aria-label="Registration filters" className="mt-5 flex flex-wrap gap-2">
        <FilterLink href={`/admin/registration-review?${queryBase}&filter=all`} active={filter === "all"}>All Registrations</FilterLink>
        <FilterLink href={`/admin/registration-review?${queryBase}&filter=needs_review`} active={filter === "needs_review"}>Needs Review</FilterLink>
      </nav>

      <div className="mt-4 overflow-x-auto rounded-md border border-white/10 bg-[#0f0f0f]">
        <table className="w-full min-w-[1450px] text-left text-xs">
          <thead className="border-b border-white/15 bg-black/40 font-black uppercase tracking-[0.06em] text-neutral-400"><tr>
            {['Team / Solo','Anglers & Membership','Benefits','Entry Options','Financial','Payment','Registration','Review / Check-In'].map((label) => <th key={label} className="px-3 py-3 align-top">{label}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => <RosterRow key={row.id} row={row} tournamentId={selectedTournament.id} reviews={reviewsByRegistration.get(row.id) ?? []} anglers={anglers} />)}
            {!rows.length ? <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-500">{filter === "needs_review" ? "No registrations need review." : "No website registrations are available for this tournament."}</td></tr> : null}
          </tbody>
        </table>
      </div>
    </> : <p className="mt-6 border border-white/10 bg-[#111] p-5 text-neutral-400">Select a tournament to load its registration roster and export actions.</p>}
  </>;
}

function RosterRow({ row, tournamentId, reviews, anglers }: { row: TournamentRegistrationRosterRow; tournamentId: string; reviews: Awaited<ReturnType<typeof listRegistrationReviewItems>>; anglers: Awaited<ReturnType<typeof listReviewAnglerOptions>> }) {
  return <tr className="align-top transition-colors hover:bg-white/[0.025]">
    <td className="px-3 py-4"><AdminStatusBadge>{row.registrationType}</AdminStatusBadge><p className="mt-2 font-mono text-[10px] text-neutral-500">{row.registrationKey}</p></td>
    <td className="px-3 py-4 text-neutral-300"><AnglerLine label="A1" name={row.angler1.displayName} membership={row.angler1.membership} />{row.angler2 ? <AnglerLine label="A2" name={row.angler2.displayName} membership={row.angler2.membership} /> : null}</td>
    <td className="px-3 py-4"><AdminStatusBadge tone={row.memberBenefitsEligible ? "positive" : "neutral"}>{row.memberBenefitsEligible ? "Eligible" : "Not Eligible"}</AdminStatusBadge></td>
    <td className="px-3 py-4 leading-5 text-neutral-300"><p>{row.entryType}</p><p>Big Bass: {yesNo(row.bigBass)}</p><p>Member Pot: {row.memberPot ? title(row.memberPot) : "None"}</p><p>Insurance: {yesNo(row.insurance)}</p></td>
    <td className="px-3 py-4 text-neutral-300"><MoneyLine label="Entry" value={row.entryAmountCents} /><MoneyLine label="Membership" value={row.membershipAmountCents} /><MoneyLine label="Big Bass" value={row.bigBassAmountCents} /><MoneyLine label={row.memberPot ? `${title(row.memberPot)} Pot` : "Member Pot"} value={row.memberPotAmountCents} /><MoneyLine label="Insurance" value={row.insuranceAmountCents} /><MoneyLine label="Card Fee" value={row.processingFeeCents} /><p className="mt-1 border-t border-white/10 pt-1 font-black text-white">Total: {money(row.totalPaidCents)}</p></td>
    <td className="px-3 py-4"><AdminStatusBadge tone={row.paymentStatus === "Paid" ? "positive" : "attention"}>{row.paymentStatus}</AdminStatusBadge></td>
    <td className="px-3 py-4 text-neutral-300"><p>{row.registrationPeriod}</p><p className="mt-1 whitespace-nowrap text-[10px] text-neutral-500">{dateTime(row.registeredAt)}</p></td>
    <td className="max-w-sm px-3 py-4"><div className="flex flex-wrap gap-2"><AdminStatusBadge tone={row.needsReview ? "attention" : "positive"}>{row.needsReview ? "Needs Review" : "Confirmed"}</AdminStatusBadge><RegistrationCheckInControl tournamentId={tournamentId} registrationId={row.id} checkedInAt={row.checkedInAt} /></div>{reviews.map((review) => <div key={review.id} className="mt-3 border-t border-white/10 pt-3"><p className="text-xs text-neutral-300"><span className="font-bold text-white">{review.participantName}:</span> {review.reason}</p>{review.status === "review_required" ? <RegistrationReviewResolutionForm reviewId={review.id} anglers={anglers} suggestedAnglerIds={review.suggestedAnglers.map((angler) => angler.id)} /> : <form action={reopenRegistrationReviewAction} className="mt-2 flex gap-2"><input type="hidden" name="reviewId" value={review.id} /><input name="reviewNote" aria-label={`Reason for reopening ${review.participantName}`} placeholder="Reason for reopening" className="min-h-9 min-w-0 flex-1 border border-white/15 bg-[#0B0B0B] px-2 text-xs text-white" /><button className={adminButtonStyles("destructive", "min-h-9 px-2 text-[10px]")}>Reopen</button></form>}</div>)}</td>
  </tr>;
}

function AnglerLine({ label, name, membership }: { label: string; name: string; membership: string }) { return <div className="mb-2 last:mb-0"><p className="font-bold text-white">{label}: {name}</p><p className="mt-0.5 text-[10px] text-neutral-500">{membership}</p></div>; }
function MoneyLine({ label, value }: { label: string; value: number | null }) { return <p className="flex justify-between gap-3"><span>{label}</span><span className="tabular-nums">{money(value)}</span></p>; }
function Metric({ label, value }: { label: string; value: number }) { return <div><dt className="text-[10px] uppercase text-neutral-500">{label}</dt><dd className="mt-1 font-black tabular-nums text-white">{value}</dd></div>; }
function FilterLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) { return <Link href={href} aria-current={active ? "page" : undefined} className={adminButtonStyles(active ? "primary" : "secondary", "min-h-9 px-3")}>{children}</Link>; }
function money(value: number | null) { return value === null ? "Not stored" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100); }
function dateTime(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
function title(value: string) { return value[0].toUpperCase() + value.slice(1); }
function yesNo(value: boolean) { return value ? "Yes" : "No"; }
