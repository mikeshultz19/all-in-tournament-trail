import "server-only";

import { createCanonicalTeamKey } from "@/lib/identity-normalization";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CreateTeamInput,
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
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_WITH_MEMBERS_SELECT)
    .eq("season_id", seasonId)
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
  const canonicalMemberKey = createCanonicalTeamKey(input.anglerIds);
  const orderedAnglerIds = canonicalMemberKey.split(":");
  const supabase = createSupabaseServerClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      season_id: input.seasonId,
      display_name: input.displayName?.trim() || null,
      canonical_member_key: canonicalMemberKey,
    })
    .select("*")
    .single();

  if (teamError || !team) {
    throw new TeamDataError("We could not create the team.", {
      cause: teamError,
    });
  }

  const { error: membersError } = await supabase
    .from("team_members")
    .insert(
      orderedAnglerIds.map((anglerId, index) => ({
        team_id: (team as Team).id,
        angler_id: anglerId,
        member_position: (index + 1) as 1 | 2,
      })),
    );

  if (membersError) {
    await supabase.from("teams").delete().eq("id", (team as Team).id);
    throw new TeamDataError("We could not add the team members.", {
      cause: membersError,
    });
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
