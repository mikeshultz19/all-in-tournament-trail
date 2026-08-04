import { REGISTRATION_OPTION_CONFIG, REGISTRATION_PRICING } from "@/data/registration";
import { INSURANCE_POT_ENTRY_FEE_CENTS } from "@/lib/insurance-pot";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

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

export type MorningCollectionCandidate = {
  key: string;
  entryName: string;
  matchStatus: "matched" | "ambiguous" | "unmatched";
  registrationId: string | null;
  matchingRegistrationIds: string[];
  onlineCategories: CollectionCategory[];
};

export type MorningCollectionReview = Record<string, { confirmed: boolean; categories: CollectionCategory[] }>;

export type TournamentCollectionSummary = {
  tournamentId: string;
  lines: TournamentCollectionLine[];
  totalCollectedCents: number;
  confirmedPaidEntries: number;
  registrationsNeedingReview: number;
  morningCandidates: MorningCollectionCandidate[];
  missing: string[];
};

export type RegistrationCollectionRow = {
  tournament_id: string;
  id?: string;
  registration_type?: "team" | "solo";
  angler1_name?: string;
  angler2_name?: string | null;
  payment_reference: string | null;
  identity_review_status: string;
  member_pot: "bronze" | "silver" | "gold" | null;
  big_bass: boolean;
  price_snapshot: unknown;
};

export type ImportedCollectionRow = {
  id: string;
  tournament_id: string;
  registration_id?: string | null;
  team_name: string;
  participation_status: string;
};

const configuredLines = [
  ["base", "Base Entries", REGISTRATION_OPTION_CONFIG.tournament_entry.priceCents],
  ["bronze", "Bronze Entries", REGISTRATION_OPTION_CONFIG.bronze.priceCents],
  ["silver", "Silver Entries", REGISTRATION_OPTION_CONFIG.silver.priceCents],
  ["gold", "Gold Entries", REGISTRATION_OPTION_CONFIG.gold.priceCents],
  ["big_bass", "Big Bass Entries", REGISTRATION_OPTION_CONFIG.big_bass.priceCents],
] as const;

export function buildTournamentCollectionSummary(tournamentId: string, rows: readonly RegistrationCollectionRow[], insuranceResult?: TournamentInsurancePotResultRecord, importedRows: readonly ImportedCollectionRow[] = []): TournamentCollectionSummary {
  const paidRows = rows.filter((row) => row.tournament_id === tournamentId && Boolean(row.payment_reference));
  const confirmedRows = paidRows.filter((row) => row.identity_review_status !== "review_required");
  const registrationsNeedingReview = paidRows.length - confirmedRows.length;
  const missing: string[] = [];
  const selectedRows = { base: confirmedRows, bronze: confirmedRows.filter((row) => row.member_pot === "bronze"), silver: confirmedRows.filter((row) => row.member_pot === "silver"), gold: confirmedRows.filter((row) => row.member_pot === "gold"), big_bass: confirmedRows.filter((row) => row.big_bass) };
  const itemNames = { base: "Tournament Entry", bronze: "Bronze Pot", silver: "Silver Pot", gold: "Gold Pot", big_bass: "Big Bass" } as const;
  const lines: TournamentCollectionLine[] = configuredLines.map(([key, label, configuredFee]) => {
    const categoryRows = selectedRows[key];
    const storedFees = categoryRows.map((row) => getStoredLineItemCents(row.price_snapshot, itemNames[key]));
    if (storedFees.some((fee) => fee === null)) missing.push(`${label} pricing (correct the stored registration price snapshot)`);
    const validFees = storedFees.filter((fee): fee is number => fee !== null);
    const uniqueFees = new Set(validFees);
    return { key, label, count: categoryRows.length, onlineCount: categoryRows.length, inPersonCount: 0, configuredFeeCents: configuredFee, feeCents: uniqueFees.size <= 1 ? (validFees[0] ?? configuredFee) : null, totalCents: validFees.reduce((sum, fee) => sum + fee, 0) };
  });
  const membershipFees = confirmedRows.flatMap((row) => getStoredMembershipCents(row.price_snapshot));
  lines.push({ key: "membership", label: "Memberships", count: membershipFees.length, onlineCount: membershipFees.length, inPersonCount: 0, configuredFeeCents: REGISTRATION_PRICING.annualMembership * 100, feeCents: REGISTRATION_PRICING.annualMembership * 100, totalCents: membershipFees.reduce((sum, fee) => sum + fee, 0) });
  if (insuranceResult) lines.push({ key: "insurance", label: "Insurance Pot", count: insuranceResult.entry_count, onlineCount: 0, inPersonCount: insuranceResult.entry_count, configuredFeeCents: INSURANCE_POT_ENTRY_FEE_CENTS, feeCents: INSURANCE_POT_ENTRY_FEE_CENTS, totalCents: insuranceResult.entry_count * INSURANCE_POT_ENTRY_FEE_CENTS });
  if (registrationsNeedingReview > 0) missing.push(`Registration review (${registrationsNeedingReview} paid ${registrationsNeedingReview === 1 ? "entry requires" : "entries require"} confirmation)`);
  if (!insuranceResult) missing.push("Insurance Pot entry count (save the AITT Insurance Pot calculation, including zero entries)");
  const morningCandidates = buildMorningCandidates(tournamentId, confirmedRows, importedRows);
  return { tournamentId, lines, totalCollectedCents: lines.reduce((sum, line) => sum + line.totalCents, 0), confirmedPaidEntries: confirmedRows.length, registrationsNeedingReview, morningCandidates, missing };
}

