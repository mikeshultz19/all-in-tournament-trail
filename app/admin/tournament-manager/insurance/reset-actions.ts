"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ResetInsurancePotState = { status: "idle" | "success" | "error"; message: string };

export async function resetInsurancePotAction(
  tournamentId: string,
  _state: ResetInsurancePotState,
  formData: FormData,
): Promise<ResetInsurancePotState> {
  await requireAdminUser();
  const supabase = createSupabaseServerClient();

  const { data: record, error } = await supabase
    .from("tournament_insurance_pot_results")
    .select("published")
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  if (error) {
    console.error("Insurance Pot reset evidence query failed.", {
      tournamentId,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return {
      status: "error",
      message: "The Insurance Pot could not be reset because its current state could not be confirmed.",
    };
  }

  if (record?.published) {
    return {
      status: "error",
      message: "Use the protected results correction workflow before resetting published Insurance Pot results.",
    };
  }

  const { error: deleteError } = await supabase
    .from("tournament_insurance_pot_results")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("published", false);

  if (deleteError) {
    console.error("Insurance Pot reset failed.", {
      tournamentId,
      code: deleteError.code,
      message: deleteError.message,
      details: deleteError.details,
      hint: deleteError.hint,
    });
    return { status: "error", message: "The Insurance Pot could not be reset." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/insurance");
  revalidatePath("/admin/tournament-manager/closeout");
  revalidatePath("/admin/tournament-manager/publish");

  return {
    status: "success",
    message: formData.get("acknowledgeReset") === "yes"
      ? "Insurance Pot reset. The verified WeighFish import remains available."
      : "Insurance Pot reset. The verified WeighFish import remains available.",
  };
}
