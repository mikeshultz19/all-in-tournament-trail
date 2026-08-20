"use client";

import { useActionState } from "react";
import { resolveHistoricalMembershipReviewAction, type RegistrationReviewActionState } from "@/app/admin/registration-review/actions";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";

const initialState: RegistrationReviewActionState = { status: "idle", message: "" };

export default function HistoricalMembershipReviewForm({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(resolveHistoricalMembershipReviewAction, initialState);
  return <form action={action} className="mt-2 grid gap-2 border border-amber-400/20 p-2"><input type="hidden" name="reviewId" value={reviewId} /><p className="text-xs text-amber-200">Historical membership selection is unknown. Verify the original registration before resolving.</p><select name="membership" required defaultValue="" className="min-h-10 border border-white/15 bg-[#0B0B0B] px-2 text-xs text-white"><option value="" disabled>Select verified choice</option><option value="current">Current Member</option><option value="joining">Purchased / Joining</option><option value="non-member">Non-Member</option></select><input name="reviewNote" required aria-label="Historical membership evidence" placeholder="Required note / source checked" className="min-h-10 border border-white/15 bg-[#0B0B0B] px-2 text-xs text-white" /><button disabled={pending} className={adminButtonStyles("primary", "min-h-10")}>Confirm Membership Selection</button>{state.status !== "idle" ? <p role={state.status === "error" ? "alert" : "status"} className={`text-xs ${state.status === "error" ? "text-red-300" : "text-emerald-300"}`}>{state.message}</p> : null}</form>;
}
