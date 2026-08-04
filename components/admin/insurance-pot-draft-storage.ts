export function insurancePotCalculationDraftKey(tournamentId: string) {
  return `insurance-pot-calculation:${tournamentId}`;
}

export function insurancePotWinnerDraftKey(tournamentId: string) {
  return `insurance-pot-winners:${tournamentId}`;
}

export function readInsurancePotCalculationDraft(tournamentId: string) {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(
      insurancePotCalculationDraftKey(tournamentId),
    );
    return value ? JSON.parse(value) as { entryCountInput?: string; noEntries?: boolean } : null;
  } catch {
    return null;
  }
}

export function writeInsurancePotCalculationDraft(
  tournamentId: string,
  draft: { entryCountInput: string; noEntries: boolean },
) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    insurancePotCalculationDraftKey(tournamentId),
    JSON.stringify(draft),
  );
}

export function readInsurancePotWinnerDraft(tournamentId: string) {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(
      insurancePotWinnerDraftKey(tournamentId),
    );
    return value ? JSON.parse(value) as Array<{ entryName?: string; finishingPosition?: number | null; amountCents?: number }> : null;
  } catch {
    return null;
  }
}

export function writeInsurancePotWinnerDraft(
  tournamentId: string,
  winners: Array<{
    entryName: string;
    finishingPosition?: number | null;
    amountCents: number;
  }>,
) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    insurancePotWinnerDraftKey(tournamentId),
    JSON.stringify(winners),
  );
}

export function clearInsurancePotDraftState(tournamentId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(insurancePotCalculationDraftKey(tournamentId));
  window.sessionStorage.removeItem(insurancePotWinnerDraftKey(tournamentId));
}
