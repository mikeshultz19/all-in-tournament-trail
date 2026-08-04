import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OnSiteCloseoutRecord } from "@/types/on-site-closeout";

export async function getOnSiteCloseout(tournamentId: string): Promise<OnSiteCloseoutRecord | null> {
  const { data, error } = await createSupabaseServerClient().from("on_site_tournament_closeouts").select("*").eq("tournament_id", tournamentId).maybeSingle();
  if (error) throw new Error("The on-site closeout could not be loaded.", { cause: error });
  return data as OnSiteCloseoutRecord | null;
}

export async function listOnSiteCloseoutStatuses(tournamentIds: string[]): Promise<Record<string, OnSiteCloseoutRecord["status"]>> {
  if (!tournamentIds.length) return {};
  const { data, error } = await createSupabaseServerClient().from("on_site_tournament_closeouts").select("tournament_id,status").in("tournament_id", tournamentIds);
  if (error) throw new Error("On-site closeout statuses could not be loaded.", { cause: error });
  return Object.fromEntries((data ?? []).map((row) => [row.tournament_id, row.status as OnSiteCloseoutRecord["status"]]));
}

export async function listOnSiteCloseouts(tournamentIds: string[]): Promise<Record<string, OnSiteCloseoutRecord>> {
  if (!tournamentIds.length) return {};
  const { data, error } = await createSupabaseServerClient()
    .from("on_site_tournament_closeouts")
    .select("*")
    .in("tournament_id", tournamentIds);
  if (error) throw new Error("On-site closeouts could not be loaded.", { cause: error });
  return Object.fromEntries(
    (data ?? []).map((row) => [row.tournament_id, row as OnSiteCloseoutRecord]),
  );
}
