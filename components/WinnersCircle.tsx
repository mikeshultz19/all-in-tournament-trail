import Image from "next/image";
import Link from "next/link";
import { getFeaturedTournament } from "@/data/tournaments";
import { getTournamentResultsBySlug } from "@/data/tournamentResults";

type PotType = "bronze" | "silver" | "gold";

type PotCardProps = {
  type: PotType;
  name?: string;
  weight?: number | null;
};

const potStyles = {
  bronze: {
    title: "Bronze Pot",
    icon: "text-amber-600",
    border: "border-amber-800/80",
  },
  silver: {
    title: "Silver Pot",
    icon: "text-zinc-300",
    border: "border-zinc-600/80",
  },
  gold: {
    title: "Gold Pot",
    icon: "text-yellow-400",
    border: "border-yellow-700/80",
  },
};

function TrophyIcon({ type }: { type: PotType }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`h-14 w-14 ${potStyles[type].icon}`}
      fill="none"
    >
      <path
        d="M28 16h44v18c0 16-9 29-22 35-13-6-22-19-22-35V16Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      <path
        d="M28 24H16v8c0 12 7 21 18 23M72 24h12v8c0 12-7 21-18 23"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M50 69v12M36 84h28"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="m50 27 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PotCard({ type, name, weight }: PotCardProps) {
  const styles = potStyles[type];

  return (
    <article
      className={`flex min-h-[220px] flex-col items-center justify-center border bg-gradient-to-b from-zinc-900/70 to-black px-4 py-5 text-center ${styles.border}`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.14em] ${styles.icon}`}
      >
        {styles.title}
      </p>

      <div className="mt-3">
        <TrophyIcon type={type} />
      </div>

      <h3 className="mt-4 text-base font-black uppercase leading-tight text-white">
        {name || "Coming Soon"}
      </h3>

      <p className="mt-2 text-sm font-bold text-zinc-200">
        {weight === null || weight === undefined ? "—" : `${weight} lbs`}
      </p>

      <p
        className={`mt-2 text-xs font-black uppercase tracking-wide ${styles.icon}`}
      >
        1st Place
      </p>
    </article>
  );
}

export default function WinnersCircle() {
  const tournament = getFeaturedTournament();
  const result = tournament
    ? getTournamentResultsBySlug(tournament.slug)
    : undefined;
  const overallWinner = result?.winner?.team || "Coming Soon";
  const bigBassWinner = result?.bigBass?.team || "Coming Soon";
  const topFiveResults = result?.standings.slice(0, 5) ?? [];

  return (
    <section
      id="results"
      className="border-b border-yellow-900/40 bg-[#050505] px-4 pb-6 pt-4 sm:px-6"
    >
      <div className="mx-auto max-w-[1300px]">
        {/* Section heading */}
        <div className="mb-3 flex items-center gap-4">
          <h2 className="shrink-0 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            Latest Tournament Results
          </h2>

          <div className="h-px flex-1 bg-gradient-to-r from-red-600 via-red-600/40 to-transparent" />
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.05fr_1.5fr_0.65fr_0.65fr_0.65fr_0.85fr]">
          {/* Overall winner */}
          <article className="overflow-hidden border border-yellow-700/70 bg-gradient-to-b from-zinc-900/70 to-black">
            <p className="px-3 py-2 text-center text-xs font-black uppercase tracking-[0.14em] text-yellow-400">
              Overall Winner
            </p>

            <div className="relative aspect-[4/3] w-full overflow-hidden border-y border-yellow-700/40">
              <Image
                src="/images/results/overall-winner.jpg"
                alt={`${overallWinner}, overall tournament winner`}
                fill
                sizes="(max-width: 1280px) 100vw, 250px"
                className="object-cover"
              />
            </div>

            <div className="px-4 py-3 text-center">
              <h3 className="text-lg font-black uppercase leading-tight text-white">
                {overallWinner}
              </h3>

              <p className="mt-1 text-base font-black text-yellow-400">
                {result?.winningWeight === null ||
                result?.winningWeight === undefined
                  ? "—"
                  : `${result.winningWeight} lbs`}
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                {tournament?.lake ?? "Tournament To Be Announced"}
              </p>
            </div>
          </article>

          {/* Top 5 */}
          <article className="flex border border-yellow-700/70 bg-gradient-to-b from-zinc-900/60 to-black">
            <div className="flex w-full flex-col px-4 py-3">
              <h3 className="border-b border-yellow-700/30 pb-2 text-center text-xs font-black uppercase tracking-[0.14em] text-yellow-400">
                Top 5 Overall by Weight
              </h3>

              <div className="mt-3 flex flex-1 flex-col">
                {Array.from({ length: 5 }, (_, index) => {
                  const standing = topFiveResults[index];

                  return (
                  <div
                    key={standing?.rank ?? index + 1}
                    className="grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-white/5 py-3 text-sm"
                  >
                    <span className="font-black text-zinc-300">
                      {standing?.rank ?? index + 1}
                    </span>

                    <span
                      className={`font-semibold ${
                        (standing?.rank ?? index + 1) === 1
                          ? "text-yellow-400"
                          : "text-white"
                      }`}
                    >
                      {standing?.team ?? "Coming Soon"}
                    </span>

                    <span className="font-semibold text-zinc-300">
                      {standing?.weight === null ||
                      standing?.weight === undefined
                        ? "—"
                        : `${standing.weight} lbs`}
                    </span>
                  </div>
                  );
                })}
              </div>

              <Link
                href="/results"
                className="mx-auto mt-4 inline-flex min-h-9 items-center justify-center border border-yellow-600 px-6 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
              >
                View Full Results
                <span className="ml-2" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </article>

          {/* Pot winners */}
          <PotCard
            type="bronze"
            name={result?.payouts[0]?.team}
            weight={result?.payouts[0]?.weight}
          />

          <PotCard
            type="silver"
            name={result?.payouts[1]?.team}
            weight={result?.payouts[1]?.weight}
          />

          <PotCard
            type="gold"
            name={result?.payouts[2]?.team}
            weight={result?.payouts[2]?.weight}
          />

          {/* Big Bass */}
          <article className="overflow-hidden border border-yellow-700/70 bg-gradient-to-b from-zinc-900/70 to-black">
            <p className="px-3 py-2 text-center text-xs font-black uppercase tracking-[0.14em] text-amber-500">
              Big Bass
            </p>

            <div className="relative aspect-[4/3] w-full overflow-hidden border-y border-yellow-700/40">
              <Image
                src="/images/results/big-bass.jpg"
                alt={`${bigBassWinner} holding the tournament big bass`}
                fill
                sizes="(max-width: 1280px) 100vw, 200px"
                className="object-cover"
              />
            </div>

            <div className="px-3 py-3 text-center">
              <h3 className="text-base font-black uppercase leading-tight text-white">
                {bigBassWinner}
              </h3>

              <p className="mt-1 text-sm font-black text-yellow-400">
                {result?.bigBass?.weight === null ||
                result?.bigBass?.weight === undefined
                  ? "—"
                  : `${result.bigBass.weight} lbs`}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
