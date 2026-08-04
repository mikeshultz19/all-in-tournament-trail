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

export async function listTournamentInsurancePotPublicationStatuses(tournamentIds: string[]): Promise<Record<string, boolean>> {
  if (!tournamentIds.length) return {};
  const { data, error } = await createSupabaseServerClient().from("tournament_insurance_pot_results").select("tournament_id,published").in("tournament_id", tournamentIds);
  if (error) throw new Error("Insurance Pot publication statuses could not be loaded.", { cause: error });
  return Object.fromEntries((data ?? []).map((row) => [row.tournament_id, Boolean(row.published)]));
}

export async function listTournamentInsurancePotResults(tournamentIds: string[]): Promise<Record<string, TournamentInsurancePotResultRecord>> {
  if (!tournamentIds.length) return {};
  const { data, error } = await createSupabaseServerClient()
    .from("tournament_insurance_pot_results")
    .select("*")
    .in("tournament_id", tournamentIds);
  if (error) throw new Error("Insurance Pot results could not be loaded.", { cause: error });
  return Object.fromEntries(
    (data ?? []).map((row) => [row.tournament_id, row as TournamentInsurancePotResultRecord]),
  );
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
    .select("entry_count,total_pot_cents,places_paid,calculated_payouts,winners,published")
    .eq("tournament_id", tournamentId)
    .maybeSingle();
  if (existing?.published) throw new Error("Published Insurance Pot results cannot be changed.");
  const { data, error } = await supabase.from("tournament_insurance_pot_results").upsert({
    tournament_id: tournamentId,
    entry_count: calculation.entryCount,
    total_pot_cents: calculation.totalPotCents,
    places_paid: calculation.placesPaid,
    calculated_payouts: calculation.calculatedPayouts,
    winners: existing && existing.entry_count === calculation.entryCount && existing.total_pot_cents === calculation.totalPotCents && existing.places_paid === calculation.placesPaid && JSON.stringify(existing.calculated_payouts) === JSON.stringify(calculation.calculatedPayouts) ? existing.winners : [],
    published: false,
    published_at: null,
  }, { onConflict: "tournament_id" }).select("*").single();
  if (error) throw new Error("We could not save the Insurance Pot calculation.", { cause: error });
  return data as TournamentInsurancePotResultRecord;
}

export async function saveTournamentInsurancePotWinnerDraft(
  tournamentId: string,
  winners: InsurancePotResult["winners"],
): Promise<TournamentInsurancePotResultRecord> {
  const { data, error } = await createSupabaseServerClient()
    .from("tournament_insurance_pot_results")
    .update({ winners, updated_at: new Date().toISOString() })
    .eq("tournament_id", tournamentId)
    .eq("published", false)
    .select("*")
    .single();
  if (error) throw new Error("We could not save the Insurance Pot winner draft.", { cause: error });
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
