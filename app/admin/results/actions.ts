"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  resultsDateToTimestamp,
  resultsFormData,
  validateResultsForm,
  type ResultsFormState,
} from "@/lib/results-form";
import { deleteTournamentResults, saveTournamentResults } from "@/lib/results";
import { updateTournament } from "@/lib/tournaments";

export async function saveResultsAction(
  tournamentId: string,
  _previousState: ResultsFormState,
  formData: FormData,
): Promise<ResultsFormState> {
  await requireAdminUser();

  const values = resultsFormData(formData);
  const errors = validateResultsForm(values);

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Review the highlighted information before saving.",
      errors,
    };
  }

  try {
    await updateTournament(tournamentId, {
      name: values.name,
      lake: values.lake,
      tournament_date: resultsDateToTimestamp(values.tournamentDate),
      status: "Results Published",
    });
    await saveTournamentResults(
      tournamentId,
      values.entries,
      values.totalPayout,
      values.bronzePayout,
      values.silverPayout,
      values.goldPayout,
      values.insurancePotPayout,
      {
        bigBassPayout: values.bigBassPayout,
        bigBassAngler: values.bigBassAngler,
        bigBassTeam: values.bigBassTeam,
        bigBassWeight: values.bigBassWeight,
        championImageUrl: values.championImageUrl || null,
        bigBassImageUrl: values.bigBassImageUrl || null,
      },
    );

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/results");
    revalidatePath("/results");

    return {
      status: "success",
      message: "Changes saved successfully.",
      errors: {},
    };
  } catch (error) {
    console.error("Tournament results save failed.", error);
    return {
      status: "error",
      message: "Your changes were not saved. Please try again.",
      errors: {},
    };
  }
}

export async function resetResultsAction(
  tournamentId: string,
  _previousState: { status: "idle" | "success" | "error"; message: string } = {
    status: "idle",
    message: "",
  },
  _formData?: FormData,
): Promise<{ status: "success" | "error"; message: string }> {
  await requireAdminUser();

  void _previousState;
  void _formData;
  try {
    await deleteTournamentResults(tournamentId);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/results");
    revalidatePath("/results");

    return {
      status: "success",
      message: "Tournament results were reset successfully.",
    };
  } catch (error) {
    console.error("Tournament results reset failed.", error);
    return {
      status: "error",
      message: "We could not reset tournament results. Please try again.",
    };
  }
}
