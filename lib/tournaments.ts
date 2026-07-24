import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getTournamentLocalDate,
  tournamentDateTimeToUtc,
} from "@/lib/tournament-time";
import type { Tournament, TournamentUpdate } from "@/types/tournament";

export class TournamentDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TournamentDataError";
  }
}

function dataError(operation: string, error: unknown): TournamentDataError {
  console.error(`Supabase tournament ${operation} failed.`, error);
  return new TournamentDataError(
    `We could not ${operation} tournament information.`,
    { cause: error },
  );
}

export async function getTournaments(): Promise<Tournament[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("tournament_date", { ascending: true });

  if (error) {
    throw dataError("load", error);
  }

  return data;
}

export async function getTournamentById(
  id: string,
): Promise<Tournament | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dataError("load", error);
  }

  return data;
}

export async function getTournamentBySlug(
  slug: string,
): Promise<Tournament | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw dataError("load", error);
  }

  return data;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getTournamentByIdentifier(
  identifier: string,
): Promise<Tournament | null> {
  return UUID_PATTERN.test(identifier)
    ? getTournamentById(identifier)
    : getTournamentBySlug(identifier);
}

export async function getNextUpcomingTournament(
  now = new Date(),
): Promise<Tournament | null> {
  const supabase = createSupabaseServerClient();
  const localDate = getTournamentLocalDate(now);
  const startOfToday = tournamentDateTimeToUtc(
    localDate,
    "00:00",
  ).toISOString();
  const upcoming = await supabase
    .from("tournaments")
    .select("*")
    .neq("status", "Cancelled")
    .gte("tournament_date", startOfToday)
    .order("tournament_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (upcoming.error) {
    throw dataError("load", upcoming.error);
  }

  if (upcoming.data) {
    return upcoming.data;
  }

  const past = await supabase
    .from("tournaments")
    .select("*")
    .lt("tournament_date", startOfToday)
    .order("tournament_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (past.error) {
    throw dataError("load", past.error);
  }

  return past.data;
}

export async function getFeaturedTournament(): Promise<Tournament | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("is_featured", true)
    .eq("show_on_homepage", true)
    .order("tournament_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw dataError("load", error);
  }

  return data;
}

export async function updateTournament(
  id: string,
  values: TournamentUpdate,
): Promise<Tournament> {
  const supabase = createSupabaseServerClient();
  const existing = await getTournamentById(id);

  if (!existing) {
    throw new TournamentDataError("We could not find this tournament.");
  }

  const { data, error } = await supabase
    .from("tournaments")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw dataError("save", error);
  }

  return data;
}
