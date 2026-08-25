import type { ResultEntry } from "@/types/results";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

export type PayoutValue = number | null | undefined;
export const RESULTS_PER_PAGE = 25;

export interface ResultPayoutSource {
  total_payout?: PayoutValue;
  bronze_payout?: PayoutValue;
  silver_payout?: PayoutValue;
  gold_payout?: PayoutValue;
  insurance_pot_payout?: PayoutValue;
  big_bass_payout?: PayoutValue;
}

export function payoutAmount(value: PayoutValue): number {
  const amount = Number(value);

  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

export function calculateResultPayouts(
  source: ResultPayoutSource,
  insurancePotResult?: TournamentInsurancePotResultRecord | null,
) {
  const standardTournament = payoutAmount(source.total_payout);
  const bronze = payoutAmount(source.bronze_payout);
  const silver = payoutAmount(source.silver_payout);
  const gold = payoutAmount(source.gold_payout);
  const insurance = insurancePotResult?.published
    ? insurancePotResult.winners.reduce(
        (total, winner) => total + payoutAmount(winner.amountCents) / 100,
        0,
      )
    : payoutAmount(source.insurance_pot_payout);
  const bigBass = payoutAmount(source.big_bass_payout);

  return {
    standardTournament,
    bronze,
    silver,
    gold,
    insurance,
    bigBass,
    // Fallback when a completed closeout total is unavailable. Each persisted
    // payout category is included exactly once.
    totalPaidOutToAnglers:
      standardTournament + bronze + silver + gold + insurance + bigBass,
    allListedCashPayouts:
      standardTournament + bronze + silver + gold + insurance + bigBass,
  };
}

export function getInsurancePotWinnersForEntry(
  entry: ResultEntry,
  result?: TournamentInsurancePotResultRecord | null,
) {
  if (!result?.published) return [];

  const normalizedTeam = normalizeResultTeam(entry.team);

  return result.winners.filter(
    (winner) =>
      winner.finishingPosition === entry.place &&
      normalizeResultTeam(winner.entryName) === normalizedTeam,
  );
}

export function paginateResultEntries(
  entries: ResultEntry[],
  requestedPage: number,
  pageSize = RESULTS_PER_PAGE,
) {
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const page = Math.min(
    totalPages,
    Math.max(1, Number.isInteger(requestedPage) ? requestedPage : 1),
  );
  const start = (page - 1) * pageSize;

  return {
    entries: entries.slice(start, start + pageSize),
    page,
    totalPages,
  };
}

export function formatResultsCurrency(value: PayoutValue): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(payoutAmount(value));
}

export function displayResultsPayout(value: PayoutValue): string {
  return payoutAmount(value) > 0 ? formatResultsCurrency(value) : "—";
}

export function formatResultsDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function normalizeResultTeam(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function isSidePotEntry(
  entry: ResultEntry,
): entry is ResultEntry & {
  sidePot: "bronze" | "silver" | "gold";
} {
  return (
    entry.kind === "sidePot" &&
    (entry.sidePot === "bronze" ||
      entry.sidePot === "silver" ||
      entry.sidePot === "gold")
  );
}

export function getTeamPayouts(
  entries: ResultEntry[],
  team: string,
  bigBassTeam: string | null,
  bigBassPayout: PayoutValue,
  insurancePayout: PayoutValue = 0,
) {
  const normalizedTeam = normalizeResultTeam(team);
  const finalEntry = entries.find(
    (entry) =>
      !isSidePotEntry(entry) &&
      normalizeResultTeam(entry.team) === normalizedTeam,
  );
  const sidePotEntries = entries.filter(
    (entry) =>
      isSidePotEntry(entry) &&
      normalizeResultTeam(entry.team) === normalizedTeam,
  );

  const sidePotTotal = (sidePot: "bronze" | "silver" | "gold") =>
    sidePotEntries
      .filter((entry) => entry.sidePot === sidePot)
      .reduce(
        (total, entry) => total + payoutAmount(entry.sidePotPayout),
        0,
      );

  const standardTournament = payoutAmount(finalEntry?.baseWinnings);
  const bronze = finalEntry?.bronzePayout === undefined
    ? sidePotTotal("bronze")
    : payoutAmount(finalEntry.bronzePayout);
  const silver = finalEntry?.silverPayout === undefined
    ? sidePotTotal("silver")
    : payoutAmount(finalEntry.silverPayout);
  const gold = finalEntry?.goldPayout === undefined
    ? sidePotTotal("gold")
    : payoutAmount(finalEntry.goldPayout);
  const bigBass = finalEntry?.bigBassPayout === undefined
    ? bigBassTeam && normalizeResultTeam(bigBassTeam) === normalizedTeam
      ? payoutAmount(bigBassPayout)
      : 0
    : payoutAmount(finalEntry.bigBassPayout);
  const insurance = payoutAmount(insurancePayout);

  return {
    standardTournament,
    bronze,
    silver,
    gold,
    bigBass,
    totalWon:
      standardTournament + bronze + silver + gold + bigBass + insurance,
  };
}

export function getTeamPayoutBreakdown(
  payouts: ReturnType<typeof getTeamPayouts>,
) {
  return [
    { label: "Tournament", amount: payouts.standardTournament },
    { label: "Bronze", amount: payouts.bronze },
    { label: "Silver", amount: payouts.silver },
    { label: "Gold", amount: payouts.gold },
    { label: "Big Bass", amount: payouts.bigBass },
  ].filter((item) => item.amount > 0);
}
