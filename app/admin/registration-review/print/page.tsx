import Link from "next/link";

import PrintRegistrationRosterButton from "@/components/admin/PrintRegistrationRosterButton";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentRegistrationRoster, summarizeTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import { formatRosterGeneratedAt } from "@/lib/tournament-time";

export const dynamic = "force-dynamic";

export default async function RegistrationPrintPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  await requireAdminUser();
  const { tournament: identifier } = await searchParams;
  const tournament = identifier ? await getTournamentByIdentifier(identifier) : null;
  if (!tournament) return <p className="p-6 text-white">A valid tournament is required.</p>;
  const rows = await getTournamentRegistrationRoster(tournament.id);
  const summary = summarizeTournamentRegistrationRoster(rows);
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-white text-black print:static print:z-auto print:overflow-visible">
    <style>{`@page { size: landscape; margin: 0.4in; }`}</style>
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-7 print:max-w-none print:p-0">
      <div className="mb-6 flex flex-wrap gap-2 print:hidden"><PrintRegistrationRosterButton /><Link href={`/admin/registration-review?tournament=${encodeURIComponent(tournament.id)}`} className={adminButtonStyles("secondary", "border-black/20 text-black hover:text-black")}>Back to Registration &amp; Check-In</Link></div>
      <header className="border-b-2 border-black pb-4"><p className="text-sm font-black tracking-[0.22em]">AITT</p><h1 className="mt-2 text-2xl font-black uppercase">{tournament.name}</h1><p className="mt-1 text-sm font-bold uppercase">Online Registration Roster</p><p className="mt-1 text-sm">{dateOnly(tournament.tournament_date)}</p></header>
      <dl className="grid grid-cols-3 gap-x-5 border-b border-black/25 py-3 text-sm"><Metric label="Total Registrations" value={summary.total} /><Metric label="Needs Review" value={summary.needReview} /><div><dt className="text-[10px] font-bold uppercase text-black/60">Roster generated</dt><dd className="mt-0.5 text-xs font-semibold">{formatRosterGeneratedAt(new Date())}</dd></div></dl>
      <div className="mt-3 overflow-hidden border border-black/30"><table className="w-full table-fixed text-left text-[10px] leading-4"><thead className="border-b border-black bg-black/5 font-black uppercase"><tr><th className="w-[7%] px-2 py-2">Boat</th><th className="w-[7%] px-2 py-2">Type</th><th className="w-[21%] px-2 py-2">Participants</th><th className="w-[17%] px-2 py-2">Member Status</th><th className="w-[9%] px-2 py-2">Pots</th><th className="w-[8%] px-2 py-2">Insurance</th><th className="w-[8%] px-2 py-2">Big Bass</th><th className="w-[13%] px-2 py-2">Registered</th><th className="w-[10%] px-2 py-2">Check-In / Review</th></tr></thead><tbody className="divide-y divide-black/20">{rows.map((row) => <tr key={row.id} className="break-inside-avoid"><td className="px-2 py-2 text-base font-black">#{row.boatNumber ?? "—"}</td><td className="px-2 py-2 font-bold">{title(row.registrationType)}</td><td className="px-2 py-2 font-bold">{row.angler1.displayName}{row.angler2 ? ` / ${row.angler2.displayName}` : ""}</td><td className="px-2 py-2">{row.angler1.memberStatus}{row.angler2 ? ` / ${row.angler2.memberStatus}` : ""}</td><td className="px-2 py-2 font-bold">{row.memberPot ? title(row.memberPot) : "None"}</td><td className="px-2 py-2">{yesNo(row.insurance)}</td><td className="px-2 py-2">{yesNo(row.bigBass)}</td><td className="px-2 py-2 whitespace-nowrap">{compactDateTime(row.registeredAt)}</td><td className="px-2 py-2 font-bold">{row.needsReview ? "Needs Review" : row.checkedInAt ? "Checked In" : ""}</td></tr>)}</tbody></table></div>
      {!rows.length ? <p className="py-10 text-center text-black/60">No website registrations are available for this tournament.</p> : null}
    </main>
  </div>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div><dt className="text-[10px] font-bold uppercase text-black/60">{label}</dt><dd className="mt-0.5 font-black">{value}</dd></div>; }
function dateOnly(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", dateStyle: "long" }).format(new Date(value)); }
function compactDateTime(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
function title(value: string) { return value[0].toUpperCase() + value.slice(1); }
function yesNo(value: boolean) { return value ? "Yes" : "No"; }
