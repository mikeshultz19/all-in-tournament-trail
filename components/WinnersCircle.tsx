import {
  BadgeDollarSign,
  Crown,
  Fish,
  Medal,
  Shield,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import styles from "@/components/WinnersCircle.module.css";
import {
  calculateResultPayouts,
  displayResultsPayout,
  formatResultsDate,
  isSidePotEntry,
} from "@/lib/result-payouts";
import type {
  LatestTournamentResults,
  ResultEntry,
} from "@/types/results";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
type SidePotName = "bronze" | "silver" | "gold";

const SIDE_POT_ORDER: SidePotName[] = ["bronze", "silver", "gold"];
const RESULTS_COMING_SOON_IMAGE =
  "/images/placeholders/tournament-coming-soon.png";

const SIDE_POT_THEMES: Record<
  SidePotName,
  { label: string; color: string; divider: string }
> = {
  bronze: {
    label: "BRONZE SIDE POT WINNER",
    color: "#CD7F32",
    divider: "rgba(205,127,50,0.45)",
  },
  silver: {
    label: "SILVER SIDE POT WINNER",
    color: "#C0C0C0",
    divider: "rgba(192,192,192,0.40)",
  },
  gold: {
    label: "GOLD SIDE POT WINNER",
    color: "#D4AF37",
    divider: "rgba(212,175,55,0.45)",
  },
};

interface DisplayStandingEntry {
  placeLabel: string;
  team: string;
  weight: number | null;
  baseWinnings: number | null;
}

interface DisplaySidePotWinner {
  placeLabel: string;
  team: string;
  weight: number | null;
  sidePotPayout: number | null;
}

function formatOrdinal(value: number): string {
  const absValue = Math.abs(value);
  const suffix =
    absValue % 100 >= 11 && absValue % 100 <= 13
      ? "th"
      : absValue % 10 === 1
        ? "st"
        : absValue % 10 === 2
          ? "nd"
          : absValue % 10 === 3
            ? "rd"
            : "th";

  return `${value}${suffix}`;
}

function isFinalEntry(entry: ResultEntry): boolean {
  return !isSidePotEntry(entry);
}

function SectionHeading({
  title,
  icon: IconComponent,
  centered = false,
}: {
  title: string;
  icon: Icon;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <div
        className={`mt-1 flex items-center gap-2 ${
          centered ? "justify-center" : ""
        }`}
      >
        <IconComponent
          aria-hidden="true"
          className="size-4 shrink-0 text-[#c9aa4a]"
        />
        <h3 className="text-[0.98rem] font-black uppercase tracking-[0.14em] text-[#c9aa4a] sm:text-[1.05rem]">
          {title}
        </h3>
      </div>
    </div>
  );
}

function TournamentHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="relative overflow-visible border-b border-[#8f762f]/60 bg-[#171717] px-4 pb-5 pt-8 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:px-5">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[44%] bg-[linear-gradient(90deg,rgba(90,16,32,0.46)_0%,rgba(90,16,32,0.14)_55%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-[#c9aa4a] to-transparent"
      />
      <div
        aria-hidden="true"
        className={`${styles.headerBadge} flex size-10 items-center justify-center rounded-full border border-[#8f762f]/70 bg-[#111111] text-[#c9aa4a] shadow-[0_8px_20px_rgba(0,0,0,0.45)]`}
      >
        <Trophy aria-hidden="true" className="size-4" />
      </div>

      <div className="relative flex min-h-12 items-center justify-center text-center">
        <div>
          <h2 className={styles.bannerTitle}>{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-neutral-500 sm:text-[0.8rem]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function MediaCard({
  image,
  alt,
  name,
  weight,
  centered = true,
  priority = false,
  placeholder = false,
}: {
  image: string;
  alt: string;
  name: string;
  weight: number | null;
  centered?: boolean;
  priority?: boolean;
  placeholder?: boolean;
}) {
  return (
    <article className={`w-full ${centered ? "text-center" : ""}`}>
      <div
        className={`${styles.resultImageFrame} mt-3 rounded-[4px] border border-[#8f762f]/70 shadow-[0_10px_24px_rgba(0,0,0,0.38)]`}
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={placeholder ? styles.resultPlaceholderImage : styles.resultImage}
          priority={priority}
        />
      </div>
      <div className="pt-3">
        <p className="text-[0.92rem] font-black uppercase tracking-[0.05em] text-[#F4EEE7] sm:text-[1rem]">
          {name}
        </p>
        <p className="mt-0.5 text-[0.92rem] font-black tabular-nums text-[#c9aa4a] sm:text-[1rem]">
          {weight === null ? "—" : `${weight.toFixed(2)} lbs`}
        </p>
      </div>
    </article>
  );
}

function StandingRow({ entry }: { entry: DisplayStandingEntry }) {
  const placeTone =
    entry.placeLabel === "—" ? "text-[#F4EEE7]" : "text-[#c9aa4a]";

  return (
    <li className="border-b border-white/10 py-1 last:border-b-0">
      <div className={`${styles.finalStandingsGrid} items-center gap-2.5`}>
        <span
          className={`text-left text-[0.56rem] font-black uppercase leading-4 tracking-[0.08em] ${placeTone}`}
        >
          {entry.placeLabel}
        </span>
        <span className="min-w-0 whitespace-nowrap text-left text-[0.65rem] font-semibold leading-4 text-[#F4EEE7]">
          {entry.team}
        </span>
        <span className="whitespace-nowrap text-right text-[0.65rem] font-semibold leading-4 tabular-nums text-neutral-500">
          {entry.weight === null ? "—" : `${entry.weight.toFixed(2)} lbs`}
        </span>
        <span className="whitespace-nowrap text-right text-[0.65rem] font-black leading-4 tabular-nums text-[#c9aa4a]">
          {displayResultsPayout(entry.baseWinnings)}
        </span>
      </div>
    </li>
  );
}

function SidePotRow({ winner }: { winner: DisplaySidePotWinner }) {
  return (
    <li className="border-b border-white/10 py-1.5 last:border-b-0">
      <div className={styles.sidePotGrid}>
        <span className="text-[0.62rem] font-black uppercase leading-4 tracking-[0.08em] text-neutral-500">
          {winner.placeLabel}
        </span>
        <span className="min-w-0 whitespace-nowrap text-left text-[0.65rem] font-semibold leading-4 text-[#F4EEE7]">
          {winner.team}
        </span>
        <span className="whitespace-nowrap text-right text-[0.65rem] font-semibold leading-4 tabular-nums text-neutral-500">
          {winner.weight === null ? "—" : `${winner.weight.toFixed(2)} lbs`}
        </span>
        <span className="whitespace-nowrap text-right text-[0.65rem] font-black leading-4 tabular-nums text-[#c9aa4a]">
          {displayResultsPayout(winner.sidePotPayout)}
        </span>
      </div>
    </li>
  );
}

function SidePotSection({
  sidePot,
  winners,
}: {
  sidePot: SidePotName;
  winners: DisplaySidePotWinner[];
}) {
  const theme = SIDE_POT_THEMES[sidePot];

  return (
    <section className="border-t pt-3" style={{ borderTopColor: theme.divider }}>
      <div className="flex items-center gap-2">
        <Medal
          aria-hidden="true"
          className="size-4 shrink-0"
          style={{ color: theme.color }}
        />
        <h4
          className="text-[0.72rem] font-black uppercase tracking-[0.12em]"
          style={{ color: theme.color }}
        >
          {theme.label}
        </h4>
      </div>

      <div className="mt-2">
        <div
          className={`${styles.sidePotGrid} border-b border-white/10 pb-2 text-[0.65rem] font-black uppercase leading-4 tracking-[0.09em] text-neutral-500`}
        >
          <span>Place</span>
          <span>Team</span>
          <span className="text-right">Weight</span>
          <span className="text-right">Won</span>
        </div>
        <ol className="mt-1">
          {winners.map((winner) => (
            <SidePotRow
              key={`${sidePot}-${winner.placeLabel}-${winner.team}`}
              winner={winner}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-white/10 py-1.5 last:border-b-0 ${
        emphasis ? "border-[#c9aa4a]" : ""
      }`}
    >
      <span
        className={`text-[0.65rem] font-black uppercase leading-4 tracking-[0.1em] ${
          emphasis ? "text-[#c9aa4a]" : "text-[#F4EEE7]"
        }`}
      >
        {label}
      </span>
      <span
        className={`whitespace-nowrap text-right font-black tabular-nums ${
          emphasis
            ? "text-[1.05rem] text-[#c9aa4a]"
            : "text-[0.78rem] text-[#F4EEE7]"
        }`}
      >
        {displayResultsPayout(value)}
      </span>
    </div>
  );
}

function AoyLeaderPlaceholder() {
  return (
    <section
      aria-labelledby="aoy-points-leader-heading"
      className="mt-21 border border-[#8f762f]/60 bg-[#111111] p-3 text-center"
    >
      <div className="flex items-center justify-center gap-2">
        <Trophy
          aria-hidden="true"
          className="size-4 shrink-0 text-[#c9aa4a]"
        />
        <h4
          id="aoy-points-leader-heading"
          className="text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#c9aa4a]"
        >
          AOY POINTS LEADER
        </h4>
      </div>
      <p className="mt-4 text-2xl font-black uppercase text-white">—</p>
      <p className="mt-1 text-[0.92rem] font-black tabular-nums text-[#c9aa4a]">
        —
      </p>
    </section>
  );
}

function ResultsActionButton({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: string;
}) {
  const className =
    "mx-auto mt-4 inline-flex min-h-9 items-center justify-center border border-[#8f762f]/70 bg-[#171717] px-4 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#c9aa4a] transition hover:bg-[#111111] hover:text-[#F4EEE7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9aa4a]";

  if (disabled) {
    return (
      <span aria-disabled="true" className={`${className} cursor-default opacity-70`}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function WinnersCircle({
  latestResults,
}: {
  latestResults: LatestTournamentResults | null;
}) {
  const hasResults = Boolean(latestResults);
  const results = latestResults?.results ?? null;

  const finalEntries = results
    ? [...results.entries]
        .filter(isFinalEntry)
        .sort((a, b) => a.place - b.place)
    : [];

  const displayFinalEntries: DisplayStandingEntry[] = hasResults
    ? finalEntries.slice(0, 20).map((entry) => ({
        placeLabel: formatOrdinal(entry.place),
        team: entry.team,
        weight: entry.weight,
        baseWinnings: entry.baseWinnings ?? null,
      }))
    : Array.from({ length: 20 }, () => ({
        placeLabel: "—",
        team: "—",
        weight: null,
        baseWinnings: null,
      }));

  const sidePotGroups = SIDE_POT_ORDER.map((sidePot) => {
    const winners = results
      ? results.entries
          .filter(
            (entry): entry is ResultEntry & { sidePot: SidePotName } =>
              isSidePotEntry(entry) && entry.sidePot === sidePot,
          )
          .sort(
            (a, b) =>
              (a.sidePotPlacement ?? a.place) -
              (b.sidePotPlacement ?? b.place),
          )
          .slice(0, 1)
          .map((winner) => ({
            placeLabel: formatOrdinal(winner.sidePotPlacement ?? winner.place),
            team: winner.team,
            weight: winner.weight,
            sidePotPayout: winner.sidePotPayout ?? null,
          }))
      : [
          {
            placeLabel: "—",
            team: "—",
            weight: null,
            sidePotPayout: null,
          },
        ];

    return { sidePot, winners };
  });

  const payoutTotals = calculateResultPayouts(latestResults?.results ?? {});

  const champion = finalEntries[0] ?? null;
  const championImage = latestResults?.championImage
    ? latestResults.championImage
    : hasResults
      ? "/images/results/overall-winner.jpg"
      : RESULTS_COMING_SOON_IMAGE;
  const bigBassImage = latestResults?.bigBassImage
    ? latestResults.bigBassImage
    : hasResults
      ? "/images/results/big-bass.jpg"
      : RESULTS_COMING_SOON_IMAGE;
  const championName = hasResults ? champion?.team ?? "—" : "—";
  const championWeight = hasResults ? champion?.weight ?? null : null;
  const bigBassName = results?.big_bass_angler ?? "—";
  const bigBassWeight = results?.big_bass_weight ?? null;

  return (
    <section id="results" className="bg-black px-4 py-8 sm:px-6">
      <div className={`${styles.showcaseContainer} bg-[#0B0A09]`}>
        <article className="overflow-visible border border-[#8f762f]/60 bg-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <TournamentHeader
            title={hasResults && latestResults ? latestResults.tournament.name : "Tournament Results "}
            subtitle={
              hasResults && latestResults
                ? `${latestResults.tournament.lake} • ${formatResultsDate(
                    latestResults.tournament.tournament_date,
                  )}`
                : undefined
            }
          />

          <div
            className={`${styles.showcaseGrid} divide-y divide-white/10 md:divide-x md:divide-y-0`}
          >
            <section className="flex min-w-0 flex-col border border-[#8f762f]/60 bg-[#111111] p-4 sm:p-5">
              <SectionHeading title="FINAL STANDINGS" icon={Trophy} />

              <div
                className={`${styles.finalStandingsGrid} mt-3 border-b border-white/10 pb-1.5 text-[0.65rem] font-black uppercase leading-4 tracking-[0.09em] text-neutral-500`}
              >
                <span>Place</span>
                <span>Team</span>
                <span className="text-right">Weight</span>
                <span className="text-right">Base Payout</span>
              </div>

              <ol className="mt-1">
                {displayFinalEntries.map((entry, index) => (
                  <StandingRow key={`${index}-${entry.placeLabel}`} entry={entry} />
                ))}
              </ol>

             <ResultsActionButton
  href={hasResults && latestResults ? latestResults.completeResultsUrl : "#"}
  disabled={!hasResults}
>
  View Complete Results
</ResultsActionButton>

<AoyLeaderPlaceholder />
            </section>

            <section className="flex min-w-0 flex-col border border-[#8f762f]/60 bg-[#111111] p-4 sm:p-5">
              <SectionHeading title="OVERALL CHAMPION" icon={Crown} centered />

              <MediaCard
                image={championImage}
                alt={
                  hasResults
                    ? `Overall champion ${championName} at ${latestResults!.tournament.name}`
                    : "Tournament champion placeholder"
                }
                name={championName}
                weight={championWeight}
                priority
                placeholder={!hasResults}
              />
<div className="mt-5 rounded-md border border-[#8f762f]/60 bg-[#171717] p-4">
  <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
    Tournament Recap
  </p>

  <p className="mt-3 text-sm leading-7 text-neutral-300">
    {latestResults?.tournamentRecap ??
      "Tournament recap will be published after results become official."}
  </p>
</div>
              <div className="mt-5 border border-[#8f762f]/60 bg-[#111111] p-3">
                <SummaryRow label="Tournament Entry Payout" value={hasResults ? payoutTotals.standardTournament : 0} />
                <SummaryRow label="Bronze Side Pot Payout" value={hasResults ? payoutTotals.bronze : 0} />
                <SummaryRow label="Silver Side Pot Payout" value={hasResults ? payoutTotals.silver : 0} />
                <SummaryRow label="Gold Side Pot Payout" value={hasResults ? payoutTotals.gold : 0} />
                <SummaryRow label="Insurance Pot" value={hasResults ? payoutTotals.insurance : 0} />
                <SummaryRow label="Big Bass Pot" value={hasResults ? payoutTotals.bigBass : 0} />
                <div className="my-2 border-t border-[#c9aa4a]/60" />
                <SummaryRow
                  label="TOTAL PAID OUT TO ANGLERS"
                  value={hasResults ? payoutTotals.totalPaidOutToAnglers : 0}
                  emphasis
                />
              </div>

            </section>

            <section
              className={`${styles.rightPanel} min-w-0 border border-[#8f762f]/60 bg-[#111111] p-4 sm:p-5`}
            >
              <SectionHeading title="SIDE POTS & PAYOUTS" icon={BadgeDollarSign} />

              <div className="mt-4 space-y-4">
                {sidePotGroups.map((group) => (
                  <SidePotSection
                    key={group.sidePot}
                    sidePot={group.sidePot}
                    winners={group.winners}
                  />
                ))}

                <section className="border-t border-[#c9aa4a]/50 pt-3">
                  <div className="flex items-center gap-2">
                    <Shield
                      aria-hidden="true"
                      className="size-4 shrink-0 text-[#C0C0C0]"
                    />
                    <h4 className="text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#F4EEE7]">
                      AITT INSURANCE POT
                    </h4>
                  </div>
                  {latestResults?.insurancePotResult?.published && latestResults.insurancePotWinnersUrl ? (
                    <a
                      href={latestResults.insurancePotWinnersUrl}
                      className="mt-2 inline-flex text-[0.65rem] font-black uppercase tracking-[0.1em] text-[#c9aa4a] transition hover:text-red-500"
                    >
                      View Insurance Pot Winners →
                    </a>
                  ) : (
                    <span className="mt-2 inline-flex cursor-not-allowed text-[0.65rem] font-black uppercase tracking-[0.1em] text-neutral-600" aria-disabled="true">
                      View Insurance Pot Winners — Coming Soon
                    </span>
                  )}
                </section>

                <section className="border-t border-[#c9aa4a]/45 pt-3">
                  <div className="flex items-center justify-center gap-2">
                    <Fish
                      aria-hidden="true"
                      className="size-4 shrink-0 text-[#c9aa4a]"
                    />
                    <h4 className="text-center text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      BIG BASS WINNER
                    </h4>
                  </div>

                  <div
                    className={`${styles.resultImageFrame} mt-3 rounded-[4px] border border-[#8f762f]/70 shadow-[0_10px_24px_rgba(0,0,0,0.38)]`}
                  >
                    <Image
                      src={bigBassImage}
                      alt={
                        hasResults
                          ? `Big bass winner ${bigBassName} with tournament fish`
                          : "Tournament big bass placeholder"
                      }
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={hasResults ? styles.resultImage : styles.resultPlaceholderImage}
                    />
                  </div>

                  <div className="pt-3 text-center">
                    <p className="text-[0.92rem] font-black uppercase tracking-[0.05em] text-[#F4EEE7] sm:text-[1rem]">
                      {bigBassName}
                    </p>
                    <p className="mt-0.5 text-[0.92rem] font-black tabular-nums text-[#c9aa4a] sm:text-[1rem]">
                      {bigBassWeight === null
                        ? "—"
                        : `${bigBassWeight.toFixed(2)} lbs`}
                    </p>
                  </div>
                </section>
              </div>
            </section>
          </div>
        </article>
      </div>
    </section>
  );
}
