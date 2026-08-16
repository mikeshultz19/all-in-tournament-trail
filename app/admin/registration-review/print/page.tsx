import Link from "next/link";

import PrintRegistrationRosterButton from "@/components/admin/PrintRegistrationRosterButton";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentRegistrationRoster, summarizeTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";
import { getTournamentByIdentifier } from "@/lib/tournaments";

export const dynamic = "force-dynamic";

export default async function RegistrationPrintPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  await requireAdminUser();
  const { tournament: identifier } = await searchParams;
  const tournament = identifier ? await getTournamentByIdentifier(identifier) : null;
  if (!tournament) return <p className="p-6 text-white">A valid tournament is required.</p>;
  const rows = await getTournamentRegistrationRoster(tournament.id);
  const summary = summarizeTournamentRegistrationRoster(rows);
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-white text-black print:static print:z-auto print:overflow-visible">
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-7 print:max-w-none print:p-0">
      <div className="mb-6 flex flex-wrap gap-2 print:hidden"><PrintRegistrationRosterButton /><Link href={`/admin/registration-review?tournament=${encodeURIComponent(tournament.id)}`} className={adminButtonStyles("secondary", "border-black/20 text-black hover:text-black")}>Back to Registration Review</Link></div>
      <header className="border-b-2 border-black pb-4"><p className="text-sm font-black tracking-[0.22em]">AITT</p><h1 className="mt-2 text-2xl font-black uppercase">{tournament.name}</h1><p className="mt-1 text-sm font-bold uppercase">Online Registration Roster</p><p className="mt-1 text-sm">{dateOnly(tournament.tournament_date)}</p></header>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-2 border-b border-black/25 py-4 text-sm sm:grid-cols-4"><Metric label="Total Registrations" value={summary.total} /><Metric label="Paid" value={summary.paid} /><Metric label="Needs Review" value={summary.needReview} /><div><dt className="text-[10px] font-bold uppercase text-black/60">Generated</dt><dd className="mt-0.5 text-xs font-semibold">{dateTime(new Date().toISOString())}</dd></div></dl>
      <div className="divide-y divide-black/25">{rows.map((row, index) => <article key={row.id} className="break-inside-avoid py-4 text-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase text-black/55">{index + 1}. {row.registrationType}</p><p className="mt-1 font-black">A1: {row.angler1.displayName}</p>{row.angler2 ? <p className="font-black">A2: {row.angler2.displayName}</p> : null}</div><p className="font-black">{money(row.totalPaidCents)} · {row.paymentStatus}</p></div><div className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><section><h2 className="font-black uppercase">Membership</h2><p>A1: {shortMembership(row.angler1.membership)}</p>{row.angler2 ? <p>A2: {shortMembership(row.angler2.membership)}</p> : null}<p>Team Benefits: {row.memberBenefitsEligible ? "Eligible" : "Not Eligible"}</p></section><section><h2 className="font-black uppercase">Entry</h2><p>{row.entryType} · Big Bass: {yesNo(row.bigBass)}</p><p>Member Pot: {row.memberPot ? title(row.memberPot) : "None"} · Insurance: {yesNo(row.insurance)}</p></section><section><h2 className="font-black uppercase">Registration</h2><p>{row.registrationPeriod} · {dateTime(row.registeredAt)}</p></section><section><h2 className="font-black uppercase">Check-In</h2><p>{row.checkedInAt ? `Checked In · ${dateTime(row.checkedInAt)}` : "Not Checked In"}</p>{row.needsReview ? <p className="font-black">Needs Review</p> : null}</section></div></article>)}</div>
      {!rows.length ? <p className="py-10 text-center text-black/60">No website registrations are available for this tournament.</p> : null}
    </main>
  </div>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div><dt className="text-[10px] font-bold uppercase text-black/60">{label}</dt><dd className="mt-0.5 font-black">{value}</dd></div>; }
function dateTime(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
function dateOnly(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", dateStyle: "long" }).format(new Date(value)); }
function money(value: number | null) { return value === null ? "Total not stored" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100); }
function shortMembership(value: string) { return value === "Current Member" ? "Member" : value === "Purchased Membership / Joining" ? "Joining" : "Non-Member"; }
function title(value: string) { return value[0].toUpperCase() + value.slice(1); }
function yesNo(value: boolean) { return value ? "Yes" : "No"; }
