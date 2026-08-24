export type InsurancePotWinner = {
  entryId?: string;
  boatNumber?: number | null;
  entryName: string;
  finishingPosition?: number;
  amountCents: number;
  note?: string;
};

export type InsurancePotResult = {
  entryCount: number;
  totalPotCents: number;
  placesPaid: number;
  winners: InsurancePotWinner[];
  published: boolean;
  publishedAt?: string;
};

export const INSURANCE_POT_ENTRY_FEE_CENTS = 2_000;

export function getInsurancePotPlaces(entryCount: number): number {
  if (!Number.isFinite(entryCount) || entryCount <= 0) return 0;
  const wholeEntries = Math.floor(entryCount);
  if (wholeEntries < 10) return 1;
  return Math.floor(wholeEntries / 5);
}

export function splitInsurancePotCents(
  totalPotCents: number,
  placesPaid: number,
): number[] {
  const total = Math.max(0, Math.round(totalPotCents));
  const places = Math.max(0, Math.floor(placesPaid));
  if (places === 0) return [];

  const baseAmount = Math.floor(total / places);
  const remainder = total % places;
  return Array.from(
    { length: places },
    (_, index) => baseAmount + (index < remainder ? 1 : 0),
  );
}

export function expectedInsurancePotCents(entryCount: number): number {
  return Math.max(0, Math.floor(Number.isFinite(entryCount) ? entryCount : 0)) * INSURANCE_POT_ENTRY_FEE_CENTS;
}

export function validateInsurancePotResult(
  result: InsurancePotResult,
): string[] {
  const errors: string[] = [];
  const requiredPlaces = getInsurancePotPlaces(result.entryCount);

  if (!Number.isInteger(result.entryCount) || result.entryCount < 0) {
    errors.push("Insurance Pot entry count must be a whole number of zero or more.");
  }
  if (!Number.isInteger(result.totalPotCents) || result.totalPotCents < 0) {
    errors.push("Total Insurance Pot must be a nonnegative cent amount.");
  }
  if (result.placesPaid !== requiredPlaces) {
    errors.push("Places paid does not match the Insurance Pot entry count.");
  }
  if (result.winners.length !== requiredPlaces) {
    errors.push(`Enter exactly ${requiredPlaces} Insurance Pot winner${requiredPlaces === 1 ? "" : "s"}.`);
  }

  const normalizedNames = result.winners.map((winner) =>
    winner.entryName.trim().toLocaleLowerCase("en-US"),
  );
  if (normalizedNames.some((name) => !name)) {
    errors.push("Every Insurance Pot winner must have an entry name.");
  }
  if (new Set(normalizedNames).size !== normalizedNames.length) {
    errors.push("Insurance Pot winners cannot contain duplicate entries.");
  }
  if (
    result.winners.some(
      (winner) =>
        !Number.isInteger(winner.amountCents) || winner.amountCents < 0,
    )
  ) {
    errors.push("Every Insurance Pot payout must be a nonnegative cent amount.");
  }

  const assigned = result.winners.reduce(
    (total, winner) => total + winner.amountCents,
    0,
  );
  if (assigned !== result.totalPotCents) {
    errors.push("Assigned Insurance Pot payouts must equal the total Insurance Pot.");
  }

  return errors;
}

export function insurancePotAssignedCents(
  winners: readonly InsurancePotWinner[],
): number {
  return winners.reduce((total, winner) => total + winner.amountCents, 0);
}

export function isInsurancePotWinnerDraftComplete(result: InsurancePotResult): boolean {
  if (result.entryCount === 0) return result.placesPaid === 0 && result.totalPotCents === 0 && result.winners.length === 0;
  return validateInsurancePotResult(result).length === 0 && result.winners.every((winner) => Number.isInteger(winner.finishingPosition) && (winner.finishingPosition ?? 0) > 0);
}
