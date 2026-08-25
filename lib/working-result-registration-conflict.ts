import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ResultIdentity = {
  id: string;
  tournament_id: string;
  place: number | null;
  team_name: string;
};

function resultLabel(result: Pick<ResultIdentity, "place" | "team_name">): string {
  return `Place ${result.place ?? "—"} — ${result.team_name}`;
}

export async function getWorkingResultRegistrationConflict(input: {
  resultEntryId: string;
  registrationId: string;
}): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  const [targetResult, registration] = await Promise.all([
    supabase
      .from("tournament_result_entries")
      .select("id,tournament_id,place,team_name")
      .eq("id", input.resultEntryId)
      .single(),
    supabase
      .from("tournament_registrations")
      .select("id,tournament_id,boat_number")
      .eq("id", input.registrationId)
      .single(),
  ]);

  if (targetResult.error || registration.error) {
    throw new Error("The result and registration assignment could not be verified.");
  }
  if (targetResult.data.tournament_id !== registration.data.tournament_id) {
    throw new Error("The selected registration does not belong to this tournament.");
  }

  const conflict = await supabase
    .from("tournament_result_entries")
    .select("id,tournament_id,place,team_name")
    .eq("tournament_id", targetResult.data.tournament_id)
    .eq("registration_id", input.registrationId)
    .neq("id", input.resultEntryId)
    .order("place", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (conflict.error) {
    throw new Error("Existing result ownership could not be verified.");
  }
  if (!conflict.data) return null;

  const boatNumber = registration.data.boat_number ?? "—";
  return `Registration ${input.registrationId} (Boat #${boatNumber}) is already assigned to ${resultLabel(conflict.data)} and cannot also be assigned to ${resultLabel(targetResult.data)}.`;
}
