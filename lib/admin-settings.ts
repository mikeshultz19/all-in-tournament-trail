import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export class AdminSettingsDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AdminSettingsDataError";
  }
}

export async function setActiveMembershipSeason(
  seasonId: string,
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_active_season", {
    p_season_id: seasonId,
  });

  if (error) {
    throw new AdminSettingsDataError(
      error.message.includes("AITT_SEASON_NOT_FOUND")
        ? "The selected season is no longer available."
        : "The active membership season could not be saved.",
      { cause: error },
    );
  }
}
