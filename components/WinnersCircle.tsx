import {
  BadgeDollarSign,
  ClipboardList,
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
import type {
  LatestTournamentResults,
  ResultEntry,
} from "@/types/results";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
type SidePotName = "bronze" | "silver" | "gold";

const SIDE_POT_ORDER: SidePotName[] = ["bronze", "silver", "gold"];

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

const BASE_PAYOUT_FALLBACKS: Record<number, number> = {
  1: 2500,
  2: 1500,
  3: 1000,
  4: 800,
  5: 600,
  6: 450,
  7: 350,
  8: 250,
  9: 150,
  10: 100,
};

function formatTournamentDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
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

function getBasePayout(entry: ResultEntry): number {
  return entry.baseWinnings && entry.baseWinnings > 0
    ? entry.baseWinnings
    : BASE_PAYOUT_FALLBACKS[entry.place] ?? 0;
}

function isSidePotEntry(
  entry: ResultEntry,
): entry is ResultEntry & { sidePot: SidePotName } {
  return (
    entry.kind === "sidePot" &&
    (entry.sidePot === "bronze" ||
      entry.sidePot === "silver" ||
      entry.sidePot === "gold")
  );
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
          <h2 className={styles.bannerTitle}>
            {title}
          </h2>
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
}: {
  image: string;
  alt: string;
  name: string;
  weight: number | null;
  centered?: boolean;
  priority?: boolean;
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
          className={styles.resultImage}
          priority={priority}
        />
      </div>
      <div className="pt-3">
        <p className="text-[0.92rem] font-black uppercase tracking-[0.05em] text-[#F4EEE7] sm:text-[1rem]">
          {name}
        </p>
        <p className="mt-0.5 text-[0.92rem] font-black tabular-nums text-[#c9aa4a] sm:text-[1rem]">
          {weight === null ? "Not recorded" : `${weight.toFixed(2)} lbs`}
        </p>
      </div>
    </article>
  );
}

function StandingRow({
  entry,
}: {
  entry: ResultEntry;
}) {
  const placeTone =
    entry.place <= 3 ? "text-[#c9aa4a]" : "text-[#F4EEE7]";
  const payout = getBasePayout(entry);

  return (
    <li className="border-b border-white/10 py-1 last:border-b-0">
      <div className={`${styles.finalStandingsGrid} items-center gap-2.5`}>
        <span
          className={`text-left text-[0.56rem] font-black uppercase leading-4 tracking-[0.08em] ${placeTone}`}
        >
          {formatOrdinal(entry.place)}
        </span>
        <span className="min-w-0 whitespace-nowrap text-left text-[0.65rem] font-semibold leading-4 text-[#F4EEE7]">
          {entry.team}
        </span>
        <span className="whitespace-nowrap text-right text-[0.65rem] font-semibold leading-4 tabular-nums text-neutral-500">
          {entry.weight.toFixed(2)} lbs
        </span>
        <span className="whitespace-nowrap text-right text-[0.65rem] font-black leading-4 tabular-nums text-[#c9aa4a]">
          {formatCurrency(payout)}
        </span>
      </div>
    </li>
  );
}

