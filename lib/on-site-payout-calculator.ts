import type { WeighfishResultRow } from "@/lib/weighfishParser";
import type { CloseoutPayoutCategory, OnSiteCloseoutCheck } from "@/types/on-site-closeout";

const categories: Array<[CloseoutPayoutCategory, keyof Pick<WeighfishResultRow, "basePayout" | "bronzePayout" | "silverPayout" | "goldPayout" | "bigBassPayout">]> = [
  ["Base Tournament", "basePayout"], ["Bronze Pot", "bronzePayout"],
  ["Silver Pot", "silverPayout"], ["Gold Pot", "goldPayout"], ["Big Bass", "bigBassPayout"],
];

export function buildWeighfishChecks(rows: readonly WeighfishResultRow[]): OnSiteCloseoutCheck[] {
  const checks = rows.flatMap((row, rowIndex) => categories.flatMap(([category, field]) => {
    const amountCents = Math.round(row[field] * 100);
    if (amountCents <= 0 || !row.place) return [];
    return [{ id: `wf-${rowIndex}-${field}`, entryName: row.entryName, finishingPlace: row.place, category, amountCents, status: "not_written" as const }];
  }));
  return sortCloseoutChecks(checks);
}

export const CLOSEOUT_PAYOUT_CATEGORY_ORDER: readonly CloseoutPayoutCategory[] = [
  "Base Tournament",
  "Bronze Pot",
  "Silver Pot",
  "Gold Pot",
  "Big Bass",
  "AITT Insurance Pot",
];

export function sortCloseoutChecks<T extends OnSiteCloseoutCheck>(checks: readonly T[]): T[] {
  return checks
    .map((check, sourceIndex) => ({ check, sourceIndex }))
    .sort((left, right) => {
      const categoryDifference = CLOSEOUT_PAYOUT_CATEGORY_ORDER.indexOf(left.check.category) - CLOSEOUT_PAYOUT_CATEGORY_ORDER.indexOf(right.check.category);
      if (categoryDifference !== 0) return categoryDifference;
      // WeighFish supplies Big Bass in its official first/second-place order.
      // Preserve that order; all other categories follow final tournament place.
      if (left.check.category !== "Big Bass") {
        const placeDifference = left.check.finishingPlace - right.check.finishingPlace;
        if (placeDifference !== 0) return placeDifference;
      }
      return left.sourceIndex - right.sourceIndex;
    })
    .map(({ check }) => check);
}

export function closeoutDifferenceCents(totalCollectedCents: number, trailRetainedCents: number, checks: readonly OnSiteCloseoutCheck[]): number {
  return totalCollectedCents - trailRetainedCents - checks.reduce((sum, check) => sum + check.amountCents, 0);
}

export function ordinal(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  return `${value}${value % 10 === 1 ? "st" : value % 10 === 2 ? "nd" : value % 10 === 3 ? "rd" : "th"}`;
}