function buildMorningCandidates(tournamentId: string, registrations: readonly RegistrationCollectionRow[], importedRows: readonly ImportedCollectionRow[]): MorningCollectionCandidate[] {
  const scopedRegistrations = registrations.filter((row) => row.tournament_id === tournamentId);
  return importedRows.filter((row) => row.tournament_id === tournamentId && row.participation_status === "participated").map((row) => {
    const normalizedEntry = normalizeEntryName(row.team_name);
    const matches = row.registration_id
      ? scopedRegistrations.filter((registration) => registration.id === row.registration_id)
      : scopedRegistrations.filter((registration) => normalizeRegistrationName(registration) === normalizedEntry);
    const registration = matches.length === 1 ? matches[0] : null;
    const onlineCategories: CollectionCategory[] = registration ? ["base", ...(registration.member_pot ? [registration.member_pot] : []), ...(registration.big_bass ? ["big_bass" as const] : [])] : [];
    return { key: row.id, entryName: row.team_name, matchStatus: matches.length === 1 ? "matched" : matches.length > 1 ? "ambiguous" : "unmatched", registrationId: registration?.id ?? null, matchingRegistrationIds: matches.flatMap((match) => match.id ? [match.id] : []), onlineCategories };
  });
}

export function normalizeEntryName(value: string): string {
  return value.toLowerCase().replace(/\bteam\b/g, " ").replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).sort().join(" ");
}

export function applyMorningCollectionReview(summary: TournamentCollectionSummary, review: MorningCollectionReview): TournamentCollectionLine[] {
  return summary.lines.map((line) => {
    if (line.key === "insurance") return line;
    const inPersonCount = summary.morningCandidates.filter((candidate) => review[candidate.key]?.confirmed && review[candidate.key]?.categories.includes(line.key) && !candidate.onlineCategories.includes(line.key)).length;
    return { ...line, inPersonCount, count: line.onlineCount + inPersonCount, totalCents: line.totalCents + inPersonCount * line.configuredFeeCents };
  });
}

function normalizeRegistrationName(row: RegistrationCollectionRow): string {
  return normalizeEntryName([row.angler1_name, row.angler2_name].filter(Boolean).join(" / "));
}

function getStoredLineItemCents(snapshot: unknown, itemName: string): number | null {
  if (!snapshot || typeof snapshot !== "object" || !("lineItems" in snapshot) || !Array.isArray(snapshot.lineItems)) return null;
  const item = snapshot.lineItems.find((candidate): candidate is { name: string; priceCents: number } => Boolean(candidate && typeof candidate === "object" && "name" in candidate && candidate.name === itemName && "priceCents" in candidate && Number.isInteger(candidate.priceCents) && candidate.priceCents >= 0));
  return item?.priceCents ?? null;
}

function getStoredMembershipCents(snapshot: unknown): number[] {
  if (!snapshot || typeof snapshot !== "object" || !("lineItems" in snapshot) || !Array.isArray(snapshot.lineItems)) return [];
  return snapshot.lineItems.flatMap((candidate) => candidate && typeof candidate === "object" && "name" in candidate && typeof candidate.name === "string" && candidate.name.endsWith(" Membership") && "priceCents" in candidate && Number.isInteger(candidate.priceCents) && Number(candidate.priceCents) >= 0 ? [Number(candidate.priceCents)] : []);
}
