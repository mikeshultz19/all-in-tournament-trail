import { REGISTRATION_OPTION_CONFIG, REGISTRATION_PRICING } from "@/data/registration";

export type TournamentCollectionLine = {
  key: CollectionCategory;
  label: string;
  count: number;
  onlineCount: number;
  inPersonCount: number;
  configuredFeeCents: number;
  feeCents: number | null;
  totalCents: number;
};

export type CollectionCategory = "base" | "bronze" | "silver" | "gold" | "big_bass" | "membership" | "insurance";
export type WalkUpFundsByMethod = { cash: number; card: number; other: number };

export type TournamentCollectionSummary = {
  tournamentId: string;
  lines: TournamentCollectionLine[];
  totalCollectedCents: number;
  totalTournamentPayoutFundsCents: number;
  membershipRevenueCents: number;
  membershipMismatchCount?: number;
  membershipReconciliationWarnings?: string[];
  totalRegistrationFundsCollectedCents: number;
  onlineRegistrationFundsCents: number;
  walkUpFundsByMethod: WalkUpFundsByMethod;
  paidEntries: number;
  confirmedPaidEntries: number;
  registrationsNeedingReview: number;
  morningCandidates: MorningCollectionCandidate[];
  missing: string[];
};

export type MorningCollectionCandidate = {
  key: string;
  entryName: string;
  matchStatus: "matched" | "ambiguous" | "unmatched";
  registrationId: string | null;
  matchingRegistrationIds: string[];
  onlineCategories: CollectionCategory[];
};

export type MorningCollectionReview = Record<string, { confirmed: boolean; categories: CollectionCategory[] }>;

type PriceLineItem = { code?: string; name?: string; priceCents?: number };
type PriceSnapshot = { lineItems?: PriceLineItem[]; cardProcessingFeeCents?: number; totalCents?: number } | null;
type MembershipSnapshot = { anglerId?: string | null; submittedClassification?: string; resolvedClassification?: string };

export type RegistrationCollectionRow = {
  tournament_id: string;
  id?: string;
  registration_type?: "team" | "solo";
  angler1_name?: string;
  angler2_name?: string | null;
  payment_reference: string | null;
  identity_review_status: string;
  registration_source?: "online" | "walk_up";
  payment_method?: "online" | "cash" | "card" | "other" | null;
  online_payment_state?: "completed" | null;
  square_payment_id?: string | null;
  angler1_id?: string | null;
  angler2_id?: string | null;
  registration_status?: "active" | "cancelled";
  member_pot: "bronze" | "silver" | "gold" | null;
  big_bass: boolean;
  insurance?: boolean;
  membership_snapshot?: MembershipSnapshot[] | null;
  price_snapshot: PriceSnapshot;
};

export type ImportedCollectionRow = {
  id: string;
  tournament_id: string;
  registration_id?: string | null;
  team_name: string;
  participation_status: string;
};


const configuredLines = [
  ["base", "Base Entry", REGISTRATION_OPTION_CONFIG.tournament_entry.priceCents],
  ["bronze", "Bronze Pot", REGISTRATION_OPTION_CONFIG.bronze.priceCents],
  ["silver", "Silver Pot", REGISTRATION_OPTION_CONFIG.silver.priceCents],
  ["gold", "Gold Pot", REGISTRATION_OPTION_CONFIG.gold.priceCents],
  ["big_bass", "Big Bass", REGISTRATION_OPTION_CONFIG.big_bass.priceCents],
] as const;

const itemNames = { base: "Tournament Entry", bronze: "Bronze Pot", silver: "Silver Pot", gold: "Gold Pot", big_bass: "Big Bass", insurance: "Insurance Pot", membership: "Membership" } as const;

function validCents(value: unknown): number | null {
  return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : null;
}

function lineAmount(snapshot: PriceSnapshot, predicate: (item: PriceLineItem) => boolean): number | null {
  if (!Array.isArray(snapshot?.lineItems)) return null;
  const matches = snapshot.lineItems.filter(predicate);
  if (!matches.length) return 0;
  const amounts = matches.map((item) => validCents(item.priceCents));
  return amounts.some((amount) => amount === null) ? null : amounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0);
}

function hasLineItems(snapshot: PriceSnapshot): boolean {
  return Array.isArray(snapshot?.lineItems);
}

function selectedCategory(row: RegistrationCollectionRow, category: CollectionCategory): boolean {
  if (category === "base") return true;
  if (category === "bronze" || category === "silver" || category === "gold") return row.member_pot === category;
  if (category === "big_bass") return row.big_bass;
  return Boolean(row.insurance);
}

