export const TOURNAMENT_RECAP_MAX_LENGTH = 300;

export interface WinnerPhotosAndRecapInput {
  champion_photo_url?: string | null;
  big_bass_photo_url?: string | null;
  tournament_recap?: string | null;
  photos_reviewed?: boolean | null;
}

export function getWinnerPhotosAndRecapReadiness(
  tournament: WinnerPhotosAndRecapInput,
) {
  const missing = [
    !tournament.champion_photo_url?.trim() ? "Champion photo missing" : null,
    !tournament.big_bass_photo_url?.trim() ? "Big Bass photo missing" : null,
    !tournament.tournament_recap?.trim() ? "Tournament recap missing" : null,
    !tournament.photos_reviewed
      ? "Winner photo review confirmation missing"
      : null,
  ].filter((item): item is string => Boolean(item));

  return { ready: missing.length === 0, missing };
}

export type TournamentRecapValidation =
  | { ok: true; value: string | null }
  | { ok: false; message: string };

export function validateTournamentRecap(
  input: string,
): TournamentRecapValidation {
  const value = input.trim();

  if (value.length > TOURNAMENT_RECAP_MAX_LENGTH) {
    return {
      ok: false,
      message: `Tournament Recap must be ${TOURNAMENT_RECAP_MAX_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true, value: value || null };
}
