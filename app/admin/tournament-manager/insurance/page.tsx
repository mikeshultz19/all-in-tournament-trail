import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

import InsurancePotWorkflow from "@/components/admin/InsurancePotWorkflow";
import type { ImportedRow } from "@/components/admin/ImportedResultsReview";
import { getTournamentInsurancePotResult } from "@/lib/insurance-pot-results";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface InsuranceReviewPageProps {
  searchParams: Promise<{ tournament?: string | string[] }>;
}

export const dynamic = "force-dynamic";

export default async function InsuranceReviewPage({
  searchParams,
}: InsuranceReviewPageProps) {
  const params = await searchParams;

  const identifier = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;

  const tournament = identifier
    ? await getTournamentByIdentifier(identifier)
    : null;
  const { data: importedRows } = tournament
    ? await createSupabaseServerClient()
        .from("tournament_result_entries")
        .select("id,place,team_name,total_weight,big_fish_weight,bronze_payout,silver_payout,gold_payout,original_import_data")
        .eq("tournament_id", tournament.id)
        .order("place")
    : { data: [] };
  const typedImportedRows = (importedRows ?? []) as ImportedRow[];
  const insuranceResult = tournament
    ? await getTournamentInsurancePotResult(tournament.id)
    : null;

  return (
    <>
      <Link
        href={
          identifier
            ? `/admin/tournament-manager?tournament=${encodeURIComponent(identifier)}&step=3`
            : "/admin/tournament-manager?step=3"
        }
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Insurance Pot
      </Link>

      <header className="mt-6 border-b border-white/10 pb-6">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-500">
          <ShieldCheck aria-hidden="true" className="size-4" />
          Tournament-Day Tool
        </p>

        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Insurance Pot Payout Calculator
        </h1>

        {tournament && (
          <p className="mt-3 text-sm text-neutral-400">
            {tournament.name} — {tournament.lake}
          </p>
        )}
      </header>

      {tournament ? (
        <div className="mt-6">
          <InsurancePotWorkflow
            key={tournament.id}
            tournament={tournament}
            importedRows={typedImportedRows}
            insuranceResult={insuranceResult}
          />
        </div>
      ) : (
        <section className="mt-6 border border-white/10 bg-[#111111] p-6">
          <h2 className="text-xl font-black uppercase text-white">
            Tournament Not Found
          </h2>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Return to the Tournament Manager and select a tournament.
          </p>
        </section>
      )}
    </>
  );
}
