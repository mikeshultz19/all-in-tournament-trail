"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  deleteTournamentTemporaryFiles,
  isTournamentResetEnabled,
  resetTournamentActivity,
} from "@/lib/tournament-reset";
import { getTournamentByIdentifier } from "@/lib/tournaments";

export async function resetTournamentAction(formData: FormData) {
  const user = await requireAdminUser();
  if (!isTournamentResetEnabled()) throw new Error("Tournament Reset is disabled.");

  const tournamentId = String(formData.get("tournamentId") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  const acknowledged = formData.get("acknowledged") === "on";
  const tournament = await getTournamentByIdentifier(tournamentId);

  if (!tournament || tournament.id !== tournamentId) throw new Error("Tournament not found.");
  if (
    !acknowledged ||
    confirmation !== `RESET ${tournament.name.toUpperCase()}`
  ) {
    redirect(`/admin/tournament?tournament=${encodeURIComponent(tournamentId)}&resetError=confirmation`);
  }

  const resetResult = await resetTournamentActivity({
    tournamentId,
    adminUserId: user.id,
    adminEmail: user.email ?? "unknown-admin",
  });
  await deleteTournamentTemporaryFiles(tournamentId, resetResult);

  revalidatePath("/");
  revalidatePath("/results");
  revalidatePath("/registrations");
  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament");
  redirect(`/admin/tournament?tournament=${encodeURIComponent(tournamentId)}&reset=1`);
}
