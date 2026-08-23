import Link from "next/link";

import AdminPanel from "@/components/admin/AdminPanel";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { RegistrationEditControl } from "@/components/admin/RegistrationOperationsControls";
import {
  filterRegistrationHistory,
  listAllRegistrationHistory,
  type AdminRegistrationHistoryRow,
  type RegistrationHistoryContact,
} from "@/lib/admin-registration-history";
import { getTournaments } from "@/lib/tournaments";

export const dynamic = "force-dynamic";
const pageSize = 50;

export default async function AllRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tournament?: string; source?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const tournamentId = params.tournament?.trim() ?? "";
  const source = params.source === "online" || params.source === "walk_up" ? params.source : "all";
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  let loadFailed = false;
  let tournaments: Awaited<ReturnType<typeof getTournaments>> = [];
  let filtered: AdminRegistrationHistoryRow[] = [];
  try {
    const [allRegistrations, allTournaments] = await Promise.all([
      listAllRegistrationHistory(),
      getTournaments(),
    ]);
    tournaments = allTournaments;
    filtered = filterRegistrationHistory(allRegistrations, { search, tournamentId, source });
  } catch (error) {
    console.error("All registrations load failed.", error);
    loadFailed = true;
  }
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function pageHref(nextPage: number) {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (tournamentId) query.set("tournament", tournamentId);
    if (source !== "all") query.set("source", source);
    if (nextPage > 1) query.set("page", String(nextPage));
    return `/admin/registrations?${query.toString()}`;
  }

  return <>
    <header>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Registration History</p>
      <h1 className="mt-2 text-3xl font-black uppercase text-white sm:text-4xl">All Registrations</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">Search registrations across every tournament. This historical lookup does not replace the tournament-specific Registration &amp; Check-In roster.</p>
    </header>

    <AdminPanel className="mt-6 p-4 sm:p-5" aria-label="Registration search and filters">
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_minmax(220px,0.7fr)_180px_auto] xl:items-end">
        <Field label="Search">
          <input name="q" type="search" defaultValue={search} placeholder="Team, angler, email, phone, or boat #" className={inputClass} />
        </Field>
        <Field label="Tournament">
          <select name="tournament" defaultValue={tournamentId} className={inputClass}>
            <option value="">All Tournaments</option>
            {tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.name} — {dateOnly(tournament.tournament_date)}</option>)}
          </select>
        </Field>
        <Field label="Source">
          <select name="source" defaultValue={source} className={inputClass}>
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="walk_up">Walk-Up</option>
          </select>
        </Field>
        <div className="flex gap-2">
          <button className="min-h-11 flex-1 bg-[#D4A017] px-5 text-xs font-black uppercase text-black">Apply</button>
          {(search || tournamentId || source !== "all") ? <Link href="/admin/registrations" className="inline-flex min-h-11 items-center justify-center border border-white/15 px-4 text-xs font-black uppercase text-neutral-300">Clear</Link> : null}
        </div>
      </form>
    </AdminPanel>

    {loadFailed ? <AdminPanel className="mt-6 border-red-500/30 p-8 text-center"><h2 className="font-black uppercase text-white">Registrations unavailable</h2><p className="mt-2 text-sm text-neutral-400">Please try again.</p></AdminPanel> : <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{filtered.length} registration{filtered.length === 1 ? "" : "s"}</p>
        <p className="text-xs text-neutral-500">Page {page} of {pageCount}</p>
      </div>
      <div className="mt-4 grid gap-4">
        {rows.map((row) => <RegistrationHistoryCard key={row.id} row={row} />)}
        {!rows.length ? <AdminPanel className="p-10 text-center"><h2 className="font-black uppercase text-white">No registrations found</h2><p className="mt-2 text-sm text-neutral-400">Clear or adjust the search and filters.</p></AdminPanel> : null}
      </div>
      {filtered.length > pageSize ? <nav className="mt-6 flex justify-end gap-3" aria-label="All registrations pagination">
        <Link href={pageHref(Math.max(1, page - 1))} aria-disabled={page === 1} className={`border border-white/15 px-4 py-2 text-xs font-black uppercase ${page === 1 ? "pointer-events-none text-neutral-600" : "text-white"}`}>Previous</Link>
        <Link href={pageHref(Math.min(pageCount, page + 1))} aria-disabled={page === pageCount} className={`border border-white/15 px-4 py-2 text-xs font-black uppercase ${page === pageCount ? "pointer-events-none text-neutral-600" : "text-white"}`}>Next</Link>
      </nav> : null}
    </>}
  </>;
}

