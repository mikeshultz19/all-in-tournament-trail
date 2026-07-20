export interface AOYStanding {
  rank: number;
  team: string;
  anglers: readonly string[];
  eventsFished: number;
  points: number;
}

export const aoyStandings: readonly AOYStanding[] = [
  {
    rank: 1,
    team: "Smith / Jones",
    anglers: ["Smith", "Jones"],
    eventsFished: 7,
    points: 1186,
  },
  {
    rank: 2,
    team: "Davis / Lee",
    anglers: ["Davis", "Lee"],
    eventsFished: 7,
    points: 1172,
  },
  {
    rank: 3,
    team: "Brown",
    anglers: ["Brown"],
    eventsFished: 6,
    points: 1140,
  },
];
