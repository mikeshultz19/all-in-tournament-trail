import "server-only";

import {
  normalizeAnglerDisplayName,
  normalizeAnglerName,
} from "@/lib/identity-normalization";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AddMemberFormValues } from "@/lib/add-member-form";
import type { MembershipStatus } from "@/types/aoy";

export interface MembershipTournamentOption {
  id: string;
  name: string;
  tournament_date: string;
  regular_season_number: number;
}

export interface AdminMemberDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  membershipStatus: MembershipStatus | null;
  seasonName: string | null;
  firstEligibleTournamentName: string | null;
  effectiveDate: string | null;
}

export class AdminMemberDataError extends Error {
  constructor(
    message: string,
    readonly code:
      | "duplicate_email"
      | "duplicate_phone"
      | "invalid_reference"
      | "save_failed",
    readonly duplicateAnglerId?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AdminMemberDataError";
  }
}

export async function listMembershipTournamentsForSeason(
  seasonId: string,
): Promise<MembershipTournamentOption[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("id,name,tournament_date,regular_season_number")
    .eq("season_id", seasonId)
    .eq("event_type", "regular_season")
    .order("regular_season_number", { ascending: true });

  if (error) {
    throw new AdminMemberDataError(
      "We could not load eligible tournaments.",
      "invalid_reference",
      undefined,
      { cause: error },
    );
  }

  return (data ?? []) as MembershipTournamentOption[];
}

type AdminMemberDetailQueryRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  memberships: Array<{
    status: MembershipStatus;
    effective_date: string;
    updated_at: string;
    season: {
      name: string;
      is_active: boolean;
    };
    first_eligible_tournament: {
      name: string;
    } | null;
  }>;
};

export async function getAdminMemberById(
  memberId: string,
): Promise<AdminMemberDetail | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("anglers")
    .select(
      "id,first_name,last_name,email,phone,is_active,memberships(status,effective_date,updated_at,season:seasons!inner(name,is_active),first_eligible_tournament:tournaments!memberships_first_eligible_tournament_id_fkey(name))",
    )
    .eq("id", memberId)
    .maybeSingle();

  if (error) {
    throw new AdminMemberDataError(
      "We could not load the member.",
      "invalid_reference",
      undefined,
      { cause: error },
    );
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as AdminMemberDetailQueryRow;
  const membership = [...(row.memberships ?? [])].sort(
    (left, right) => {
      if (left.season.is_active !== right.season.is_active) {
        return left.season.is_active ? -1 : 1;
      }

      return right.updated_at.localeCompare(left.updated_at);
    },
  )[0];

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    active: row.is_active,
    membershipStatus: membership?.status ?? null,
    seasonName: membership?.season.name ?? null,
    firstEligibleTournamentName:
      membership?.first_eligible_tournament?.name ?? null,
    effectiveDate: membership?.effective_date ?? null,
  };
}

export async function setAdminMemberActive(
  memberId: string,
  active: boolean,
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_angler_active", {
    p_angler_id: memberId,
    p_is_active: active,
  });
  if (error) throw new AdminMemberDataError("The member status could not be updated.", "save_failed", undefined, { cause: error });
}

export async function deleteAdminMember(
  memberId: string,
): Promise<{ deleted: boolean; historyFound: boolean }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_delete_member", {
    p_angler_id: memberId,
  });
  if (error) throw new AdminMemberDataError("The member could not be deleted.", "save_failed", undefined, { cause: error });
  const row = (data as Array<{ deleted: boolean; history_found: boolean }> | null)?.[0];
  return { deleted: row?.deleted === true, historyFound: row?.history_found === true };
}

function duplicateDetails(message: string): {
  code: "duplicate_email" | "duplicate_phone";
  anglerId: string;
} | null {
  const match = message.match(
    /AITT_DUPLICATE_(EMAIL|PHONE):([0-9a-f-]{36})/i,
  );

  if (!match) {
    return null;
  }

  return {
    code: match[1].toLowerCase() === "email"
      ? "duplicate_email"
      : "duplicate_phone",
    anglerId: match[2],
  };
}

export async function createMemberAtomically(
  values: AddMemberFormValues,
): Promise<{ anglerId: string; membershipId: string }> {
  const firstName = normalizeAnglerDisplayName(values.firstName);
  const lastName = normalizeAnglerDisplayName(values.lastName);
  const displayName = normalizeAnglerDisplayName(
    `${firstName} ${lastName}`,
  );
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_create_member", {
    p_first_name: firstName,
    p_last_name: lastName,
    p_display_name: displayName,
    p_normalized_name: normalizeAnglerName(displayName),
    p_email: values.email || null,
    p_phone: values.phone || null,
    p_season_id: values.seasonId,
    p_status: values.status,
    p_effective_date: values.effectiveDate,
    p_first_eligible_tournament_id:
      values.firstEligibleTournamentId,
  });

  if (error) {
    const duplicate = duplicateDetails(error.message);

    if (duplicate) {
      throw new AdminMemberDataError(
        duplicate.code === "duplicate_email"
          ? "A member with this email already exists."
          : "A member with this phone number already exists.",
        duplicate.code,
        duplicate.anglerId,
        { cause: error },
      );
    }

    const invalidReference =
      error.message.includes("AITT_SEASON_NOT_FOUND") ||
      error.message.includes("AITT_ELIGIBLE_TOURNAMENT_NOT_FOUND");

    throw new AdminMemberDataError(
      invalidReference
        ? "The selected season or first eligible tournament is no longer available."
        : "The member could not be saved. No records were created.",
      invalidReference ? "invalid_reference" : "save_failed",
      undefined,
      { cause: error },
    );
  }

  const created = (data as Array<{
    angler_id: string;
    membership_id: string;
  }> | null)?.[0];

  if (!created) {
    throw new AdminMemberDataError(
      "The member could not be saved. No records were created.",
      "save_failed",
    );
  }

  return {
    anglerId: created.angler_id,
    membershipId: created.membership_id,
  };
}
