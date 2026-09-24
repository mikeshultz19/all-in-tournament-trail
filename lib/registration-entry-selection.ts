import type { PublicTournamentRecord } from "@/lib/tournament-record-adapter";
import type { TournamentOperationsViewModel } from "@/lib/tournament-view-model";

/** Select an initial tournament from the authoritative active-season schedule. */
export function selectInitialRegistrationSlug(
  tournaments: readonly Pick<PublicTournamentRecord, "slug">[],
  requestedSlug: string | undefined,
  operationsBySlug: Record<string, Pick<TournamentOperationsViewModel, "registrationCanSubmit">>,
): string | undefined {
  if (requestedSlug && tournaments.some((tournament) => tournament.slug === requestedSlug)) {
    return requestedSlug;
  }

  return tournaments.find((tournament) => operationsBySlug[tournament.slug]?.registrationCanSubmit)?.slug
    ?? tournaments[0]?.slug;
}
