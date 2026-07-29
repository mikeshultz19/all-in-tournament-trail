import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PublicAoyStanding {
  place: number;
  angler: string;
  events: number;
  points: number;
}

interface TournamentAoyRow {
  tournament_id: string;
  anglers: unknown;
  points: number | string;
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

export async function getPublishedAoyStandings(): Promise<
  PublicAoyStanding[]
> {
  const supabase = createSupabaseServerClient();
  const { data: tournaments, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id")
    .eq("status", "Results Published");

  if (tournamentError) {
    throw new Error("We could not load published AOY tournaments.", {
      cause: tournamentError,
    });
  }

  const tournamentIds = (tournaments ?? []).map(({ id }) => id);
  if (tournamentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("tournament_aoy_points")
    .select("tournament_id,anglers,points")
    .in("tournament_id", tournamentIds);

  if (error) {
    throw new Error("We could not load published AOY standings.", {
      cause: error,
    });
  }

  return buildFullAoyStandings((data ?? []) as TournamentAoyRow[]);
}
