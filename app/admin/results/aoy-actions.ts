"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  rebuildAoyForCompetitiveRecord,
  rebuildAoyForTournament,
  rebuildSeasonAoy,
} from "@/lib/aoy-engine";

export async function rebuildSeasonAoyAction(seasonId: string) {
  const admin = await requireAdminUser();
  await rebuildSeasonAoy(seasonId, admin.id);
  revalidatePath("/");
  revalidatePath("/standings");
}

export async function rebuildTournamentAoyAction(tournamentId: string) {
  const admin = await requireAdminUser();
  await rebuildAoyForTournament(tournamentId, admin.id);
  revalidatePath("/");
  revalidatePath("/standings");
}

export async function rebuildCompetitiveRecordAoyAction(
  competitiveRecordId: string,
) {
  const admin = await requireAdminUser();
  await rebuildAoyForCompetitiveRecord(competitiveRecordId, admin.id);
  revalidatePath("/");
  revalidatePath("/standings");
}
