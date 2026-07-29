"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  rebuildChampionshipQualificationForTournament,
  rebuildSeasonChampionshipQualification,
} from "@/lib/championship-qualification";

export async function rebuildSeasonChampionshipQualificationAction(
  seasonId: string,
) {
  const admin = await requireAdminUser();
  await rebuildSeasonChampionshipQualification(seasonId, admin.id);
  revalidatePath("/admin");
}

export async function rebuildTournamentChampionshipQualificationAction(
  tournamentId: string,
) {
  const admin = await requireAdminUser();
  await rebuildChampionshipQualificationForTournament(
    tournamentId,
    admin.id,
  );
  revalidatePath("/admin");
}
