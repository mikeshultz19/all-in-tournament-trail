import AdminPanel from "@/components/admin/AdminPanel";
import TournamentFundsSummary from "@/components/admin/TournamentFundsSummary";
import { requireAdminUser } from "@/lib/admin-auth";
import { listTournamentCollectionSummaries } from "@/lib/tournament-collection-summary";
import { listTournamentInsurancePotResults } from "@/lib/insurance-pot-results";
import { listOnSiteCloseouts } from "@/lib/on-site-closeout";
import { getActiveSeasonSchedule, getNextUpcomingTournament } from "@/lib/tournaments";
import type { OnSiteCloseoutRecord } from "@/types/on-site-closeout";

export const dynamic = "force-dynamic";

export default async function FinancialSummaryPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  await requireAdminUser();
  const params = await searchParams;
  const [tournaments, currentTournament] = await Promise.all([getActiveSeasonSchedule(), getNextUpcomingTournament()]);
  const selectedTournament = tournaments.find((item) => item.id === params.tournament || item.slug === params.tournament) ?? currentTournament ?? tournaments[0] ?? null;
  if (!selectedTournament) return <p className="border border-white/10 bg-[#111] p-5 text-neutral-400">No active-season tournaments are available.</p>;
  const [insuranceResults, closeouts] = await Promise.all([
    listTournamentInsurancePotResults([selectedTournament.id]),
    listOnSiteCloseouts([selectedTournament.id]),
  ]);
  const summaries = await listTournamentCollectionSummaries([selectedTournament.id], insuranceResults);
  const summary = summaries[selectedTournament.id] ?? null;
  const closeout = closeouts[selectedTournament.id];
  return <>
    <header>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">AITT Admin Center</p>
      <h1 className="mt-2 text-3xl font-black uppercase text-white">Financial Summary</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">Tournament-level collection and payout-funds review using the same authoritative calculation as Registration Review and Tournament Manager.</p>
    </header>
    <form className="mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row">
      <select name="tournament" defaultValue={selectedTournament.id} className="min-h-11 flex-1 border border-white/15 bg-[#111] px-3 text-sm text-white" aria-label="Select tournament">
        {tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.name} — {tournament.lake} — {tournament.tournament_date}</option>)}
      </select>
      <button className="min-h-11 border border-[#D4A017]/60 px-5 text-xs font-black uppercase tracking-[0.1em] text-[#D4A017]">View Summary</button>
    </form>
    <AdminPanel accent className="mt-6 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4A017]">Selected Tournament</p>
      <h2 className="mt-2 text-2xl font-black uppercase text-white">{selectedTournament.name}</h2>
      <p className="mt-2 text-sm text-neutral-400">{selectedTournament.lake} · {selectedTournament.tournament_date}</p>
    </AdminPanel>
    <TournamentFundsSummary summary={summary} className="mt-5" />
    <FinancialCloseoutSummary closeout={closeout} payoutFundsCents={summary?.totalTournamentPayoutFundsCents ?? null} className="mt-5" />
  </>;
}

function FinancialCloseoutSummary({ closeout, payoutFundsCents, className = "" }: { closeout?: OnSiteCloseoutRecord; payoutFundsCents: number | null; className?: string }) {
  if (!closeout) return null;
  const checks = closeout.checks.reduce((sum, check) => sum + check.amountCents, 0);
  return <AdminPanel className={className + " p-5"}>
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4A017]">Existing Closeout</p>
    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
      <Metric label="Calculated Payout Checks" value={money(checks)} />
      <Metric label="Unreconciled Difference" value={payoutFundsCents === null ? "Not available" : money(payoutFundsCents - checks)} />
      <Metric label="Financial Completion" value={closeout.status === "complete" ? "Complete" : "In Progress"} />
    </dl>
    <p className="mt-3 text-xs text-neutral-500">Closeout totals are existing operational records; membership revenue and Square service fees are excluded from payout funds.</p>
  </AdminPanel>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><dt className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</dt><dd className="mt-1 font-black tabular-nums text-white">{value}</dd></div>; }
function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100); }
