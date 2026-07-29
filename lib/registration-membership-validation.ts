import "server-only";

import { isMembershipEligibleForTournament } from "@/lib/membership-eligibility";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OnlineRegistrationAngler } from "@/lib/online-registration";
import type { Tournament } from "@/types/tournament";
import type { Membership } from "@/types/aoy";

export async function validateRegistrationMembershipClaims(
  anglers: readonly OnlineRegistrationAngler[],
  tournament: Tournament,
): Promise<string[]> {
  if (!tournament.season_id) {
    return ["The selected tournament is not assigned to a membership season."];
  }

  const supabase = createSupabaseServerClient();
  const errors: string[] = [];

  for (const [index, submitted] of anglers.entries()) {
    const email = submitted.email.trim().toLowerCase();
    const { data: angler, error: anglerError } = await supabase
      .from("anglers")
      .select("id")
      .ilike("email", email)
      .is("merged_into_angler_id", null)
      .maybeSingle();

    const ambiguousIdentity = anglerError?.code === "PGRST116";
    if (anglerError && !ambiguousIdentity) {
      throw new Error("Membership validation failed.", {
        cause: anglerError,
      });
    }

    if (ambiguousIdentity) {
      continue;
    }

    let membership: Membership | null = null;
    let firstEligibleTournamentNumber: number | null = null;

    if (angler) {
      const membershipResult = await supabase
        .from("memberships")
        .select("*")
        .eq("angler_id", angler.id)
        .eq("season_id", tournament.season_id)
        .maybeSingle();

      if (membershipResult.error) {
        throw new Error("Membership validation failed.", {
          cause: membershipResult.error,
        });
      }

      membership = membershipResult.data as Membership | null;

      if (membership?.first_eligible_tournament_id) {
        const tournamentResult = await supabase
          .from("tournaments")
          .select("regular_season_number")
          .eq("id", membership.first_eligible_tournament_id)
          .eq("season_id", tournament.season_id)
          .maybeSingle();

        if (tournamentResult.error) {
          throw new Error("Membership validation failed.", {
            cause: tournamentResult.error,
          });
        }

        firstEligibleTournamentNumber =
          tournamentResult.data?.regular_season_number ?? null;
      }
    }

    const eligible = isMembershipEligibleForTournament(
      membership,
      tournament.season_id,
      tournament.regular_season_number,
      firstEligibleTournamentNumber,
      tournament.event_type,
    );
    const label = `Angler ${index + 1}`;

    if (submitted.membership === "current" && angler && !eligible) {
      errors.push(
        `${label} could not be verified as an eligible current member for this tournament.`,
      );
    }

    if (submitted.membership === "joining" && membership) {
      errors.push(
        membership.status === "active"
          ? `${label} already has a membership for this season. Select current member.`
          : `${label} has an existing inactive membership that requires Admin review.`,
      );
    }
  }

  return errors;
}
