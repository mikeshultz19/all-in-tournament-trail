export interface TournamentStanding {
  rank: number;
  team: string;
  anglers: readonly string[];
  weight: number | null;
  points: number | null;
  payout: number | null;
}

export interface TournamentAward {
  team: string;
  anglers: readonly string[];
  weight: number | null;
  payout: number | null;
}

export interface TournamentResult {
  tournamentSlug: string;
  standings: readonly TournamentStanding[];
  winner: TournamentStanding | null;
  winningWeight: number | null;
  bigBass: TournamentAward | null;
  payouts: readonly TournamentAward[];
  published: boolean;
}

export const tournamentResults: readonly TournamentResult[] = [
  {
    tournamentSlug: "eagle-mountain-2026",
    standings: [],
    winner: null,
    winningWeight: null,
    bigBass: null,
    payouts: [],
    published: false,
  },
];

export function getTournamentResultsBySlug(
  slug: string,
): TournamentResult | undefined {
  return tournamentResults.find((result) => result.tournamentSlug === slug);
}
