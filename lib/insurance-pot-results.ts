import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  expectedInsurancePotCents,
  getInsurancePotPlaces,
  splitInsurancePotCents,
  type InsurancePotResult,
  type InsurancePotWinner,
} from "@/lib/insurance-pot";
import { getTournamentRegistrationRoster, type TournamentRegistrationRosterRow } from "@/lib/tournament-registration-roster";
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
  const { data, error } = await createSupabaseServerClient()
    .from("tournament_insurance_pot_results")
    .select("tournament_id,published")
    .in("tournament_id", tournamentIds);
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

export async function calculateTournamentInsurancePotResult(
  tournamentId: string,
): Promise<InsurancePotResult | null> {
  const supabase = createSupabaseServerClient();
  const [standingsResult, roster] = await Promise.all([
    supabase
      .from("tournament_result_entries")
      .select("id,place,team_name,base_payout,registration_id,participation_status")
      .eq("tournament_id", tournamentId)
      .order("place", { ascending: true }),
    getTournamentRegistrationRoster(tournamentId),
  ]);

  if (standingsResult.error) {
    throw new Error("The Insurance Pot could not be calculated from the verified standings.", {
      cause: standingsResult.error,
    });
  }

  const standings = (standingsResult.data ?? []).filter(
    (row) =>
      row.participation_status === "participated" &&
      Number.isInteger(row.place) &&
      row.place > 0,
  ) as Array<{
    id: string;
    place: number;
    team_name: string;
    base_payout: number | null;
    registration_id: string | null;
    participation_status: string;
  }>;

  if (!standings.length) return null;

  const basePayoutPlaces = standings
    .filter((row) => Number(row.base_payout) > 0)
    .map((row) => row.place);
  const basePayoutCutoff = basePayoutPlaces.length ? Math.max(...basePayoutPlaces) : 0;

  const eligibleRegistrations = roster.filter((row) => isInsuranceEligibleRegistration(row));
  const entryCount = eligibleRegistrations.length;
  const totalPotCents = expectedInsurancePotCents(entryCount);
  const placesPaid = getInsurancePotPlaces(entryCount);
  const calculatedPayouts = splitInsurancePotCents(totalPotCents, placesPaid);

  if (entryCount === 0) {
    return {
      entryCount: 0,
      totalPotCents: 0,
      placesPaid: 0,
      winners: [],
      published: false,
    };
  }

  const eligibilityLookup = buildInsuranceEligibilityLookup(eligibleRegistrations);
  const winners: InsurancePotWinner[] = [];

  for (const standing of standings.filter((row) => row.place > basePayoutCutoff)) {
    if (winners.length >= placesPaid) break;
    const match = matchInsuranceEligibleRegistration(standing, eligibilityLookup);
    if (!match) continue;

    winners.push({
      boatNumber: match.boatNumber,
      entryName: standing.team_name,
      finishingPosition: standing.place,
      amountCents: calculatedPayouts[winners.length] ?? 0,
    });
  }

  if (winners.length !== placesPaid) {
    throw new Error(
      `The Insurance Pot calculation could not be completed because only ${winners.length} eligible recipient${winners.length === 1 ? "" : "s"} were found for ${placesPaid} payable place${placesPaid === 1 ? "" : "s"}.`,
    );
  }

  return {
    entryCount,
    totalPotCents,
    placesPaid,
    winners,
    published: false,
  };
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
    winners:
      existing &&
      existing.entry_count === calculation.entryCount &&
      existing.total_pot_cents === calculation.totalPotCents &&
      existing.places_paid === calculation.placesPaid &&
      JSON.stringify(existing.calculated_payouts) === JSON.stringify(calculation.calculatedPayouts)
        ? existing.winners
        : [],
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

function isInsuranceEligibleRegistration(row: TournamentRegistrationRosterRow): boolean {
  if (!row.insurance || row.needsReview) return false;
  if (row.angler1.memberStatus !== "Member") return false;
  if (row.registrationType === "team" && row.angler2?.memberStatus !== "Member") return false;
  return true;
}

function buildInsuranceEligibilityLookup(rows: readonly TournamentRegistrationRosterRow[]) {
  const byId = new Map<string, TournamentRegistrationRosterRow>();
  const byNormalizedName = new Map<string, TournamentRegistrationRosterRow[]>();
  for (const row of rows) {
    byId.set(row.id, row);
    const normalizedName = normalizeInsuranceTeamName(
      [row.angler1.displayName, row.angler2?.displayName].filter(Boolean).join(" / "),
    );
    const existing = byNormalizedName.get(normalizedName) ?? [];
    existing.push(row);
    byNormalizedName.set(normalizedName, existing);
  }
  return { byId, byNormalizedName };
}

function matchInsuranceEligibleRegistration(
  standing: { registration_id: string | null; team_name: string },
  lookup: ReturnType<typeof buildInsuranceEligibilityLookup>,
): TournamentRegistrationRosterRow | null {
  const directMatch = standing.registration_id ? lookup.byId.get(standing.registration_id) : null;
  if (directMatch && isInsuranceEligibleRegistration(directMatch)) return directMatch;

  const normalizedStandingName = normalizeInsuranceTeamName(standing.team_name);
  const candidates = lookup.byNormalizedName.get(normalizedStandingName) ?? [];
  if (candidates.length === 1) return candidates[0];
  return candidates.find((candidate) => isInsuranceEligibleRegistration(candidate)) ?? null;
}

function normalizeInsuranceTeamName(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/\bteam\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .sort()
    .join(" ");
}
