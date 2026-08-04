"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { resetPayoutCalculationsAction, type ResetPayoutState } from "@/app/admin/tournament-manager/closeout/reset-actions";
import { clearInsurancePotDraftState } from "@/components/admin/insurance-pot-draft-storage";

const initialState: ResetPayoutState = { status: "idle", message: "" };

export default function ResetPayoutCalculations({ tournamentId, strongerWarning }: { tournamentId: string; strongerWarning: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [state, action, pending] = useActionState(resetPayoutCalculationsAction.bind(null, tournamentId), initialState);

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
      clearInsurancePotDraftState(tournamentId);
      window.location.reload();
    }
  }, [state.status, tournamentId]);

  return <div className="border-t border-white/10 pt-6">
    <button type="button" onClick={() => dialogRef.current?.showModal()} className="inline-flex min-h-10 items-center border border-white/15 px-4 text-xs font-black uppercase text-neutral-300 transition hover:border-red-500 hover:text-white">Reset Payout Calculations</button>
    <p className="mt-2 text-xs text-neutral-500">
      Clears generated payout calculations. Your verified WeighFish import is not affected.
    </p>
    {state.message ? <p role={state.status === "error" ? "alert" : "status"} className={`mt-3 text-sm ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}>{state.message}</p> : null}
    <dialog ref={dialogRef} onClose={() => setAcknowledged(false)} className="m-auto w-[min(92vw,36rem)] border border-white/15 bg-[#111111] p-0 text-white backdrop:bg-black/80">
      <form action={action} className="p-6 sm:p-7">
        <h3 className="text-xl font-black uppercase">Reset payout calculations?</h3>
        <p className="mt-4 text-sm text-neutral-300">
          This will clear all payout calculations and Insurance Pot work for this tournament. Your verified WeighFish import will remain available.
        </p>
        {strongerWarning ? <label className="mt-5 flex gap-3 border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"><input type="checkbox" name="acknowledgeProtectedPayouts" value="yes" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-0.5 size-4 accent-amber-500" /><span><strong className="block uppercase">Additional confirmation required</strong>Checks have been marked delivered or results have been published. This reset clears only generated payout work; published results remain unchanged.</span></label> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={pending} onClick={() => dialogRef.current?.close()} className="min-h-11 border border-white/15 px-5 text-xs font-black uppercase text-neutral-300">Cancel</button><button type="submit" disabled={pending || (strongerWarning && !acknowledged)} className="inline-flex min-h-11 items-center justify-center gap-2 bg-red-700 px-5 text-xs font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-50">{pending ? <Loader2 className="size-4 animate-spin" /> : null}Start Over</button></div>
      </form>
    </dialog>
  </div>;
}