function categoryAmount(row: RegistrationCollectionRow, category: CollectionCategory, configuredCents: number): number | null {
  if (!selectedCategory(row, category)) return 0;
  if (row.registration_source === "walk_up") return configuredCents;
  if (hasLineItems(row.price_snapshot)) {
    const matches = row.price_snapshot?.lineItems?.filter((item) => item.code === category || item.name === itemNames[category]) ?? [];
    if (!matches.length) return null;
    return lineAmount(row.price_snapshot, (item) => item.code === category || item.name === itemNames[category]);
  }
  return configuredCents;
}

function membershipAmount(row: RegistrationCollectionRow): number | null {
  if (row.registration_source === "walk_up") {
    const joiningCount = (row.membership_snapshot ?? []).filter((item) => item.submittedClassification === "joining" || item.resolvedClassification === "joining").length;
    return joiningCount * REGISTRATION_PRICING.annualMembership * 100;
  }
  if (hasLineItems(row.price_snapshot)) {
    const matches = row.price_snapshot?.lineItems?.filter((item) => item.code === "annual_membership" || Boolean(item.name?.endsWith(" Membership"))) ?? [];
    if (!matches.length && (row.membership_snapshot ?? []).some((item) => item.submittedClassification === "joining" || item.resolvedClassification === "joining")) return null;
    return lineAmount(row.price_snapshot, (item) => item.code === "annual_membership" || Boolean(item.name?.endsWith(" Membership")));
  }
  const joiningCount = (row.membership_snapshot ?? []).filter((item) => item.submittedClassification === "joining" || item.resolvedClassification === "joining").length;
  return joiningCount * REGISTRATION_PRICING.annualMembership * 100;
}

function joiningMembershipCount(row: RegistrationCollectionRow): number {
  return (row.membership_snapshot ?? []).filter((item) => item.submittedClassification === "joining" || item.resolvedClassification === "joining").length;
}

type MembershipReconciliation = {
  expectedCount: number;
  expectedAmountCents: number;
  collectedAmountCents: number;
  mismatch: boolean;
};

function reconcileMembershipRow(row: RegistrationCollectionRow): MembershipReconciliation {
  const membershipFeeCents = REGISTRATION_PRICING.annualMembership * 100;
  const joiningItems = row.membership_snapshot?.filter((item) => item.submittedClassification === "joining" || item.resolvedClassification === "joining") ?? [];
  const storedItemizedAmountCents = lineAmount(row.price_snapshot, (item) => item.code === "annual_membership" || Boolean(item.name?.endsWith(" Membership")));
  const itemizedAmountCents = row.registration_source === "walk_up"
    ? joiningItems.length * membershipFeeCents
    : storedItemizedAmountCents;
  const adminConfirmedJoiningCount = joiningItems.filter((item) => item.resolvedClassification === "joining").length;
  const itemizedCount = itemizedAmountCents !== null && itemizedAmountCents >= 0 && itemizedAmountCents % membershipFeeCents === 0
    ? itemizedAmountCents / membershipFeeCents
    : 0;
  const expectedCount = row.membership_snapshot == null && itemizedAmountCents !== null && itemizedAmountCents > 0
    ? itemizedAmountCents / (REGISTRATION_PRICING.annualMembership * 100)
    : joiningItems.length;
  const expectedAmountCents = expectedCount * REGISTRATION_PRICING.annualMembership * 100;
  const collected = isCollected(row);
  const administratorConfirmedMissingAmount = Math.max(0, adminConfirmedJoiningCount - itemizedCount) * membershipFeeCents;
  const collectedAmountCents = !collected
    ? 0
    : (itemizedAmountCents ?? 0) + administratorConfirmedMissingAmount;
  const mismatch =
    (expectedCount > 0 && !collected) ||
    (row.registration_source !== "walk_up" && expectedCount > 0 && itemizedAmountCents === 0 && adminConfirmedJoiningCount === 0) ||
    (row.membership_snapshot !== undefined && expectedCount === 0 && Boolean(itemizedAmountCents && itemizedAmountCents > 0)) ||
    (itemizedAmountCents !== null && itemizedAmountCents > 0 && itemizedAmountCents !== expectedAmountCents);
  return { expectedCount, expectedAmountCents, collectedAmountCents, mismatch };
}

function membershipCount(row: RegistrationCollectionRow): number {
  if (row.registration_source === "walk_up") return joiningMembershipCount(row);
  if (row.membership_snapshot !== undefined && row.membership_snapshot !== null) return joiningMembershipCount(row);
  if (hasLineItems(row.price_snapshot)) {
    const amount = membershipAmount(row);
    return amount !== null && amount % (REGISTRATION_PRICING.annualMembership * 100) === 0
      ? amount / (REGISTRATION_PRICING.annualMembership * 100)
      : 0;
  }
  return 0;
}

function isCollected(row: RegistrationCollectionRow): boolean {
  if (!row.payment_reference || row.registration_status === "cancelled") return false;
  if (row.registration_source === "walk_up") return row.payment_method === "cash" || row.payment_method === "card" || row.payment_method === "other";
  if (row.online_payment_state !== undefined) return row.online_payment_state === "completed" && Boolean(row.square_payment_id);
  return true;
}

