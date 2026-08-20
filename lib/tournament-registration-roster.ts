import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RegistrationMembershipLabel = "Current Member" | "Purchased Membership / Joining" | "Non-Member";

export interface RegistrationParticipantContactSnapshot {
  firstName: string; lastName: string; streetAddress: string; city: string;
  state: string; zipCode: string; email: string; phone: string;
  membership: "current" | "joining" | "non-member";
}

export interface RegistrationRosterAngler {
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  membership: RegistrationMembershipLabel;
  eligibleForTournament: boolean;
  email: string | null;
  phone: string | null;
}

export interface TournamentRegistrationRosterRow {
  id: string;
  registrationKey: string;
  registeredAt: string;
  registrationPeriod: "Early Online" | "Walk-Up";
  registrationSource: "online" | "walk_up";
  boatNumber: number | null;
  paymentMethod: "online" | "cash" | "card" | "other" | null;
  participantContactSnapshot: RegistrationParticipantContactSnapshot[];
  registrationType: "team" | "solo";
  angler1: RegistrationRosterAngler;
  angler2: RegistrationRosterAngler | null;
  memberBenefitsEligible: boolean;
  entryType: "Free Entry" | "Base Entry";
  bigBass: boolean;
  memberPot: "bronze" | "silver" | "gold" | null;
  insurance: boolean;
  entryAmountCents: number | null;
  membershipAmountCents: number | null;
  bigBassAmountCents: number | null;
  memberPotAmountCents: number | null;
  insuranceAmountCents: number | null;
  processingFeeCents: number | null;
  totalPaidCents: number | null;
  paymentStatus: "Paid" | "Needs Review";
  needsReview: boolean;
  identityReviewStatus: string;
  checkedInAt: string | null;
  checkedInByAdminId: string | null;
  // Compatibility fields used by existing tournament preparation summaries/views.
  boater: string;
  partner: string | null;
  membershipStatus: string;
  membershipDetails: string[];
  entryStatus: string;
  sidePots: string[];
  registrationTotalCents: number | null;
}

export interface TournamentRegistrationRosterSummary {
  total: number;
  paid: number;
  needReview: number;
}

type PriceLineItem = { code?: string; name?: string; priceCents?: number };
type PriceSnapshot = {
  lineItems?: PriceLineItem[];
  cardProcessingFeeCents?: number;
  totalCents?: number;
};
type MembershipSnapshot = {
  submittedClassification?: string;
  resolvedClassification?: string;
  status?: string;
  eligibleForTournament?: boolean;
};
type RegistrationRow = {
  id: string; registration_key: string; registered_at: string;
  registration_type: "team" | "solo"; angler1_id: string | null; angler2_id: string | null;
  angler1_name: string; angler2_name: string | null; big_bass: boolean;
  member_pot: "bronze" | "silver" | "gold" | null; insurance: boolean;
  payment_reference: string | null; membership_snapshot: MembershipSnapshot[] | null;
  price_snapshot: PriceSnapshot | null; identity_review_status: string;
  checked_in_at: string | null; checked_in_by_admin_id: string | null;
  boat_number: number | null; registration_source: "online" | "walk_up";
  payment_method: "online" | "cash" | "card" | "other" | null;
  participant_contact_snapshot: RegistrationParticipantContactSnapshot[] | null;
  registration_status: "active" | "cancelled";
  online_payment_state: "completed" | null; square_payment_id: string | null;
};
type AnglerNameRow = { id: string; first_name: string; last_name: string; display_name: string; email: string | null; phone: string | null };

function validCents(value: unknown): number | null {
  return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : null;
}

function lineAmount(snapshot: PriceSnapshot | null, predicate: (item: PriceLineItem) => boolean): number | null {
  if (!Array.isArray(snapshot?.lineItems)) return null;
  const matches = snapshot.lineItems.filter(predicate);
  if (matches.length === 0) return 0;
  const amounts = matches.map((item) => validCents(item.priceCents));
  return amounts.some((amount) => amount === null) ? null : amounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0);
}

function membershipLabel(snapshot: MembershipSnapshot | undefined): RegistrationMembershipLabel {
  if (snapshot?.submittedClassification === "joining") return "Purchased Membership / Joining";
  if (snapshot?.resolvedClassification === "current" || snapshot?.submittedClassification === "current") return "Current Member";
  return "Non-Member";
}

