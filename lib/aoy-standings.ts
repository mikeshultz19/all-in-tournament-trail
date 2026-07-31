import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PublicAoyStanding {
  place: number;
  angler: string;
  events: number;
  points: number;
}

export type PublicAoyStandingsResult =
  | { status: "available"; standings: PublicAoyStanding[] }
  | { status: "unavailable"; standings: [] };

class AoyStandingsDataAccessError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AoyStandingsDataAccessError";
  }
}

interface TournamentAoyRow {
  tournament_id: string;
  anglers: unknown;
  points: number | string;
}

interface PublicAoyStandingRow {
  rank: number | string;
  display_name: string;
  official_participation_count: number | string;
  total_counted_points: number | string;
}

export function buildAoyStandings(
  rows: readonly TournamentAoyRow[],
): PublicAoyStanding[] {
  return buildFullAoyStandings(rows).slice(0, 5);
}

export function buildFullAoyStandings(
  rows: readonly TournamentAoyRow[],
): PublicAoyStanding[] {
  const scoresByAngler = new Map<string, Map<string, number>>();

  for (const row of rows) {
    if (!Array.isArray(row.anglers)) continue;
    const points = Number(row.points);
    if (!Number.isFinite(points)) continue;

    for (const value of row.anglers) {
      if (typeof value !== "string" || !value.trim()) continue;
      const angler = value.trim();
      const scores =
        scoresByAngler.get(angler) ?? new Map<string, number>();
      scores.set(
        row.tournament_id,
        Math.max(scores.get(row.tournament_id) ?? 0, points),
      );
      scoresByAngler.set(angler, scores);
    }
  }

  return [...scoresByAngler.entries()]
    .map(([angler, scores]) => ({
      angler,
      events: scores.size,
      points: [...scores.values()]
        .sort((left, right) => right - left)
        .slice(0, 5)
        .reduce((total, score) => total + score, 0),
    }))
    .sort(
      (left, right) =>
        right.points - left.points ||
        left.angler.localeCompare(right.angler),
    )
    .map((standing, index) => ({
      place: index + 1,
      ...standing,
    }));
}

export async function getTopPublishedAoyStandings(): Promise<
  PublicAoyStanding[]
> {
  return (await getPublishedAoyStandings()).slice(0, 5);
}

export async function getHomepageAoyStandings(): Promise<
  PublicAoyStandingsResult
> {
  try {
    return {
      status: "available",
      standings: await getTopPublishedAoyStandings(),
    };
  } catch (error) {
    if (!(error instanceof AoyStandingsDataAccessError)) throw error;

    console.error(
      "Homepage AOY standings are unavailable due to a data-access error.",
    );
    return { status: "unavailable", standings: [] };
  }
}

export async function getPublishedAoyStandings(): Promise<
  PublicAoyStanding[]
> {
  const supabase = createSupabaseServerClient();
  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();
  if (seasonError) {
    throw new AoyStandingsDataAccessError(
      "We could not load the active AOY season.",
      {
      cause: seasonError,
      },
    );
  }
  if (!season) return [];

  const { data, error } = await supabase.rpc("get_public_aoy_standings", {
    p_season_id: season.id,
  });

  if (error) {
    throw new AoyStandingsDataAccessError(
      "We could not load published AOY standings.",
      { cause: error },
    );
  }

  return ((data ?? []) as PublicAoyStandingRow[]).map((row) => ({
    place: Number(row.rank),
    angler: row.display_name,
    events: Number(row.official_participation_count),
    points: Number(row.total_counted_points),
  }));
}
