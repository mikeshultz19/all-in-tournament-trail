import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DisasterRecoveryStatus = {
  available: boolean;
  lastSuccessfulAt: string | null;
  pending: number;
  failed: number;
  error: string | null;
};

export async function getDisasterRecoveryStatus(): Promise<DisasterRecoveryStatus> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("registration_disaster_recovery_events")
      .select("status,synchronized_at");
    if (error) throw error;
    const rows = data ?? [];
    return {
      available: true,
      lastSuccessfulAt: rows.map((row) => row.synchronized_at).filter(Boolean).sort().at(-1) ?? null,
      pending: rows.filter((row) => row.status === "pending" || row.status === "processing").length,
      failed: rows.filter((row) => row.status === "failed").length,
      error: null,
    };
  } catch (error) {
    return { available: false, lastSuccessfulAt: null, pending: 0, failed: 0, error: error instanceof Error ? error.message : "DR_STATUS_UNAVAILABLE" };
  }
}
