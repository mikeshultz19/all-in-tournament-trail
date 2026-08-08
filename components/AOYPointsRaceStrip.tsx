import { Trophy } from "lucide-react";
import Link from "next/link";

import styles from "@/components/AOYPointsRaceStrip.module.css";
import type { PublicAoyStanding } from "@/lib/aoy-standings";

type AoyDisplayLeader =
  | PublicAoyStanding
  | {
      place: number;
      angler: string;
      points: null;
      isPlaceholder: true;
    };

function formatOrdinalRank(place: number) {
  const remainder100 = place % 100;
  if (remainder100 >= 11 && remainder100 <= 13) return `${place}TH`;

  switch (place % 10) {
    case 1:
      return `${place}ST`;
    case 2:
      return `${place}ND`;
    case 3:
      return `${place}RD`;
    default:
      return `${place}TH`;
  }
}

export default function AOYPointsRaceStrip({
  standings,
  unavailable = false,
}: {
  standings: readonly PublicAoyStanding[];
  unavailable?: boolean;
}) {
  const leaders = standings.slice(0, 5);
  const placeholderLeaders: AoyDisplayLeader[] = [2, 3, 1, 4, 5].map(
    (place) => ({
      place,
      angler: "—",
      points: null,
      isPlaceholder: true as const,
    }),
  );

  let displayLeaders: AoyDisplayLeader[] = [];

  if (!unavailable) {
    displayLeaders =
      leaders.length === 0
        ? placeholderLeaders
        : leaders.length >= 3
          ? [leaders[1], leaders[2], leaders[0], ...leaders.slice(3)]
          : leaders;
  }

  return (
    <section
      aria-labelledby="homepage-aoy-points-race"
      className="bg-black px-4 sm:px-6"
    >
      <div className="relative mx-auto flex h-[100px] w-full max-w-[1700px] flex-col overflow-hidden bg-transparent px-3 py-2 sm:px-4">
        <div className="relative flex min-h-5 items-center justify-center">
          <h2
            id="homepage-aoy-points-race"
            className="flex items-center justify-center gap-2 whitespace-nowrap text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#c9aa4a] sm:gap-3 sm:text-[0.72rem] sm:tracking-[0.18em]"
          >
            <span aria-hidden="true" className="text-[0.8rem] leading-none">
              ❧
            </span>
            <span>Angler of the Year Race</span>
            <span
              aria-hidden="true"
              className="scale-x-[-1] text-[0.8rem] leading-none"
            >
              ❧
            </span>
          </h2>

          <Link
            href="/standings"
            className="absolute right-0 cursor-pointer whitespace-nowrap text-[0.48rem] font-black uppercase tracking-[0.06em] text-neutral-600 transition hover:text-[#c9aa4a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9aa4a] sm:text-[0.58rem] sm:tracking-[0.09em]"
          >
            View Full Standings →
          </Link>
        </div>

        {unavailable ? (
          <p className="flex flex-1 items-center justify-center text-center text-xs leading-5 text-neutral-500">
            AOY standings are temporarily unavailable.
          </p>
        ) : (
          <div className="mt-1.5 flex-1">
            <ol className={styles.leaders}>
              {displayLeaders.map((standing) => (
                <li
                  key={`${standing.place}-${standing.angler}`}
                  className={styles.leader}
                >
                  <span className="flex items-center justify-center gap-1 whitespace-nowrap text-[0.6rem] font-black text-[#c9aa4a]">
                    {standing.place === 1 ? (
                      <Trophy
                        aria-hidden="true"
                        className="size-3"
                        style={{ color: "#d6b84f" }}
                      />
                    ) : null}
                    {formatOrdinalRank(standing.place)}
                  </span>

                  <span
                    className={`mt-1 max-w-full truncate whitespace-nowrap text-[0.65rem] uppercase tracking-wide text-white min-[1360px]:text-[0.7rem] ${
                      standing.place === 1 ? "font-black" : "font-bold"
                    } ${
                      "isPlaceholder" in standing ? "opacity-80" : ""
                    }`}
                  >
                    {standing.angler}
                  </span>

                  {"isPlaceholder" in standing ? (
                    <span className="mt-1 whitespace-nowrap text-[0.62rem] font-black tabular-nums text-neutral-500">
                      —
                    </span>
                  ) : (
                    <span
                      className={`mt-1 whitespace-nowrap text-[0.62rem] font-black tabular-nums ${
                        standing.place === 1
                          ? "text-[#d6b84f]"
                          : "text-[#c9aa4a]"
                      }`}
                    >
                      {standing.points.toLocaleString()} PTS
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
