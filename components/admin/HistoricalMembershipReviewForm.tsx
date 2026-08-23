"use client";

import { useActionState } from "react";
import { resolveHistoricalMembershipReviewAction, type RegistrationReviewActionState } from "@/app/admin/registration-review/actions";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";

const initialState: RegistrationReviewActionState = { status: "idle", message: "" };

export default function HistoricalMembershipReviewForm({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(resolveHistoricalMembershipReviewAction, initialState);
  return <form action={action} className="mt-2 grid gap-2 border border-amber-400/20 p-3"><input type="hidden" name="reviewId" value={reviewId} /><p className="text-xs font-bold text-amber-200">Membership status needs review</p><p className="text-xs text-neutral-400">Confirm the participant’s membership status after checking the available records.</p><select name="membership" required defaultValue="" className="min-h-10 border border-white/15 bg-[#0B0B0B] px-2 text-xs text-white"><option value="" disabled>Select decision</option><option value="current">Confirm Member</option><option value="joining">Confirm Membership Purchase</option><option value="non-member">Confirm Non-Member</option></select><label className="text-[11px] text-neutral-500">Required review note<input name="reviewNote" required aria-label="Membership review note" placeholder="Record what you verified" className="mt-1 min-h-10 w-full border border-white/15 bg-[#0B0B0B] px-2 text-xs text-white" /></label><button disabled={pending} className={adminButtonStyles("primary", "min-h-10")}>Save Member Status</button>{state.status !== "idle" ? <p role={state.status === "error" ? "alert" : "status"} className={`text-xs ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}>{state.message}</p> : null}</form>;
}
