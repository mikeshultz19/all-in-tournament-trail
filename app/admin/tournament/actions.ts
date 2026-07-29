"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  tournamentFormData,
  tournamentFormToUpdate,
  validateTournamentForm,
  type TournamentFormState,
} from "@/lib/tournament-form";
import { updateTournament } from "@/lib/tournaments";

export async function saveTournamentAction(
  tournamentId: string,
  _previousState: TournamentFormState,
  formData: FormData,
): Promise<TournamentFormState> {
  await requireAdminUser();

  const values = tournamentFormData(formData);
  const errors = validateTournamentForm(values);

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Review the highlighted information before saving.",
      errors,
    };
  }

  try {
    await updateTournament(tournamentId, tournamentFormToUpdate(values));

    revalidatePath("/admin");
    revalidatePath("/admin/tournament");
    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/register");

  } catch (error) {
    console.error("Tournament Information save failed.", error);

    return {
      status: "error",
      message: "Your changes were not saved. Please try again.",
      errors: {},
    };
  }

  redirect(`/admin?tournament=${encodeURIComponent(tournamentId)}`);
}
