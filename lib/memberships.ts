import "server-only";

import { isMembershipEligibleForTournament } from "@/lib/membership-eligibility";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTournamentById } from "@/lib/tournaments";
import type {
  AdminMemberListRow,
  CreateOrUpdateMembershipInput,
  Membership,
} from "@/types/aoy";

export class MembershipDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MembershipDataError";
  }
}

export async function listMembersForSeason(
  seasonId: string,
  options: {
    search?: string;
    active?: boolean | null;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<{ members: AdminMemberListRow[]; total: number }> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.max(1, Math.min(options.pageSize ?? 25, 10000));
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_list_members", {
    p_season_id: seasonId,
    p_search: options.search?.trim() ?? "",
    p_active: options.active ?? null,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });

  if (error) {
    throw new MembershipDataError("We could not load members.", {
      cause: error,
    });
  }

  const rows = (data ?? []) as unknown as Array<
    AdminMemberListRow & { total_count: number }
  >;
  return {
    members: rows.map((row) => ({
      membership_id: row.membership_id,
      angler_id: row.angler_id,
      first_name: row.first_name,
      last_name: row.last_name,
      display_name: row.display_name,
      email: row.email,
      phone: row.phone,
      is_active: row.is_active,
      membership_status: row.membership_status,
      season_id: row.season_id,
      season_name: row.season_name,
      first_eligible_tournament_id: row.first_eligible_tournament_id,
      first_eligible_tournament_name:
        row.first_eligible_tournament_name,
      effective_date: row.effective_date,
      updated_at: row.updated_at,
    })),
    total: Number(rows[0]?.total_count ?? 0),
  };
}

export async function getMembershipForAnglerAndSeason(
  anglerId: string,
  seasonId: string,
): Promise<Membership | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("angler_id", anglerId)
    .eq("season_id", seasonId)
    .maybeSingle();

  if (error) {
    throw new MembershipDataError("We could not load the membership.", {
      cause: error,
    });
  }

  return data as Membership | null;
}

export async function isAnglerEligibleMember(
  anglerId: string,
  seasonId: string,
  tournamentId: string,
): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const { data: angler, error: anglerError } = await supabase
    .from("anglers")
    .select("is_active")
    .eq("id", anglerId)
    .maybeSingle();

  if (anglerError) {
    throw new MembershipDataError("We could not verify the angler.", {
      cause: anglerError,
    });
  }

  if (!angler?.is_active) {
    return false;
  }

  const membership = await getMembershipForAnglerAndSeason(
    anglerId,
    seasonId,
  );
  const firstEligibleTournament =
    membership?.first_eligible_tournament_id
      ? await getTournamentById(
          membership.first_eligible_tournament_id,
        )
      : null;
  const tournament = await getTournamentById(tournamentId);

  if (!tournament || tournament.season_id !== seasonId) {
    return false;
  }

  return isMembershipEligibleForTournament(
    membership,
    seasonId,
    tournament.regular_season_number,
    firstEligibleTournament?.regular_season_number ?? null,
    tournament.event_type,
  );
}

export async function createOrUpdateMembership(
  input: CreateOrUpdateMembershipInput,
): Promise<Membership> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("memberships")
    .upsert(
      {
        angler_id: input.angler_id,
        season_id: input.season_id,
        status: input.status,
        effective_date: input.effective_date,
        ...(input.first_eligible_tournament_id !== undefined
          ? {
              first_eligible_tournament_id:
                input.first_eligible_tournament_id,
            }
          : {}),
        source: input.source?.trim() || null,
        payment_reference: input.payment_reference?.trim() || null,
        admin_notes: input.admin_notes?.trim() || null,
      },
      { onConflict: "angler_id,season_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new MembershipDataError("We could not save the membership.", {
      cause: error,
    });
  }

  return data as Membership;
}