function makeAngler(name: string, id: string | null, snapshot: MembershipSnapshot | undefined, names: Map<string, AnglerNameRow>): RegistrationRosterAngler {
  const canonical = id ? names.get(id) : undefined;
  return {
    firstName: canonical?.first_name ?? null,
    lastName: canonical?.last_name ?? null,
    displayName: canonical?.display_name || name,
    membership: membershipLabel(snapshot),
    eligibleForTournament: snapshot?.eligibleForTournament === true,
    email: canonical?.email ?? null,
    phone: canonical?.phone ?? null,
  };
}

export function areRegistrationMemberBenefitsEligible(registrationType: "team" | "solo", memberships: readonly { eligibleForTournament: boolean }[]): boolean {
  const requiredCount = registrationType === "team" ? 2 : 1;
  return memberships.length === requiredCount && memberships.every((membership) => membership.eligibleForTournament);
}

function toRosterRow(row: RegistrationRow, names: Map<string, AnglerNameRow>): TournamentRegistrationRosterRow {
  const memberships = row.membership_snapshot ?? [];
  const angler1 = makeAngler(row.angler1_name, row.angler1_id, memberships[0], names);
  const angler2 = row.registration_type === "team" && row.angler2_name
    ? makeAngler(row.angler2_name, row.angler2_id, memberships[1], names) : null;
  const memberBenefitsEligible = areRegistrationMemberBenefitsEligible(row.registration_type, [angler1, angler2].filter((angler): angler is RegistrationRosterAngler => Boolean(angler)));
  const entryAmountCents = lineAmount(row.price_snapshot, (item) => item.code === "base_entry" || item.name === "Tournament Entry");
  const membershipAmountCents = lineAmount(row.price_snapshot, (item) => item.code === "annual_membership" || Boolean(item.name?.endsWith(" Membership")));
  const bigBassAmountCents = lineAmount(row.price_snapshot, (item) => item.code === "big_bass" || item.name === "Big Bass");
  const memberPotAmountCents = lineAmount(row.price_snapshot, (item) => item.code === row.member_pot || item.name === `${row.member_pot?.[0]?.toUpperCase() ?? ""}${row.member_pot?.slice(1) ?? ""} Pot`);
  const insuranceAmountCents = lineAmount(row.price_snapshot, (item) => item.code === "insurance" || item.name === "Insurance Pot");
  const paymentStatus = row.registration_source === "walk_up"
    ? row.payment_reference ? "Paid" : "Needs Review"
    : row.online_payment_state === "completed" && row.square_payment_id ? "Paid" : "Needs Review";
  const needsReview = row.identity_review_status === "review_required" || paymentStatus !== "Paid";
  const sidePots = [row.big_bass ? "Big Bass" : null, row.member_pot ? `${row.member_pot[0].toUpperCase()}${row.member_pot.slice(1)}` : null, row.insurance ? "Insurance" : null].filter((value): value is string => Boolean(value));
  const membershipDetails = [angler1, angler2].filter((angler): angler is RegistrationRosterAngler => Boolean(angler)).map((angler, index) => `Angler ${index + 1}: ${angler.membership}`);
  return {
    id: row.id, registrationKey: row.registration_key, registeredAt: row.registered_at,
    registrationPeriod: row.registration_source === "walk_up" ? "Walk-Up" : "Early Online",
    registrationSource: row.registration_source, boatNumber: row.boat_number,
    paymentMethod: row.payment_method, registrationType: row.registration_type,
    participantContactSnapshot: row.participant_contact_snapshot ?? [],
    angler1, angler2, memberBenefitsEligible,
    entryType: entryAmountCents === 0 ? "Free Entry" : "Base Entry",
    bigBass: row.big_bass, memberPot: row.member_pot, insurance: row.insurance,
    entryAmountCents, membershipAmountCents, bigBassAmountCents, memberPotAmountCents,
    insuranceAmountCents, processingFeeCents: validCents(row.price_snapshot?.cardProcessingFeeCents),
    totalPaidCents: validCents(row.price_snapshot?.totalCents), paymentStatus, needsReview,
    identityReviewStatus: row.identity_review_status, checkedInAt: row.checked_in_at,
    checkedInByAdminId: row.checked_in_by_admin_id,
    boater: angler1.displayName, partner: angler2?.displayName ?? null,
    membershipStatus: memberBenefitsEligible ? "Member" : angler1.eligibleForTournament || angler2?.eligibleForTournament ? "Mixed" : "Non-Member",
    membershipDetails, entryStatus: needsReview ? "Needs Review" : "Confirmed", sidePots,
    registrationTotalCents: validCents(row.price_snapshot?.totalCents),
  };
}

