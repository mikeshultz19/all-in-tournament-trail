"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  rebuildAoyForCompetitiveRecord,
  rebuildAoyForTournament,
  rebuildSeasonAoy,
} from "@/lib/aoy-engine";
import { rebuildChampionshipQualificationForTournament } from "@/lib/championship-qualification";

export async function rebuildSeasonAoyAction(seasonId: string) {
  const admin = await requireAdminUser();
  await rebuildSeasonAoy(seasonId, admin.id);
  revalidatePath("/");
  revalidatePath("/standings");
}

export async function rebuildTournamentAoyAction(tournamentId: string) {
  const admin = await requireAdminUser();
  const aoy = await rebuildAoyForTournament(tournamentId, admin.id);
  const championship = await rebuildChampionshipQualificationForTournament(
    tournamentId,
    admin.id,
  );
  revalidatePath("/");
  revalidatePath("/standings");
  revalidatePath("/admin/tournament-manager");
  return {
    status: "success" as const,
    message: `AOY calculated for ${aoy.standings.length} eligible Competitive Records. Championship participation refreshed for ${championship.qualifications.length} records.`,
  };
}

export async function rebuildCompetitiveRecordAoyAction(
  competitiveRecordId: string,
) {
  const admin = await requireAdminUser();
  await rebuildAoyForCompetitiveRecord(competitiveRecordId, admin.id);
  revalidatePath("/");
  revalidatePath("/standings");
}
