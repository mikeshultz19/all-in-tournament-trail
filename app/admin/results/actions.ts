"use server";

import { requireAdminUser } from "@/lib/admin-auth";
import type { ResultsFormState } from "@/lib/results-form";

export async function saveResultsAction(
  tournamentId: string,
  _previousState: ResultsFormState,
  formData: FormData,
): Promise<ResultsFormState> {
  await requireAdminUser();

  void tournamentId;
  void formData;
  return {
    status: "error",
    message:
      "Use Tournament Manager to import, review, and publish Official Results.",
    errors: {},
  };
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
  void tournamentId;
  return {
    status: "error",
    message:
      "Official Results cannot be reset here. Use the tournament-scoped reset workflow before publication.",
  };
}