function walkUpMethod(row: RegistrationCollectionRow): keyof WalkUpFundsByMethod {
  return row.payment_method === "cash" || row.payment_method === "card" ? row.payment_method : "other";
}

function hasMalformedWalkUpPaymentSnapshot(row: RegistrationCollectionRow, faceValueCents: number): boolean {
  const storedTotalCents = validCents(row.price_snapshot?.totalCents);
  if (storedTotalCents === null) return false;
  const storedCardFeeCents = validCents(row.price_snapshot?.cardProcessingFeeCents ?? 0);
  if (storedCardFeeCents === null) return true;
  if (row.payment_method !== "card" && storedCardFeeCents !== 0) return true;
  const expectedTotalCents = faceValueCents + (row.payment_method === "card" ? storedCardFeeCents : 0);
  return storedTotalCents !== expectedTotalCents;
}

export function buildTournamentCollectionSummary(tournamentId: string, rows: readonly RegistrationCollectionRow[], _insuranceResult?: unknown, importedRows: readonly ImportedCollectionRow[] = []): TournamentCollectionSummary {
  const paidRows = rows.filter((row) => row.tournament_id === tournamentId && isCollected(row));
  const scopedRows = rows.filter((row) => row.tournament_id === tournamentId && row.registration_status !== "cancelled");
  const confirmedRows = paidRows.filter((row) => row.identity_review_status !== "review_required");
  const registrationsNeedingReview = paidRows.length - confirmedRows.length;
  const missing: string[] = [];
  const categoryRows = new Map<CollectionCategory, { row: RegistrationCollectionRow; amount: number }[]>();
  for (const category of ["base", "bronze", "silver", "gold", "big_bass", "insurance"] as const) categoryRows.set(category, []);
  const membershipRows: { row: RegistrationCollectionRow; amount: number }[] = [];
  let membershipMismatchCount = 0;

  for (const row of scopedRows) {
    const membershipReconciliation = reconcileMembershipRow(row);
    membershipMismatchCount += Number(membershipReconciliation.mismatch);
  }

  for (const row of paidRows) {
    for (const [category, , configuredCents] of configuredLines) {
      const amount = categoryAmount(row, category, configuredCents);
      if (amount === null) missing.push(`${itemNames[category]} pricing (correct the stored registration price snapshot)`);
      else if (amount > 0) categoryRows.get(category)?.push({ row, amount });
    }
    const insuranceAmount = categoryAmount(row, "insurance", REGISTRATION_PRICING.insurance * 100);
    if (insuranceAmount === null) missing.push("Insurance Pot pricing (correct the stored registration price snapshot)");
    else if (insuranceAmount > 0) categoryRows.get("insurance")?.push({ row, amount: insuranceAmount });
    const membership = reconcileMembershipRow(row).collectedAmountCents;
    if (membership > 0) membershipRows.push({ row, amount: membership });
    if (row.registration_source === "walk_up" && hasMalformedWalkUpPaymentSnapshot(row, rowFunds(row))) missing.push("One or more walk-up payment snapshots differ from face-value selections (review payment records)");
  }

  const lines: TournamentCollectionLine[] = configuredLines.map(([key, label, configuredCents]) => {
    const entries = categoryRows.get(key) ?? [];
    const online = entries.filter(({ row }) => row.registration_source !== "walk_up");
    return { key, label, count: entries.length, onlineCount: online.length, inPersonCount: entries.length - online.length, configuredFeeCents: configuredCents, feeCents: configuredCents, totalCents: entries.reduce((sum, entry) => sum + entry.amount, 0) };
  });
  const membershipOnline = membershipRows.filter(({ row }) => row.registration_source !== "walk_up");
  const membershipRevenueCents = membershipRows.reduce((sum, entry) => sum + entry.amount, 0);
  const collectedMembershipCount = membershipRevenueCents / (REGISTRATION_PRICING.annualMembership * 100);
  lines.push({ key: "membership", label: "Memberships Collected", count: collectedMembershipCount, onlineCount: membershipOnline.reduce((sum, entry) => sum + membershipCount(entry.row), 0), inPersonCount: membershipRows.filter(({ row }) => row.registration_source === "walk_up").reduce((sum, entry) => sum + membershipCount(entry.row), 0), configuredFeeCents: REGISTRATION_PRICING.annualMembership * 100, feeCents: REGISTRATION_PRICING.annualMembership * 100, totalCents: membershipRevenueCents });
  const insuranceEntries = categoryRows.get("insurance") ?? [];
  const insuranceOnline = insuranceEntries.filter(({ row }) => row.registration_source !== "walk_up");
  lines.push({ key: "insurance", label: "Insurance Pot", count: insuranceEntries.length, onlineCount: insuranceOnline.length, inPersonCount: insuranceEntries.length - insuranceOnline.length, configuredFeeCents: REGISTRATION_PRICING.insurance * 100, feeCents: REGISTRATION_PRICING.insurance * 100, totalCents: insuranceEntries.reduce((sum, entry) => sum + entry.amount, 0) });

  const totalTournamentPayoutFundsCents = lines.filter((line) => line.key !== "membership").reduce((sum, line) => sum + line.totalCents, 0);
  const onlineRegistrationFundsCents = paidRows.filter((row) => row.registration_source !== "walk_up").reduce((sum, row) => sum + rowFunds(row), 0);
  const walkUpFundsByMethod: WalkUpFundsByMethod = { cash: 0, card: 0, other: 0 };
  for (const row of paidRows.filter((entry) => entry.registration_source === "walk_up")) walkUpFundsByMethod[walkUpMethod(row)] += rowFunds(row);
  const totalRegistrationFundsCollectedCents = totalTournamentPayoutFundsCents + membershipRevenueCents;
  const membershipReconciliationWarnings = membershipMismatchCount > 0
    ? [`Membership reconciliation requires review: ${membershipMismatchCount} classification/payment mismatches.`]
    : [];
  return { tournamentId, lines, totalCollectedCents: totalRegistrationFundsCollectedCents, totalTournamentPayoutFundsCents, membershipRevenueCents, membershipMismatchCount, membershipReconciliationWarnings, totalRegistrationFundsCollectedCents, onlineRegistrationFundsCents, walkUpFundsByMethod, paidEntries: paidRows.length, confirmedPaidEntries: confirmedRows.length, registrationsNeedingReview, morningCandidates: buildMorningCandidates(tournamentId, confirmedRows, importedRows), missing: [...new Set(missing)] };

  function rowFunds(row: RegistrationCollectionRow) {
    const payout = (["base", "bronze", "silver", "gold", "big_bass", "insurance"] as const).reduce((sum, category) => {
      const configured = category === "base" ? REGISTRATION_OPTION_CONFIG.tournament_entry.priceCents : category === "big_bass" ? REGISTRATION_OPTION_CONFIG.big_bass.priceCents : category === "insurance" ? REGISTRATION_PRICING.insurance * 100 : REGISTRATION_OPTION_CONFIG[category].priceCents;
      return sum + (categoryAmount(row, category, configured) ?? 0);
    }, 0);
    return payout + reconcileMembershipRow(row).collectedAmountCents;
  }
}

