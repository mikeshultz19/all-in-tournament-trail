import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  LatestTournamentResults,
  ResultEntry,
  TournamentResultsRecord,
} from "@/types/results";

export class ResultsDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ResultsDataError";
  }
}

export async function getTournamentResults(
  tournamentId: string,
): Promise<TournamentResultsRecord | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournament_results")
    .select("*")
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  if (error) {
    throw new ResultsDataError("We could not load tournament results.", {
      cause: error,
    });
  }

  return data as TournamentResultsRecord | null;
}

export async function saveTournamentResults(
  tournamentId: string,
  entries: ResultEntry[],
  totalPayout: number,
  bronzePayout: number,
  silverPayout: number,
  goldPayout: number,
  insurancePotPayout: number,
  details?: {
    bigBassPayout?: number | null;
    bigBassAngler?: string | null;
    bigBassTeam?: string | null;
    bigBassWeight?: number | null;
    championImageUrl?: string | null;
    bigBassImageUrl?: string | null;
  },
): Promise<TournamentResultsRecord> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournament_results")
    .upsert(
      {
        tournament_id: tournamentId,
        entries,
        total_payout: totalPayout,
        bronze_payout: bronzePayout,
        silver_payout: silverPayout,
        gold_payout: goldPayout,
        insurance_pot_payout: insurancePotPayout,
        big_bass_payout: details?.bigBassPayout ?? null,
        big_bass_angler: details?.bigBassAngler ?? null,
        big_bass_team: details?.bigBassTeam ?? null,
        big_bass_weight: details?.bigBassWeight ?? null,
        champion_image_url: details?.championImageUrl ?? null,
        big_bass_image_url: details?.bigBassImageUrl ?? null,
        published_at: new Date().toISOString(),
      },
      { onConflict: "tournament_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new ResultsDataError("We could not save tournament results.", {
      cause: error,
    });
  }

  return data as TournamentResultsRecord;
}

export async function deleteTournamentResults(
  tournamentId: string,
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("tournament_results")
    .delete()
    .eq("tournament_id", tournamentId);

  if (error) {
    throw new ResultsDataError("We could not delete tournament results.", {
      cause: error,
    });
  }

  const { error: aoyError } = await supabase
    .from("tournament_aoy_points")
    .delete()
    .eq("tournament_id", tournamentId);

  if (aoyError) {
    throw new ResultsDataError("We could not clear tournament AOY points.", {
      cause: aoyError,
    });
  }
}

export async function getLatestPublishedTournamentResults(): Promise<LatestTournamentResults | null> {
  const supabase = createSupabaseServerClient();
  const [resultsResponse, tournamentsResponse] = await Promise.all([
    supabase.from("tournament_results").select("*"),
    supabase
      .from("tournaments")
      .select("*")
      .order("tournament_date", { ascending: true }),
  ]);

  if (resultsResponse.error || tournamentsResponse.error) {
    throw new ResultsDataError("We could not load published results.", {
      cause: resultsResponse.error ?? tournamentsResponse.error,
    });
  }

  const results = resultsResponse.data as TournamentResultsRecord[];
  const tournaments = tournamentsResponse.data;
  const resultByTournament = new Map(
    results.map((result) => [result.tournament_id, result]),
  );
  const tournament = tournaments
    .filter((item) => resultByTournament.has(item.id))
    .toSorted(
      (a, b) =>
        new Date(b.tournament_date).getTime() -
        new Date(a.tournament_date).getTime(),
    )[0];

  return tournament
    ? {
        tournament,
        results: resultByTournament.get(tournament.id)!,
        tournamentImage: tournament.hero_image_url,
        championImage:
          resultByTournament.get(tournament.id)!.champion_image_url ??
          "/images/results/overall-winner.jpg",
        bigBassImage:
          resultByTournament.get(tournament.id)!.big_bass_image_url ??
          "/images/results/big-bass.jpg",
        completeResultsUrl: "/results",
      }
    : null;
}
