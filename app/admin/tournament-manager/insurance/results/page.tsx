import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import InsuranceResultsPublisher from "@/components/admin/InsuranceResultsPublisher";
import { getTournamentInsurancePotResult } from "@/lib/insurance-pot-results";
import { getTournamentByIdentifier } from "@/lib/tournaments";

export const dynamic = "force-dynamic";
export default async function InsuranceResultsPage({ searchParams }: { searchParams: Promise<{ tournament?: string | string[] }> }) {
  const params = await searchParams;
  const identifier = Array.isArray(params.tournament) ? params.tournament[0] : params.tournament;
  const tournament = identifier ? await getTournamentByIdentifier(identifier) : null;
  const result = tournament ? await getTournamentInsurancePotResult(tournament.id) : null;
  return <>
    <Link href={identifier ? `/admin/tournament-manager/insurance?tournament=${encodeURIComponent(identifier)}` : "/admin"} className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 hover:text-[#D4A017]"><ArrowLeft className="size-4" />Back to Payout Calculator</Link>
    <header className="mt-6 border-b border-white/10 pb-6"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-500"><Upload className="size-4" />Post-Tournament Workflow</p><h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">Insurance Pot Results Publisher</h1>{tournament ? <p className="mt-3 text-sm text-neutral-400">{tournament.name} — {tournament.lake}</p> : null}</header>
    {tournament && result ? <div className="mt-6"><InsuranceResultsPublisher tournament={tournament} insuranceResult={result} /></div> : <section className="mt-6 border border-white/10 bg-[#111111] p-6"><h2 className="text-xl font-black uppercase text-white">Payout Calculation Required</h2><p className="mt-3 text-sm text-neutral-400">Save the tournament-day Insurance Pot payout calculation before entering recipients.</p></section>}
  </>;
}
