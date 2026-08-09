"use client";

import InsuranceReviewForm from "@/components/admin/InsuranceReviewForm";
import InsuranceResultsPublisher from "@/components/admin/InsuranceResultsPublisher";
import ResetInsurancePot from "@/components/admin/ResetInsurancePot";
import { isInsurancePotWinnerDraftComplete } from "@/lib/insurance-pot";
import type { ImportedRow } from "@/components/admin/ImportedResultsReview";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";
import type { Tournament } from "@/types/tournament";
import type { WeighfishResultRow } from "@/lib/weighfishParser";
import { isDisqualified } from "@/lib/disqualification";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";

type Props = {
  tournament: Tournament;
  importedRows: ImportedRow[];
  insuranceResult: TournamentInsurancePotResultRecord | null;
  strongerResetWarning?: boolean;
};

export default function InsurancePotWorkflow({ tournament, importedRows, insuranceResult, strongerResetWarning = false }: Props) {
  const sourceRows: WeighfishResultRow[] = importedRows.flatMap((row) => !isDisqualified(row) && row.original_import_data ? [row.original_import_data] : []);
  const basePayoutPlaces = sourceRows.filter((row) => row.place !== null && row.basePayout > 0).map((row) => row.place as number);
  const basePayoutCutoff = basePayoutPlaces.length ? Math.max(...basePayoutPlaces) : null;
  const standingOptions = sourceRows.flatMap((row) => row.place === null ? [] : [{ entryName: row.entryName, finishingPosition: row.place }]);
  const insuranceComplete = Boolean(insuranceResult) && isInsurancePotWinnerDraftComplete({
    entryCount: insuranceResult!.entry_count,
    totalPotCents: insuranceResult!.total_pot_cents,
    placesPaid: insuranceResult!.places_paid,
    winners: insuranceResult!.winners,
    published: insuranceResult!.published,
  });

  return (
    <div className="max-w-6xl space-y-8">
      <AdminPanel className="p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Insurance Pot</p>
        <h3 className="mt-2 text-xl font-bold text-white">Insurance Pot</h3>
        <ol className="mt-4 space-y-2 text-sm text-neutral-300">
          <li>1. Enter the number of Insurance Pot entries.</li>
          <li>2. Compare the member list with the final standings beginning with the first team outside the money.</li>
          <li>3. Enter the winners manually.</li>
          <li>4. Save Results.</li>
        </ol>
      </AdminPanel>

      <InsuranceReviewForm tournament={tournament} insuranceResult={insuranceResult} />

      {insuranceResult ? (
        <section className="border-t border-white/10 pt-6">
          {insuranceResult.entry_count > 0 ? (
            <div>
              <h3 className="text-lg font-black uppercase text-white">Insurance Pot Winners</h3>
              <div className="mt-4">
                <InsuranceResultsPublisher
                  tournament={tournament}
                  insuranceResult={insuranceResult}
                  basePayoutCutoff={basePayoutCutoff}
                  standingOptions={standingOptions}
                />
              </div>
            </div>
          ) : insuranceComplete ? (
            <p><AdminStatusBadge tone="neutral">No Insurance Pot Entries Saved</AdminStatusBadge></p>
          ) : (
            <p className="text-sm text-neutral-500">Save the Insurance Pot calculation before entering winners.</p>
          )}
        </section>
      ) : null}

      <ResetInsurancePot tournamentId={tournament.id} strongerWarning={strongerResetWarning} />
    </div>
  );
}
