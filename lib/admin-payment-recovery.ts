import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PaymentRecoveryAttempt = {
  id: string;
  tournament_id: string;
  registration_request: unknown;
  quote_snapshot: unknown;
  amount_cents: number;
  state: string;
  square_payment_id: string | null;
  square_status: string | null;
  registration_id: string | null;
  failure_code: string | null;
  failure_message: string | null;
  created_at: string;
  updated_at: string;
};

export async function listPaymentRecoveryAttempts(): Promise<PaymentRecoveryAttempt[]> {
  const { data, error } = await createSupabaseServerClient()
    .from("online_registration_payment_attempts")
    .select("id,tournament_id,registration_request,quote_snapshot,amount_cents,state,square_payment_id,square_status,registration_id,failure_code,failure_message,created_at,updated_at")
    .eq("state", "reconciliation_required")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Payment recovery records could not be loaded.", { cause: error });
  return (data ?? []) as PaymentRecoveryAttempt[];
}

export type ManualCollectionItem = {
  reviewId: string;
  tournamentId: string;
  tournamentName: string;
  registrationNumber: number | null;
  participantName: string;
  registeredAt: string;
  amountCents: number;
  status: "needs_attention" | "confirmed";
};

const MEMBERSHIP_CONFIRMATION_MARKER = "Membership confirmed by";

export async function listManualCollectionItems(): Promise<ManualCollectionItem[]> {
  const { data, error } = await createSupabaseServerClient()
    .from("registration_identity_reviews")
    .select("id,review_status,review_note,review_kind,submitted_membership,original_display_name,registration:tournament_registrations!inner(id,boat_number,registered_at,registration_status,tournament:tournaments!inner(id,name))")
    .eq("review_kind", "membership")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Manual collection records could not be loaded.", { cause: error });

  type Row = {
    id: string;
    review_status: string;
    review_note: string | null;
    submitted_membership: string | null;
    original_display_name: string;
    registration: {
      boat_number: number | null;
      registered_at: string;
      tournament: { id: string; name: string };
    };
  };
  return ((data ?? []) as unknown as Row[])
    .filter((row) => (row.review_status === "review_required" && row.submitted_membership === "current") || row.review_note?.startsWith(MEMBERSHIP_CONFIRMATION_MARKER))
    .map((row) => ({
      reviewId: row.id,
      tournamentId: row.registration.tournament.id,
      tournamentName: row.registration.tournament.name,
      registrationNumber: row.registration.boat_number,
      participantName: row.original_display_name,
      registeredAt: row.registration.registered_at,
      amountCents: 4000,
      status: row.review_note?.startsWith(MEMBERSHIP_CONFIRMATION_MARKER) ? "confirmed" : "needs_attention",
    }));
}
