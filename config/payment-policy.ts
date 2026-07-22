export const CARD_PROCESSING_FEE_RATE_BASIS_POINTS = 300;
export const CARD_PROCESSING_FEE_PERCENT = 3;
export const CARD_PROCESSOR = "square" as const;

function requireValidCents(amountCents: number) {
  if (!Number.isSafeInteger(amountCents) || amountCents < 0) {
    throw new RangeError("Currency amounts must be non-negative safe integers expressed in cents.");
  }
}

export function calculateCardProcessingFeeCents(subtotalCents: number) {
  requireValidCents(subtotalCents);
  return Math.round(
    (subtotalCents * CARD_PROCESSING_FEE_RATE_BASIS_POINTS) / 10_000,
  );
}

export function calculateCardTotalCents(subtotalCents: number) {
  requireValidCents(subtotalCents);
  return subtotalCents + calculateCardProcessingFeeCents(subtotalCents);
}

export function formatCurrencyFromCents(amountCents: number) {
  requireValidCents(amountCents);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}
