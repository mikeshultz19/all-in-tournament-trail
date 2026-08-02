import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { InsurancePotResult } from "@/lib/insurance-pot";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

export async function getTournamentInsurancePotResult(
  tournamentId: string,
  publishedOnly = false,
): Promise<TournamentInsurancePotResultRecord | null> {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("tournament_insurance_pot_results")
    .select("*")
    .eq("tournament_id", tournamentId);
  if (publishedOnly) query = query.eq("published", true);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error("We could not load the Insurance Pot result.", { cause: error });
  return data as TournamentInsurancePotResultRecord | null;
}

export async function saveTournamentInsurancePotResult(
  tournamentId: string,
  result: InsurancePotResult,
): Promise<TournamentInsurancePotResultRecord> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournament_insurance_pot_results")
    .upsert(
      {
        tournament_id: tournamentId,
        entry_count: result.entryCount,
        total_pot_cents: result.totalPotCents,
        places_paid: result.placesPaid,
        calculated_payouts: result.winners.map((winner) => winner.amountCents),
        winners: result.winners,
        published: false,
        published_at: null,
      },
      { onConflict: "tournament_id" },
    )
    .select("*")
    .single();
  if (error) throw new Error("We could not save the Insurance Pot result.", { cause: error });
  return data as TournamentInsurancePotResultRecord;
}

export async function saveTournamentInsurancePotCalculation(
  tournamentId: string,
  calculation: { entryCount: number; totalPotCents: number; placesPaid: number; calculatedPayouts: number[] },
): Promise<TournamentInsurancePotResultRecord> {
  const supabase = createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("tournament_insurance_pot_results")
    .select("winners,published")
    .eq("tournament_id", tournamentId)
    .maybeSingle();
  if (existing?.published) throw new Error("Published Insurance Pot results cannot be changed.");
  const { data, error } = await supabase.from("tournament_insurance_pot_results").upsert({
    tournament_id: tournamentId,
    entry_count: calculation.entryCount,
    total_pot_cents: calculation.totalPotCents,
    places_paid: calculation.placesPaid,
    calculated_payouts: calculation.calculatedPayouts,
    winners: existing?.winners ?? [],
    published: false,
    published_at: null,
  }, { onConflict: "tournament_id" }).select("*").single();
  if (error) throw new Error("We could not save the Insurance Pot calculation.", { cause: error });
  return data as TournamentInsurancePotResultRecord;
}

export async function publishTournamentInsurancePotResult(
  tournamentId: string,
  result: InsurancePotResult,
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error: saveError } = await supabase.from("tournament_insurance_pot_results").update({
    entry_count: result.entryCount,
    total_pot_cents: result.totalPotCents,
    places_paid: result.placesPaid,
    calculated_payouts: result.winners.map((winner) => winner.amountCents),
    winners: result.winners,
  }).eq("tournament_id", tournamentId).eq("published", false);
  if (saveError) throw new Error("We could not save the Insurance Pot recipients.", { cause: saveError });
  const { error } = await supabase.rpc("publish_insurance_pot_results", { p_tournament_id: tournamentId });
  if (error) throw new Error("We could not publish the Insurance Pot results.", { cause: error });
}