function RegistrationHistoryCard({ row }: { row: AdminRegistrationHistoryRow }) {
  const needsAttention = row.identityReviewStatus === "review_required" || row.reviews.some((review) => review.status === "review_required");
  return <AdminPanel className="p-4 sm:p-5" data-registration-id={row.id}>
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2"><AdminStatusBadge>{row.source === "walk_up" ? "Walk-Up" : "Online"}</AdminStatusBadge><AdminStatusBadge tone={row.status === "cancelled" ? "critical" : "positive"}>{row.status}</AdminStatusBadge>{needsAttention ? <AdminStatusBadge tone="attention">Needs Attention</AdminStatusBadge> : null}</div>
        <h2 className="mt-3 break-words text-lg font-black text-white">{row.angler1Name}{row.angler2Name ? ` / ${row.angler2Name}` : ""}</h2>
        <p className="mt-1 text-sm text-neutral-400">{row.tournamentName} · {dateOnly(row.tournamentDate)}</p>
        <p className="mt-2 font-mono text-[10px] uppercase text-neutral-600">{row.registrationKey}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4 lg:min-w-[480px]">
        <Metric label="Boat" value={row.boatNumber?.toString() ?? "—"} />
        <Metric label="Payment" value={paymentSummary(row)} />
        <Metric label="Amount Paid" value={money(row.priceSnapshot?.totalCents)} />
        <Metric label="Check-In" value={row.checkedInAt ? "Checked In" : "Not Checked In"} />
        <Metric label="Registered" value={dateOnly(row.registeredAt)} />
      </dl>
    </div>
    <details className="mt-4 border-t border-white/10 pt-4">
      <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">View Full Registration</summary>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <DetailSection title="Submitted Participants">
          {row.contacts.length ? row.contacts.map((contact, index) => <address key={`${contact.email}-${index}`} className="mt-3 not-italic text-sm leading-6 text-neutral-300"><strong className="text-white">Angler {index + 1}: {contact.firstName} {contact.lastName}</strong><br />{contact.streetAddress}<br />{contact.city}, {contact.state} {contact.zipCode}<br /><a href={`mailto:${contact.email}`} className="break-all text-[#D4A017]">{contact.email}</a><br /><a href={`tel:${contact.phone}`} className="text-[#D4A017]">{contact.phone}</a><br />Membership selection: {membershipLabel(contact.membership)}</address>) : <p className="text-sm text-neutral-500">No participant contact snapshot is stored for this historical record.</p>}
        </DetailSection>
        <DetailSection title="Registration Selections">
          <DetailLine label="Type" value={row.registrationType} /><DetailLine label="Big Bass" value={yesNo(row.bigBass)} /><DetailLine label="Member Pot" value={row.memberPot ?? "None"} /><DetailLine label="Insurance Pot" value={yesNo(row.insurance)} /><DetailLine label="Source" value={row.source === "walk_up" ? "Walk-Up" : "Online"} /><DetailLine label="Status" value={row.status} /><DetailLine label="Payment Method" value={row.paymentMethod ?? "Not stored"} /><DetailLine label="Payment Reference" value={row.paymentReference ?? "Not recorded"} /><DetailLine label="Online Payment" value={row.onlinePaymentState ?? "Not applicable"} />
        </DetailSection>
        <DetailSection title="Payment &amp; Pricing">
          {(row.priceSnapshot?.lineItems ?? []).map((item, index) => <DetailLine key={`${item.name}-${index}`} label={item.name ?? `Line ${index + 1}`} value={money(item.priceCents)} />)}
          <DetailLine label="Card Processing Fee" value={money(row.priceSnapshot?.cardProcessingFeeCents)} />
          <DetailLine label="Total Paid" value={money(row.priceSnapshot?.totalCents)} />
          <DetailLine label="Square Payment ID" value={row.squarePaymentId ?? "Not recorded"} />
        </DetailSection>
        <DetailSection title="Membership Snapshot">
          {row.membershipSnapshot.length ? row.membershipSnapshot.map((snapshot, index) => <div key={index} className="mt-2 border border-white/10 p-3 text-xs leading-5 text-neutral-300"><p className="font-bold text-white">Angler {index + 1}</p><p>Submitted: {String(snapshot.submittedClassification ?? "Unknown")}</p><p>Resolved: {String(snapshot.resolvedClassification ?? "Unknown")}</p><p>Status: {String(snapshot.status ?? "Not stored")}</p></div>) : <p className="text-sm text-neutral-500">No membership snapshot stored.</p>}
        </DetailSection>
        <DetailSection title="Needs Attention / Review History">
          {row.reviews.length ? row.reviews.map((review) => <div key={review.id} className="mt-2 border border-amber-400/20 p-3 text-xs leading-5 text-neutral-300"><p className="font-bold text-amber-200">{review.participantName} · {review.kind} · {review.status}</p><p>{review.reason}</p>{review.note ? <p>Note: {review.note}</p> : null}{review.resolvedAt ? <p>Resolved: {dateTime(review.resolvedAt)}</p> : null}{review.history.map((item, index) => <p key={index} className="mt-2 border-t border-white/10 pt-2">{item.previousStatus} → {item.newStatus} via {item.method}{item.note ? ` · ${item.note}` : ""} · {dateTime(item.createdAt)}</p>)}</div>) : <p className="text-sm text-neutral-500">No review records.</p>}
        </DetailSection>
      </div>
    </details>
    {row.status === "active" ? <RegistrationEditControl tournamentId={row.tournamentId} registrationId={row.id} boatNumber={row.boatNumber} bigBass={row.bigBass} memberPot={row.memberPot} insurance={row.insurance} checkedIn={Boolean(row.checkedInAt)} walkUp={row.source === "walk_up"} contactSnapshot={row.contacts} /> : null}
  </AdminPanel>;
}

