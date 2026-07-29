import "server-only";

import {
  createCanonicalCompetitiveRecordKey,
  createCanonicalTeamKey,
} from "@/lib/identity-normalization";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CreateTeamInput,
  CreateCompetitiveRecordInput,
  Team,
  TeamWithMembers,
} from "@/types/aoy";

export class TeamDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TeamDataError";
  }
}

const TEAM_WITH_MEMBERS_SELECT =
  "*, members:team_members(*, angler:anglers(*))";

export async function getTeamById(
  id: string,
): Promise<TeamWithMembers | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_WITH_MEMBERS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new TeamDataError("We could not load the team.", {
      cause: error,
    });
  }

  return data as TeamWithMembers | null;
}

export async function findTeamByAnglers(
  seasonId: string,
  anglerIds: readonly string[],
): Promise<TeamWithMembers | null> {
  const canonicalMemberKey = createCanonicalTeamKey(anglerIds);
  const recordType = anglerIds.length === 1 ? "solo" : "team";
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_WITH_MEMBERS_SELECT)
    .eq("season_id", seasonId)
    .eq("record_type", recordType)
    .eq("canonical_member_key", canonicalMemberKey)
    .maybeSingle();

  if (error) {
    throw new TeamDataError("We could not find the team.", {
      cause: error,
    });
  }

  return data as TeamWithMembers | null;
}

export async function createTeam(
  input: CreateTeamInput,
): Promise<TeamWithMembers> {
  return createCompetitiveRecord({
    ...input,
    recordType: input.anglerIds.length === 1 ? "solo" : "team",
  });
}

export async function createCompetitiveRecord(
  input: CreateCompetitiveRecordInput,
): Promise<TeamWithMembers> {
  createCanonicalCompetitiveRecordKey(
    input.recordType,
    input.anglerIds,
  );
  const supabase = createSupabaseServerClient();

  const { data: team, error: teamError } = await supabase.rpc(
    "create_competitive_record",
    {
      p_season_id: input.seasonId,
      p_record_type: input.recordType,
      p_angler_ids: input.anglerIds,
      p_display_name: input.displayName?.trim() || null,
    },
  );

  if (teamError || !team) {
    throw new TeamDataError(
      "We could not create the Competitive Record.",
      {
        cause: teamError,
      },
    );
  }

  const createdTeam = await getTeamById((team as Team).id);

  if (!createdTeam) {
    throw new TeamDataError("The created team could not be reloaded.");
  }

  return createdTeam;
}

export async function listTeamsForSeason(
  seasonId: string,
): Promise<TeamWithMembers[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_WITH_MEMBERS_SELECT)
    .eq("season_id", seasonId)
    .order("display_name", { ascending: true });

  if (error) {
    throw new TeamDataError("We could not load teams.", {
      cause: error,
    });
  }

  return (data ?? []) as TeamWithMembers[];
}
