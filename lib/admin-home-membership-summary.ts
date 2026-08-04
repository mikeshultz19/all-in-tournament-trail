import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface TournamentMembershipSummary {
  online: number;
  event: number;
  total: number;
}

interface TournamentMembershipRow {
  angler_id: string;
  source: string | null;
  payment_reference: string | null;
}

export function summarizeTournamentMemberships(
  rows: readonly TournamentMembershipRow[],
): TournamentMembershipSummary {
  const onlineMemberIds = new Set<string>();
  const eventMemberIds = new Set<string>();

  for (const row of rows) {
    if (row.source === "online_registration" && row.payment_reference) {
      onlineMemberIds.add(row.angler_id);
    } else if (row.source === "admin") {
      eventMemberIds.add(row.angler_id);
    }
  }

  const allMemberIds = new Set([...onlineMemberIds, ...eventMemberIds]);

  return {
    online: onlineMemberIds.size,
    event: eventMemberIds.size,
    total: allMemberIds.size,
  };
}

export async function getTournamentMembershipSummary(
  tournamentId: string,
): Promise<TournamentMembershipSummary> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("angler_id,source,payment_reference")
    .eq("first_eligible_tournament_id", tournamentId)
    .eq("status", "active");

  if (error) {
    throw new Error("Tournament membership summary could not be loaded.", {
      cause: error,
    });
  }

  return summarizeTournamentMemberships(
    (data ?? []) as TournamentMembershipRow[],
  );
}
