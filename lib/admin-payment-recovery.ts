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

