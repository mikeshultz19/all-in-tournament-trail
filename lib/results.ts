import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildPublishedResultsArchive } from "@/lib/result-archive";
import type {
  LatestTournamentResults,
  ResultEntry,
  TournamentResultsRecord,
} from "@/types/results";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

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
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("result_status")
    .eq("id", tournamentId)
    .maybeSingle();

  if (tournamentError) {
    throw new ResultsDataError(
      "We could not verify the Official Results status.",
      { cause: tournamentError },
    );
  }
  if (tournament?.result_status !== "official") return null;

  const { data, error } = await supabase
    .from("tournament_results")
    .select("*")
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  if (error) {
    throw new ResultsDataError(
      "We could not load tournament results.",
      {
        cause: error,
      },
    );
  }

  return data as TournamentResultsRecord | null;
}

export async function saveTournamentResults(
  tournamentId: string,
  entries: ResultEntry[],
  standardTournamentPayout: number,
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
        // Legacy column name: this stores only the standard tournament payout.
        total_payout: standardTournamentPayout,
        bronze_payout: bronzePayout,
        silver_payout: silverPayout,
        gold_payout: goldPayout,
        insurance_pot_payout: insurancePotPayout,
        big_bass_payout: details?.bigBassPayout ?? null,
        big_bass_angler: details?.bigBassAngler ?? null,
        big_bass_team: details?.bigBassTeam ?? null,
        big_bass_weight: details?.bigBassWeight ?? null,
        champion_image_url:
          details?.championImageUrl ?? null,
        big_bass_image_url:
          details?.bigBassImageUrl ?? null,
        published_at: new Date().toISOString(),
      },
      {
        onConflict: "tournament_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    throw new ResultsDataError(
      "We could not save tournament results.",
      {
        cause: error,
      },
    );
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
    throw new ResultsDataError(
      "We could not delete tournament results.",
      {
        cause: error,
      },
    );
  }

  const { error: aoyError } = await supabase
    .from("tournament_aoy_points")
    .delete()
    .eq("tournament_id", tournamentId);

  if (aoyError) {
    throw new ResultsDataError(
      "We could not clear tournament AOY points.",
      {
        cause: aoyError,
      },
    );
  }
}

export async function getLatestPublishedTournamentResults(): Promise<LatestTournamentResults | null> {
  const [latest] = await getPublishedTournamentResultsArchive();

  return latest
    ? { ...latest, completeResultsUrl: "/results" }
    : null;
}

export async function getPublishedTournamentResultsArchive(): Promise<
  LatestTournamentResults[]
> {
  const supabase = createSupabaseServerClient();

  const { data: publishedTournaments, error: tournamentError } =
    await supabase
      .from("tournaments")
      .select("*,season:seasons!inner(year)")
      .eq("result_status", "official")
      .order("year", {
        referencedTable: "seasons",
        ascending: false,
      })
      .order("regular_season_number", {
        ascending: false,
        nullsFirst: false,
      });

  if (tournamentError) {
    throw new ResultsDataError(
      "We could not load the tournament results archive.",
      {
        cause: tournamentError,
      },
    );
  }

  if (
    !publishedTournaments ||
    publishedTournaments.length === 0
  ) {
    return [];
  }

  const tournamentIds = publishedTournaments.map(
    (tournament) => tournament.id,
  );

  const { data: resultsRecords, error: resultsError } =
    await supabase
      .from("tournament_results")
      .select("*")
      .in("tournament_id", tournamentIds);

  if (resultsError) {
    throw new ResultsDataError(
      "We could not load archived tournament results.",
      {
        cause: resultsError,
      },
    );
  }

  const { data: insurancePotRecords, error: insurancePotError } = await supabase
    .from("tournament_insurance_pot_results")
    .select("*")
    .in("tournament_id", tournamentIds)
    .eq("published", true);

  if (insurancePotError) {
    throw new ResultsDataError("We could not load published Insurance Pot results.", {
      cause: insurancePotError,
    });
  }

  return buildPublishedResultsArchive(
    publishedTournaments,
    (resultsRecords ?? []) as TournamentResultsRecord[],
    (insurancePotRecords ?? []) as TournamentInsurancePotResultRecord[],
  );
}
