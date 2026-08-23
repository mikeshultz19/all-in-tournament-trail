"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentById, updateTournament } from "@/lib/tournaments";
import type { TournamentStatus } from "@/types/tournament";

export type RegistrationAvailabilityActionState = { status: "idle" | "success" | "error"; message: string; tournamentStatus?: TournamentStatus };

export async function updateRegistrationAvailabilityAction(tournamentId: string, _previousState: RegistrationAvailabilityActionState, formData: FormData): Promise<RegistrationAvailabilityActionState> {
  await requireAdminUser();
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) return { status: "error", message: "Tournament not found." };
  if (["Cancelled", "Results Published"].includes(tournament.status)) return { status: "error", message: "Registration cannot be changed for this tournament." };

  const intent = String(formData.get("intent") ?? "");
  const nextStatus: TournamentStatus | null = intent === "suspend" ? "Registration Closed" : intent === "resume" ? "Registration Open" : intent === "postpone" ? "Postponed" : null;
  if (!nextStatus) return { status: "error", message: "Choose a valid registration action." };
  try {
    await updateTournament(tournamentId, { status: nextStatus });
  } catch (error) {
    console.error("Tournament registration availability update failed.", error);
    return { status: "error", message: "Registration availability could not be updated." };
  }
  for (const path of ["/", "/register", "/schedule", "/registrations", "/how-it-works", "/admin/tournament-manager"]) revalidatePath(path);
  return { status: "success", tournamentStatus: nextStatus, message: nextStatus === "Registration Open" ? "Online registration resumed." : nextStatus === "Postponed" ? "Tournament marked postponed; new registration is suspended." : "Online registration suspended." };
}
