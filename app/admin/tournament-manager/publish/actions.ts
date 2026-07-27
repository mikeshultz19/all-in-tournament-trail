"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { saveTournamentResults } from "@/lib/results";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateTournament } from "@/lib/tournaments";
import type { ResultEntry } from "@/types/results";

export interface PublishTournamentState {
  status: "idle" | "error";
  message: string;
}

type ImportedEntry = {
  place: number | null;
  team_name: string;
  fish_count: number | null;
  total_weight: number | null;
  big_fish_weight: number | null;
  base_payout: number | null;
  bronze_payout: number | null;
  silver_payout: number | null;
  gold_payout: number | null;
  big_bass_place: number | null;
  big_bass_payout: number | null;
  insurance_payout: number | null;
  prize_description: string | null;
  raw_payout_breakdown: string | null;
};

function amount(value: number | null | undefined): number {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

export async function publishTournamentAction(
  _previousState: PublishTournamentState,
  formData: FormData,
): Promise<PublishTournamentState> {
  const tournamentId = String(
    formData.get("tournamentId") ?? "",
  ).trim();

  const identifier = String(
    formData.get("identifier") ?? "",
  ).trim();

  if (!tournamentId || !identifier) {
    return {
      status: "error",
      message: "The selected tournament could not be identified.",
    };
  }

  if (formData.get("confirmed") !== "on") {
    return {
      status: "error",
      message:
        "Confirm that the imported results are correct before publishing.",
    };
  }

  const supabase = createSupabaseServerClient();

  const { data: tournament, error: tournamentError } =
    await supabase
      .from("tournaments")
      .select(
        "id, weighfish_imported, insurance_payout, champion_photo_url, big_bass_photo_url",
      )
      .eq("id", tournamentId)
      .maybeSingle();

  if (tournamentError || !tournament) {
    console.error(
      "Tournament publish load failed.",
      tournamentError,
    );

    return {
      status: "error",
      message: "The tournament could not be loaded.",
    };
  }

  if (!tournament.weighfish_imported) {
    return {
      status: "error",
      message: "Import a WeighFish CSV before publishing.",
    };
  }

  const { data, error: entriesError } = await supabase
    .from("tournament_result_entries")
    .select(
      "place, team_name, fish_count, total_weight, big_fish_weight, base_payout, bronze_payout, silver_payout, gold_payout, big_bass_place, big_bass_payout, insurance_payout, prize_description, raw_payout_breakdown",
    )
    .eq("tournament_id", tournamentId)
    .order("place", {
      ascending: true,
      nullsFirst: false,
    });

  if (entriesError) {
    console.error(
      "Imported results load failed.",
      entriesError,
    );

    return {
      status: "error",
      message: "The imported results could not be loaded.",
    };
  }

  const imported = (data ?? []) as ImportedEntry[];

  if (imported.length === 0) {
    return {
      status: "error",
      message:
        "No imported results were found. Re-import the WeighFish CSV.",
    };
  }

  const finalEntries = imported.map((row) => ({
    kind: "final" as const,
    place: row.place ?? 0,
    team: row.team_name,
    weight: amount(row.total_weight),
    baseWinnings: amount(row.base_payout),
  }));

  const sidePotEntries = (
    [
      ["bronze", "bronze_payout"],
      ["silver", "silver_payout"],
      ["gold", "gold_payout"],
    ] as const
  ).flatMap(([sidePot, payoutColumn]) =>
    imported
      .filter((row) => amount(row[payoutColumn]) > 0)
      .map((row, index) => ({
        kind: "sidePot" as const,
        sidePot,
        sidePotPlacement: index + 1,
        place: index + 1,
        team: row.team_name,
        weight: amount(row.total_weight),
        sidePotWeight: amount(row.total_weight),
        sidePotPayout: amount(row[payoutColumn]),
      })),
  );

  const entries = [
    ...finalEntries,
    ...sidePotEntries,
  ] as ResultEntry[];

  const bronzePayout = imported.reduce(
    (total, row) => total + amount(row.bronze_payout),
    0,
  );

  const silverPayout = imported.reduce(
    (total, row) => total + amount(row.silver_payout),
    0,
  );

  const goldPayout = imported.reduce(
    (total, row) => total + amount(row.gold_payout),
    0,
  );

  const bigBassPayout = imported.reduce(
    (total, row) => total + amount(row.big_bass_payout),
    0,
  );

  const insurancePayout = amount(
    tournament.insurance_payout,
  );

  const totalPayout = imported.reduce(
    (total, row) =>
      total +
      amount(row.base_payout) +
      amount(row.bronze_payout) +
      amount(row.silver_payout) +
      amount(row.gold_payout) +
      amount(row.big_bass_payout),
    insurancePayout,
  );

  const bigBass = [...imported]
    .filter((row) => amount(row.big_fish_weight) > 0)
    .sort(
      (left, right) =>
        amount(right.big_fish_weight) -
        amount(left.big_fish_weight),
    )[0];

  try {
    await saveTournamentResults(
      tournamentId,
      entries,
      totalPayout,
      bronzePayout,
      silverPayout,
      goldPayout,
      insurancePayout,
      {
        bigBassPayout,
        bigBassAngler: bigBass?.team_name ?? null,
        bigBassTeam: bigBass?.team_name ?? null,
        bigBassWeight: bigBass?.big_fish_weight ?? null,
        championImageUrl:
          tournament.champion_photo_url,
        bigBassImageUrl:
          tournament.big_bass_photo_url,
      },
    );

    await updateTournament(tournamentId, {
      status: "Results Published",
    });
  } catch (error) {
    console.error("Tournament publish failed.", error);

    return {
      status: "error",
      message:
        "The results could not be published. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/results");
  revalidatePath(`/results/${identifier}`);
  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/publish");

  redirect(
    `/admin/tournament-manager/publish/success?tournament=${encodeURIComponent(
      identifier,
    )}`,
  );
}