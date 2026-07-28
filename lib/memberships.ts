import "server-only";

import { isMembershipEligibleOnDate } from "@/lib/membership-eligibility";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminMemberListRow,
  CreateOrUpdateMembershipInput,
  Membership,
} from "@/types/aoy";

type MemberListQueryRow = {
  id: string;
  status: Membership["status"];
  effective_date: string;
  first_eligible_tournament_id: string | null;
  updated_at: string;
  angler: {
    id: string;
    first_name: string;
    last_name: string;
    display_name: string;
    email: string | null;
    phone: string | null;
  };
  season: {
    id: string;
    name: string;
  };
  first_eligible_tournament: {
    id: string;
    name: string;
  } | null;
};

export class MembershipDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MembershipDataError";
  }
}

export async function listMembersForSeason(
  seasonId: string,
): Promise<AdminMemberListRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("memberships")
    .select(
      "id,status,effective_date,first_eligible_tournament_id,updated_at,angler:anglers!inner(id,first_name,last_name,display_name,email,phone),season:seasons!inner(id,name),first_eligible_tournament:tournaments!memberships_first_eligible_tournament_id_fkey(id,name)",
    )
    .eq("season_id", seasonId);

  if (error) {
    throw new MembershipDataError("We could not load members.", {
      cause: error,
    });
  }

  return ((data ?? []) as unknown as MemberListQueryRow[])
    .map((row) => ({
      membership_id: row.id,
      angler_id: row.angler.id,
      first_name: row.angler.first_name,
      last_name: row.angler.last_name,
      display_name: row.angler.display_name,
      email: row.angler.email,
      phone: row.angler.phone,
      membership_status: row.status,
      season_id: row.season.id,
      season_name: row.season.name,
      first_eligible_tournament_id:
        row.first_eligible_tournament_id,
      first_eligible_tournament_name:
        row.first_eligible_tournament?.name ?? null,
      effective_date: row.effective_date,
      updated_at: row.updated_at,
    }))
    .sort((left, right) =>
      left.display_name.localeCompare(right.display_name),
    );
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
  tournamentDate: string,
): Promise<boolean> {
  const membership = await getMembershipForAnglerAndSeason(
    anglerId,
    seasonId,
  );

  return isMembershipEligibleOnDate(
    membership,
    seasonId,
    tournamentDate,
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