function buildMorningCandidates(tournamentId: string, registrations: readonly RegistrationCollectionRow[], importedRows: readonly ImportedCollectionRow[]): MorningCollectionCandidate[] {
  const scopedRegistrations = registrations.filter((row) => row.tournament_id === tournamentId);
  return importedRows.filter((row) => row.tournament_id === tournamentId && row.participation_status === "participated").map((row) => {
    const normalizedEntry = normalizeEntryName(row.team_name);
    const matches = row.registration_id ? scopedRegistrations.filter((registration) => registration.id === row.registration_id) : scopedRegistrations.filter((registration) => normalizeRegistrationName(registration) === normalizedEntry);
    const registration = matches.length === 1 ? matches[0] : null;
    const onlineCategories: CollectionCategory[] = registration ? ["base", ...(registration.member_pot ? [registration.member_pot] : []), ...(registration.big_bass ? ["big_bass" as const] : []), ...(registration.insurance ? ["insurance" as const] : [])] : [];
    return { key: row.id, entryName: row.team_name, matchStatus: matches.length === 1 ? "matched" : matches.length > 1 ? "ambiguous" : "unmatched", registrationId: registration?.id ?? null, matchingRegistrationIds: matches.flatMap((match) => match.id ? [match.id] : []), onlineCategories };
  });
}

export function normalizeEntryName(value: string): string {
  return value.toLowerCase().replace(/\bteam\b/g, " ").replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).sort().join(" ");
}

export function applyMorningCollectionReview(summary: TournamentCollectionSummary, review: MorningCollectionReview): TournamentCollectionLine[] {
  return summary.lines.map((line) => {
    if (line.key === "insurance" || line.key === "membership") return line;
    const inPersonCount = summary.morningCandidates.filter((candidate) => review[candidate.key]?.confirmed && review[candidate.key]?.categories.includes(line.key) && !candidate.onlineCategories.includes(line.key)).length;
    return { ...line, inPersonCount, count: line.onlineCount + inPersonCount, totalCents: line.totalCents + inPersonCount * line.configuredFeeCents };
  });
}

function normalizeRegistrationName(row: RegistrationCollectionRow): string {
  return normalizeEntryName([row.angler1_name, row.angler2_name].filter(Boolean).join(" / "));
}