export function summarizeTournamentRegistrationRoster<T extends Pick<TournamentRegistrationRosterRow, "paymentStatus" | "entryStatus"> & { needsReview?: boolean }>(rows: readonly T[]): TournamentRegistrationRosterSummary {
  return { total: rows.length, paid: rows.filter((row) => row.paymentStatus === "Paid").length, needReview: rows.filter((row) => row.needsReview ?? (row.entryStatus === "Needs Review" || row.paymentStatus !== "Paid")).length };
}

export async function getTournamentRegistrationRoster(tournamentId: string): Promise<TournamentRegistrationRosterRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tournament_registrations")
    .select("id,registration_key,registered_at,registration_type,angler1_id,angler2_id,angler1_name,angler2_name,big_bass,member_pot,insurance,payment_reference,membership_snapshot,participant_contact_snapshot,price_snapshot,identity_review_status,checked_in_at,checked_in_by_admin_id,boat_number,registration_source,payment_method,registration_status,online_payment_state,square_payment_id")
    .eq("tournament_id", tournamentId).eq("registration_status", "active").order("registered_at", { ascending: true });
  if (error) throw new Error("Tournament registration roster could not be loaded.", { cause: error });
  const rows = (data ?? []) as RegistrationRow[];
  const ids = [...new Set(rows.flatMap((row) => [row.angler1_id, row.angler2_id]).filter((id): id is string => Boolean(id)))];
  let names = new Map<string, AnglerNameRow>();
  if (ids.length) {
    const result = await supabase.from("anglers").select("id,first_name,last_name,display_name,email,phone").in("id", ids);
    if (result.error) throw new Error("Registration angler names could not be loaded.", { cause: result.error });
    names = new Map(((result.data ?? []) as AnglerNameRow[]).map((angler) => [angler.id, angler]));
  }
  return rows.map((row) => toRosterRow(row, names));
}

export async function listTournamentRegistrationRosterSummaries(tournamentIds: readonly string[]): Promise<Record<string, TournamentRegistrationRosterSummary>> {
  if (!tournamentIds.length) return {};
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tournament_registrations").select("tournament_id,payment_reference,identity_review_status,registration_source,online_payment_state,square_payment_id").in("tournament_id", [...tournamentIds]).eq("registration_status", "active");
  if (error) throw new Error("Tournament registration summaries could not be loaded.", { cause: error });
  const result = Object.fromEntries(tournamentIds.map((id) => [id, { total: 0, paid: 0, needReview: 0 }]));
  for (const row of data ?? []) { const summary = result[row.tournament_id]; if (!summary) continue; const paid = row.registration_source === "walk_up" ? Boolean(row.payment_reference) : row.online_payment_state === "completed" && Boolean(row.square_payment_id); summary.total += 1; if (paid) summary.paid += 1; if (!paid || row.identity_review_status === "review_required") summary.needReview += 1; }
  return result;
}

type RegistrationMembershipPurchaseRow = { payment_reference: string | null; price_snapshot: { lineItems?: Array<{ code?: string }> } | null };
export function countPurchasedRegistrationMemberships(rows: readonly RegistrationMembershipPurchaseRow[]): number {
  return rows.reduce((total, row) => !row.payment_reference ? total : total + (row.price_snapshot?.lineItems ?? []).filter((item) => item.code === "annual_membership").length, 0);
}
export async function listTournamentPurchasedMembershipCounts(tournamentIds: readonly string[]): Promise<Record<string, number>> {
  if (!tournamentIds.length) return {};
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tournament_registrations").select("tournament_id,payment_reference,price_snapshot").in("tournament_id", [...tournamentIds]);
  if (error) throw new Error("Tournament registration membership purchases could not be loaded.", { cause: error });
  return Object.fromEntries(tournamentIds.map((tournamentId) => [tournamentId, countPurchasedRegistrationMemberships((data ?? []).filter((row) => row.tournament_id === tournamentId) as RegistrationMembershipPurchaseRow[])]));
}