const inputClass = "min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 text-sm text-white outline-none focus:border-[#D4A017]";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-400">{label}<span className="mt-2 block">{children}</span></label>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><dt className="text-[10px] font-black uppercase text-neutral-600">{label}</dt><dd className="mt-1 font-bold text-neutral-200">{value}</dd></div>; }
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) { return <section><h3 className="text-xs font-black uppercase tracking-[0.12em] text-red-400">{title}</h3><div className="mt-2">{children}</div></section>; }
function DetailLine({ label, value }: { label: string; value: string }) { return <p className="mt-1 text-sm text-neutral-300"><span className="font-bold text-white">{label}:</span> {value}</p>; }
function dateOnly(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "short", day: "numeric" }).format(new Date(value)); }
function dateTime(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function paymentSummary(row: AdminRegistrationHistoryRow) { if (row.source === "online") return row.onlinePaymentState === "completed" && row.squarePaymentId ? "Completed" : "Needs Review"; return row.paymentReference ? "Recorded" : "Needs Review"; }
function money(value: number | undefined) { return typeof value === "number" ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100) : "Not stored"; }
function membershipLabel(value: RegistrationHistoryContact["membership"]) { return value === "current" ? "Current Member" : value === "joining" ? "Joining / Purchased" : "Non-Member"; }
function yesNo(value: boolean) { return value ? "Yes" : "No"; }
