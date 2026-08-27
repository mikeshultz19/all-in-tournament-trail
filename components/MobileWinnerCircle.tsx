import { Crown, Fish, Medal, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  displayResultsPayout,
  formatResultsDate,
  isSidePotEntry,
} from "@/lib/result-payouts";
import type { LatestTournamentResults } from "@/types/results";

const sidePots = [
  {
    name: "bronze",
    label: "Bronze Winner",
    textClass: "text-[#CD7F32]",
  },
  {
    name: "silver",
    label: "Silver Winner",
    textClass: "text-[#C0C0C0]",
  },
  {
    name: "gold",
    label: "Gold Winner",
    textClass: "text-[#D4AF37]",
  },
] as const;


export default function MobileWinnerCircle({
  latestResults,
}: {
  latestResults: LatestTournamentResults | null;
}) {
  if (!latestResults) {
    return (
      <section className="rounded-xl border border-white/10 bg-[#111111] p-5 text-center">
        <Trophy
          aria-hidden="true"
          className="mx-auto size-5 text-[#c9aa4a]"
        />

        <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#c9aa4a]">
          Tournament Results
        </p>

        <p className="mt-3 text-sm text-neutral-400">
          Tournament results will appear here after they are published.
        </p>
      </section>
    );
  }

  const finalEntries = latestResults.results.entries
    .filter((entry) => !isSidePotEntry(entry))
    .sort((a, b) => a.place - b.place);

  const champion = finalEntries[0] ?? null;
  const basePayoutWinner =
    finalEntries.find((entry) => (entry.baseWinnings ?? 0) > 0) ?? null;

  const championImage =
    latestResults.championImage ||
    "/images/placeholders/tournament-coming-soon.png";

  const bigBassName =
    latestResults.results.big_bass_angler ?? "—";

  const bigBassWeight =
    latestResults.results.big_bass_weight ?? null;

  return (
    <section className="overflow-hidden rounded-xl border border-[#8f762f]/60 bg-[#101010] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
      <div className="border-b border-white/10 px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Trophy
            aria-hidden="true"
            className="size-4 text-[#c9aa4a]"
          />

          <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#c9aa4a]">
            Winners Circle
          </p>
        </div>

        <p className="mt-2 inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-1 rounded border border-red-500/45 bg-black/45 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          <span>Presented by</span>
          <span className="font-black tracking-[0.03em] text-[#ef4444]">Mad Dawg Graphics</span>
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          {latestResults.tournament.name} · {latestResults.tournament.lake} ·{" "}
          {formatResultsDate(
            latestResults.tournament.tournament_date,
          )}
        </p>
      </div>

      <div className="px-5 py-5">
        <div className="flex items-center justify-center gap-2">
          <Crown
            aria-hidden="true"
            className="size-5 text-[#c9aa4a]"
          />

          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#c9aa4a]">
            Overall Champion
          </p>
        </div>

        <div className="relative mx-auto mt-4 aspect-[3/2] w-full max-w-[340px] overflow-hidden rounded-lg border border-[#8f762f]/60 bg-black">
          <Image
            src={championImage}
            alt={
              champion
                ? `${champion.team}, overall tournament champion`
                : "Tournament champion"
            }
            fill
            sizes="340px"
            className="object-contain"
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-black uppercase text-white">
            {champion?.team ?? "—"}
          </p>

          <p className="mt-1 text-lg font-black tabular-nums text-[#c9aa4a]">
            {champion?.weight === null ||
            champion?.weight === undefined
              ? "—"
              : `${champion.weight.toFixed(2)} lbs`}
          </p>
        </div>

        <div className="mt-5 min-w-0 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex min-w-[56px] shrink-0 items-center justify-center rounded border border-[#c9aa4a]/70 bg-black/70 px-1.5 py-1 text-center text-[0.45rem] font-black uppercase leading-none tracking-[0.06em] text-[#0095DF]">
                Tri-Lakes
              </span>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-neutral-500">
                Tournament Recap
              </p>
            </div>

            <p className="mt-2 break-words text-sm leading-6 text-neutral-300">
              {latestResults.tournamentRecap ??
                "No tournament recap has been added."}
            </p>
          </div>

        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
          <div className="grid min-w-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Trophy
                aria-hidden="true"
                className="size-4 shrink-0 text-[#c9aa4a]"
              />
              <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#c9aa4a]">
                Base Payout
              </span>
            </div>
            <div className="min-w-0 text-right">
              <p className="break-words text-xs font-bold leading-5 text-white">
                {basePayoutWinner?.team ?? "—"}
              </p>
              <p className="mt-0.5 text-xs font-black tabular-nums text-[#c9aa4a]">
                {displayResultsPayout(basePayoutWinner?.baseWinnings)}
              </p>
            </div>
          </div>

          {sidePots.map((sidePot) => {
            const winner = latestResults.results.entries
              .filter(
                (entry) =>
                  isSidePotEntry(entry) &&
                  entry.sidePot === sidePot.name,
              )
              .sort(
                (a, b) =>
                  (a.sidePotPlacement ?? a.place) -
                  (b.sidePotPlacement ?? b.place),
              )[0];

            return (
              <div
                key={sidePot.name}
                className="grid min-w-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Medal
                    aria-hidden="true"
                    className={`size-4 shrink-0 ${sidePot.textClass}`}
                  />

                  <span
                    className={`text-[0.68rem] font-black uppercase tracking-[0.1em] ${sidePot.textClass}`}
                  >
                    {sidePot.label}
                  </span>
                </div>

                <div className="min-w-0 text-right">
                  <p className="break-words text-xs font-bold leading-5 text-white">
                    {winner?.team ?? "—"}
                  </p>
                  <p className="mt-0.5 text-xs font-black tabular-nums text-[#c9aa4a]">
                    {displayResultsPayout(winner?.sidePotPayout)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Big Bass result — mobile text only, no photo */}
          <div className="grid min-w-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-3 border-t border-white/10 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <Fish
                aria-hidden="true"
                className="size-4 shrink-0 text-[#c9aa4a]"
              />

              <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#c9aa4a]">
                Big Bass
              </span>
            </div>

            <div className="min-w-0 text-right">
              <p className="break-words text-xs font-bold leading-5 text-white">
                {bigBassName}
              </p>

              <p className="mt-0.5 text-xs font-black tabular-nums text-[#c9aa4a]">
                {bigBassWeight === null
                  ? "—"
                  : `${bigBassWeight.toFixed(2)} lbs`}
                {latestResults.results.big_bass_payout
                  ? ` · ${displayResultsPayout(latestResults.results.big_bass_payout)}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <Link
          href={latestResults.completeResultsUrl}
          className="mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-md border border-[#8f762f]/70 bg-[#171717] px-5 text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a] transition hover:bg-[#111111] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9aa4a]"
        >
          View Full Results
        </Link>
      </div>
    </section>
  );
}
