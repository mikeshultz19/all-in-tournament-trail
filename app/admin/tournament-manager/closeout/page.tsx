import { ArrowLeft, Banknote } from "lucide-react";
import Link from "next/link";
import OnSiteCloseoutCalculator from "@/components/admin/OnSiteCloseoutCalculator";
import type { ImportedRow } from "@/components/admin/ImportedResultsReview";
import { listTournamentImportedRows } from "@/lib/tournament-import-evidence";
import { getTournamentInsurancePotResult } from "@/lib/insurance-pot-results";
import { getOnSiteCloseout } from "@/lib/on-site-closeout";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import type { OnSiteCloseoutRecord } from "@/types/on-site-closeout";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

export const dynamic = "force-dynamic";

export default async function OnSiteCloseoutPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string | string[] }>;
}) {
  const params = await searchParams;
  const identifier = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;
  const tournament = identifier ? await getTournamentByIdentifier(identifier) : null;

  let initialCloseout: OnSiteCloseoutRecord | null = null;
  let insuranceResult: TournamentInsurancePotResultRecord | null = null;
  let importedRows: Record<string, ImportedRow[]> = {};

  if (tournament) {
    [initialCloseout, insuranceResult, importedRows] = await Promise.all([
      getOnSiteCloseout(tournament.id),
      getTournamentInsurancePotResult(tournament.id),
      listTournamentImportedRows([tournament.id]),
    ]);
  }

  const initialImportedRows = tournament
    ? (importedRows[tournament.id] ?? []).flatMap((row) =>
        row.original_import_data ? [row.original_import_data] : [],
      )
    : [];

  return (
    <>
      <Link
        href={
          identifier
            ? `/admin/tournament-manager?tournament=${encodeURIComponent(identifier)}&step=4`
            : "/admin/tournament-manager?step=4"
        }
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 hover:text-[#D4A017]"
      >
        <ArrowLeft className="size-4" />
        Back to Calculate Payouts
      </Link>

      <header className="mt-6 border-b border-white/10 pb-6">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-500">
          <Banknote className="size-4" />
          Tournament-Day Operations
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          On-Site Tournament Closeout
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
          Import, reconcile, write, and track tournament-day payout checks. This workflow does not publish Results, AOY, standings, photos, or website content.
        </p>
        {tournament ? (
          <p className="mt-3 font-semibold text-white">
            {tournament.name} — {tournament.lake}
          </p>
        ) : null}
      </header>

      {tournament ? (
        <div className="mt-6">
          <OnSiteCloseoutCalculator
            tournament={tournament}
            initialImportedRows={initialImportedRows}
            initialCloseout={initialCloseout}
            insuranceResult={insuranceResult}
            strongerResetWarning={Boolean(
              initialCloseout?.checks.some((check) => check.status === "delivered"),
            )}
          />
        </div>
      ) : (
        <section className="mt-6 border border-white/10 bg-[#111111] p-6">
          <h2 className="text-xl font-black uppercase">Tournament Not Found</h2>
          <p className="mt-3 text-neutral-400">
            Return to Tournament Operations and select a tournament.
          </p>
        </section>
      )}
    </>
  );
}
