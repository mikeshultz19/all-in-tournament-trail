import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Season } from "@/types/aoy";

export class SeasonDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SeasonDataError";
  }
}

async function ensureInitialMembershipSeason(): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("ensure_initial_membership_season");

  if (error) {
    throw new SeasonDataError(
      "We could not initialize the membership season.",
      { cause: error },
    );
  }
}

export async function getActiveSeason(): Promise<Season | null> {
  await ensureInitialMembershipSeason();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new SeasonDataError("We could not load the active season.", {
      cause: error,
    });
  }

  return data as Season | null;
}

export async function getSeasonById(id: string): Promise<Season | null> {
  await ensureInitialMembershipSeason();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new SeasonDataError("We could not load the season.", {
      cause: error,
    });
  }

  return data as Season | null;
}

export async function listSeasons(): Promise<Season[]> {
  await ensureInitialMembershipSeason();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("year", { ascending: false });

  if (error) {
    throw new SeasonDataError("We could not load seasons.", {
      cause: error,
    });
  }

  return (data ?? []) as Season[];
}