function SidePotRow({
  winner,
}: {
  winner: ResultEntry & { sidePot: SidePotName };
}) {
  return (
    <li className="border-b border-white/10 py-1.5 last:border-b-0">
      <div className={styles.sidePotGrid}>
        <span className="text-[0.62rem] font-black uppercase leading-4 tracking-[0.08em] text-neutral-500">
          {formatOrdinal(winner.sidePotPlacement ?? winner.place)}
        </span>
        <span className="min-w-0 whitespace-nowrap text-left text-[0.65rem] font-semibold leading-4 text-[#F4EEE7]">
          {winner.team}
        </span>
        <span className="whitespace-nowrap text-right text-[0.65rem] font-semibold leading-4 tabular-nums text-neutral-500">
          {winner.weight.toFixed(2)} lbs
        </span>
        <span className="whitespace-nowrap text-right text-[0.65rem] font-black leading-4 tabular-nums text-[#c9aa4a]">
          {formatCurrency(winner.sidePotPayout ?? 0)}
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
  winners: Array<ResultEntry & { sidePot: SidePotName }>;
}) {
  const theme = SIDE_POT_THEMES[sidePot];

  return (
    <section
      className="border-t pt-3"
      style={{ borderTopColor: theme.divider }}
    >
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
        <div className={`${styles.sidePotGrid} border-b border-white/10 pb-2 text-[0.65rem] font-black uppercase leading-4 tracking-[0.09em] text-neutral-500`}>
          <span>Place</span>
          <span>Team</span>
          <span className="text-right">Weight</span>
          <span className="text-right">Won</span>
        </div>
        <ol className="mt-1">
          {winners.map((winner) => (
            <SidePotRow
              key={`${winner.sidePot}-${winner.sidePotPlacement ?? winner.place}-${winner.team}`}
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
          emphasis ? "text-[1.05rem] text-[#c9aa4a]" : "text-[0.78rem] text-[#F4EEE7]"
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function formatTournamentEntryPayout(
  results: LatestTournamentResults["results"] | null,
  finalEntries: ResultEntry[],
): number {
  if (results && results.total_payout > 0) {
    return results.total_payout;
  }

  return finalEntries.reduce((sum, entry) => sum + getBasePayout(entry), 0);
}

function getSidePotPayout(
  results: LatestTournamentResults["results"] | null,
  sidePot: SidePotName,
): number {
  if (!results) return 0;

  return results.entries
    .filter((entry): entry is ResultEntry & { sidePot: SidePotName } =>
      isSidePotEntry(entry) && entry.sidePot === sidePot,
    )
    .reduce((sum, winner) => sum + (winner.sidePotPayout ?? 0), 0);
}

function getBigBassPayout(
  results: LatestTournamentResults["results"] | null,
): number {
  return (results as (LatestTournamentResults["results"] & {
    big_bass_payout?: number;
  }) | null)?.big_bass_payout ?? 650;
}

export default function WinnersCircle({
  latestResults,
}: {
  latestResults: LatestTournamentResults | null;
}) {
  const finalEntries = latestResults
    ? [...latestResults.results.entries]
        .filter(isFinalEntry)
        .sort((a, b) => a.place - b.place)
    : [];
  const displayFinalEntries = finalEntries.slice(0, 20);

  const sidePotGroups = SIDE_POT_ORDER.map((sidePot) => ({
    sidePot,
    winners:
      latestResults?.results.entries
        .filter(
          (entry): entry is ResultEntry & { sidePot: SidePotName } =>
            isSidePotEntry(entry) && entry.sidePot === sidePot,
        )
        .sort(
          (a, b) =>
            (a.sidePotPlacement ?? a.place) - (b.sidePotPlacement ?? b.place),
        )
        .slice(0, 1) ?? [],
  }));

  const results = latestResults?.results ?? null;
  const tournamentEntryPayout = formatTournamentEntryPayout(results, finalEntries);
  const bronzePayout = getSidePotPayout(latestResults?.results ?? null, "bronze");
  const silverPayout = getSidePotPayout(latestResults?.results ?? null, "silver");
  const goldPayout = getSidePotPayout(latestResults?.results ?? null, "gold");
  const insurancePot = latestResults?.results.insurance_pot_payout ?? 0;
  const bigBassPot = getBigBassPayout(latestResults?.results ?? null);
  const totalPaidOut =
    tournamentEntryPayout +
    bronzePayout +
    silverPayout +
    goldPayout +
    insurancePot +
    bigBassPot;

  const champion = finalEntries[0] ?? null;
  const championImage =
    latestResults?.championImage ?? "/images/results/overall-winner.jpg";
  const bigBassImage =
    latestResults?.bigBassImage ?? "/images/results/big-bass.jpg";

  return (
    <section
      id="results"
      className="border-b border-[#191612] bg-[#0B0A09] py-8"
    >
      <div className={styles.showcaseContainer}>
        <article className="overflow-visible border border-[#8f762f]/60 bg-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          {latestResults ? (
            <>
              <TournamentHeader
                title={latestResults.tournament.name}
                subtitle={`${latestResults.tournament.lake} • ${formatTournamentDate(
                  latestResults.tournament.tournament_date,
                )}`}
              />

              <div className={`${styles.showcaseGrid} divide-y divide-white/10 md:divide-x md:divide-y-0`}>
                <section className="flex min-w-0 flex-col border border-[#8f762f]/60 bg-[#111111] p-4 sm:p-5">
                  <SectionHeading
                    title="FINAL STANDINGS"
                    icon={Trophy}
                  />

                  <div
                    className={`${styles.finalStandingsGrid} mt-3 border-b border-white/10 pb-1.5 text-[0.65rem] font-black uppercase leading-4 tracking-[0.09em] text-neutral-500`}
                  >
                    <span>Place</span>
                    <span>Team</span>
                    <span className="text-right">Weight</span>
                    <span className="text-right">Base Payout</span>
                  </div>

                  <ol className="mt-1">
                    {displayFinalEntries.map((entry) => (
                      <StandingRow key={`${entry.place}-${entry.team}`} entry={entry} />
                    ))}
                  </ol>

                  <Link
                    href={latestResults.completeResultsUrl}
                    className="mx-auto mt-4 inline-flex min-h-9 items-center justify-center border border-[#8f762f]/70 bg-[#171717] px-4 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#c9aa4a] transition hover:bg-[#111111] hover:text-[#F4EEE7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9aa4a]"
                  >
                    View Complete Results
                  </Link>
                </section>

                <section className="min-w-0 border border-[#8f762f]/60 bg-[#111111] p-4 sm:p-5">
                  <SectionHeading
                    title="OVERALL CHAMPION"
                    icon={Crown}
                    centered
                  />

                  <MediaCard
                    image={championImage}
                    alt={`Overall champion ${champion?.team ?? "winner"} at ${latestResults.tournament.name}`}
                    name={champion?.team ?? "Winner"}
                    weight={champion?.weight ?? null}
                    priority
                  />

                  <div className="mt-5 border border-[#8f762f]/60 bg-[#111111] p-3">
                    <SummaryRow label="Tournament Entry Payout" value={tournamentEntryPayout} />
                    <SummaryRow label="Bronze Side Pot Payout" value={bronzePayout} />
                    <SummaryRow label="Silver Side Pot Payout" value={silverPayout} />
                    <SummaryRow label="Gold Side Pot Payout" value={goldPayout} />
                    <SummaryRow label="Insurance Pot" value={insurancePot} />
                    <SummaryRow label="Big Bass Pot" value={bigBassPot} />
                    <div className="my-2 border-t border-[#c9aa4a]/60" />
                    <SummaryRow
                      label="TOTAL PAID OUT TO ALL ANGLERS"
                      value={totalPaidOut}
                      emphasis
                    />
                  </div>
                </section>

                <section
                  className={`${styles.rightPanel} min-w-0 border border-[#8f762f]/60 bg-[#111111] p-4 sm:p-5`}
                >
                  <SectionHeading
                    title="SIDE POTS & PAYOUTS"
                    icon={BadgeDollarSign}
                  />

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
                          INSURANCE POT
                        </h4>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-4 border-b border-white/10 pb-2">
                        <span className="text-[0.58rem] font-black uppercase tracking-[0.09em] text-neutral-500">
                          Amount
                        </span>
                        <span className="whitespace-nowrap text-right text-[0.78rem] font-black tabular-nums text-[#c9aa4a]">
                          {formatCurrency(insurancePot)}
                        </span>
                      </div>
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
                          alt={`Big bass winner ${latestResults.results.big_bass_angler ?? "angler"} with tournament fish`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className={styles.resultImage}
                        />
                      </div>

                      <div className="pt-3 text-center">
                        <p className="text-[0.92rem] font-black uppercase tracking-[0.05em] text-[#F4EEE7] sm:text-[1rem]">
                          {latestResults.results.big_bass_angler ?? "Not recorded"}
                        </p>
                        <p className="mt-0.5 text-[0.92rem] font-black tabular-nums text-[#c9aa4a] sm:text-[1rem]">
                          {latestResults.results.big_bass_weight === null
                            ? "Not recorded"
                            : `${latestResults.results.big_bass_weight.toFixed(2)} lbs`}
                        </p>
                      </div>
                    </section>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <>
              <TournamentHeader title="Latest Tournament Results" />

              <div className="relative min-h-[330px] overflow-hidden">
                <Image
                  src="/images/results/overall-winner.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 1650px) 100vw, 1650px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.78),rgba(43,8,16,0.72))]" />
                <div className="relative z-10 flex min-h-[330px] flex-col items-center justify-center px-6 py-12 text-center">
                  <ClipboardList
                    aria-hidden="true"
                    className="size-10 text-[#c9aa4a]"
                  />
                  <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-[#F4EEE7] sm:text-2xl">
                    No Results Available
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    Results will appear here after the next tournament.
                  </p>
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}