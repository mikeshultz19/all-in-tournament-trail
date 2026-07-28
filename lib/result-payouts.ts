import type { ResultEntry } from "@/types/results";

export type PayoutValue = number | null | undefined;

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

export function calculateResultPayouts(source: ResultPayoutSource) {
  const standardTournament = payoutAmount(source.total_payout);
  const bronze = payoutAmount(source.bronze_payout);
  const silver = payoutAmount(source.silver_payout);
  const gold = payoutAmount(source.gold_payout);
  const insurance = payoutAmount(source.insurance_pot_payout);
  const bigBass = payoutAmount(source.big_bass_payout);

  return {
    standardTournament,
    bronze,
    silver,
    gold,
    insurance,
    bigBass,
    // This is the only aggregate payout total published by AITT.
    totalPaidOutToAnglers: bronze + silver + gold + insurance,
    // Useful for admin review only; never label this as the public payout total.
    allListedCashPayouts:
      standardTournament + bronze + silver + gold + insurance + bigBass,
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
  const bronze = sidePotTotal("bronze");
  const silver = sidePotTotal("silver");
  const gold = sidePotTotal("gold");
  const bigBass =
    bigBassTeam &&
    normalizeResultTeam(bigBassTeam) === normalizedTeam
      ? payoutAmount(bigBassPayout)
      : 0;

  return {
    standardTournament,
    bronze,
    silver,
    gold,
    bigBass,
    totalWon: standardTournament + bronze + silver + gold + bigBass,
  };
}
