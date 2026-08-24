import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RegistrationMembershipLabel = "Current Member" | "Purchased Membership / Joining" | "Non-Member";
export type RegistrationMemberStatus = "Member" | "Non-Member" | "Needs Review";

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
  memberStatus: RegistrationMemberStatus;
  eligibleForTournament: boolean;
  email: string | null;
  phone: string | null;
}

export interface TournamentRegistrationRosterRow {
  id: string;
  registrationKey: string;
  registeredAt: string;
  angler1Id?: string | null;
  angler2Id?: string | null;
  membershipSnapshot?: readonly MembershipSnapshot[] | null;
  registrationPeriod: "Early Online" | "Walk-Up";
  registrationSource: "online" | "walk_up";
  boatNumber: number | null;
  paymentMethod: "online" | "cash" | "card" | "other" | null;
  participantContactSnapshot: RegistrationParticipantContactSnapshot[];
  registrationType: "team" | "solo";
  angler1: RegistrationRosterAngler;
  angler2: RegistrationRosterAngler | null;
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

export type RegistrationRosterFilter = "all" | "needs_review" | "walk_ups" | "check_ins";

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
type ActiveReviewRow = { registration_id: string };

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

export function deriveRegistrationMemberStatus(
  snapshot: MembershipSnapshot | undefined,
): RegistrationMemberStatus {
  if (!snapshot || !snapshot.resolvedClassification) return "Needs Review";
  return snapshot.status === "active" &&
    snapshot.resolvedClassification === "current"
    ? "Member"
    : "Non-Member";
}

function makeAngler(name: string, id: string | null, snapshot: MembershipSnapshot | undefined, names: Map<string, AnglerNameRow>): RegistrationRosterAngler {
  const canonical = id ? names.get(id) : undefined;
  return {
    firstName: canonical?.first_name ?? null,
    lastName: canonical?.last_name ?? null,
    displayName: canonical?.display_name || name,
    membership: membershipLabel(snapshot),
    memberStatus: deriveRegistrationMemberStatus(snapshot),
    eligibleForTournament: snapshot?.eligibleForTournament === true,
    email: canonical?.email ?? null,
    phone: canonical?.phone ?? null,
  };
}

function toTitleCase(value: string | null | undefined): string {
  const normalized = value?.trim() ?? "";
  if (!normalized) return "";
  return normalized
    .toLocaleLowerCase("en-US")
    .replace(/\b([a-z])/g, (character) => character.toLocaleUpperCase("en-US"));
}

function makeSubmittedAngler(
  submittedName: string,
  submittedContact: RegistrationParticipantContactSnapshot | null | undefined,
  snapshot: MembershipSnapshot | undefined,
): RegistrationRosterAngler {
  const firstName = submittedContact?.firstName?.trim() || "";
  const lastName = submittedContact?.lastName?.trim() || "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim() || submittedName.trim();
  return {
    firstName: toTitleCase(firstName || null) || null,
    lastName: toTitleCase(lastName || null) || null,
    displayName: toTitleCase(displayName || null) || displayName || submittedName,
    membership: membershipLabel(snapshot),
    memberStatus: deriveRegistrationMemberStatus(snapshot),
    eligibleForTournament: snapshot?.eligibleForTournament === true,
    email: submittedContact?.email?.trim() || null,
    phone: submittedContact?.phone?.trim() || null,
  };
}

export function buildRosterAngler(
  name: string,
  id: string | null,
  snapshot: MembershipSnapshot | undefined,
  names: Map<string, AnglerNameRow>,
  submittedContact: RegistrationParticipantContactSnapshot | null | undefined,
  useSubmittedIdentity: boolean,
): RegistrationRosterAngler {
  if (useSubmittedIdentity) {
    return makeSubmittedAngler(name, submittedContact, snapshot);
  }

  return makeAngler(name, id, snapshot, names);
}

async function loadUnresolvedReviewRegistrationIds(
  registrationIds: readonly string[],
): Promise<Set<string>> {
  if (!registrationIds.length) {
    return new Set();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("registration_identity_reviews")
    .select("registration_id")
    .eq("review_status", "review_required")
    .in("registration_id", [...new Set(registrationIds)]);

  if (error) {
    throw new Error("Registration review status could not be loaded.", {
      cause: error,
    });
  }

  return new Set((data ?? []).map((row) => (row as ActiveReviewRow).registration_id));
}

function toRosterRow(
  row: RegistrationRow,
  names: Map<string, AnglerNameRow>,
  unresolvedReviewIds: ReadonlySet<string>,
): TournamentRegistrationRosterRow {
  const memberships = row.membership_snapshot ?? [];
  const useSubmittedIdentity =
    row.identity_review_status === "review_required" ||
    unresolvedReviewIds.has(row.id);
  const angler1 = buildRosterAngler(
    row.angler1_name,
    row.angler1_id,
    memberships[0],
    names,
    row.participant_contact_snapshot?.[0],
    useSubmittedIdentity,
  );
  const angler2 = row.registration_type === "team" && row.angler2_name
    ? buildRosterAngler(
      row.angler2_name,
      row.angler2_id,
      memberships[1],
      names,
      row.participant_contact_snapshot?.[1],
      useSubmittedIdentity,
    )
    : null;
  const entryAmountCents = lineAmount(row.price_snapshot, (item) => item.code === "base_entry" || item.name === "Tournament Entry");
  const membershipAmountCents = lineAmount(row.price_snapshot, (item) => item.code === "annual_membership" || Boolean(item.name?.endsWith(" Membership")));
  const bigBassAmountCents = lineAmount(row.price_snapshot, (item) => item.code === "big_bass" || item.name === "Big Bass");
  const memberPotAmountCents = lineAmount(row.price_snapshot, (item) => item.code === row.member_pot || item.name === `${row.member_pot?.[0]?.toUpperCase() ?? ""}${row.member_pot?.slice(1) ?? ""} Pot`);
  const insuranceAmountCents = lineAmount(row.price_snapshot, (item) => item.code === "insurance" || item.name === "Insurance Pot");
  const paymentStatus = row.registration_source === "walk_up"
    ? row.payment_reference ? "Paid" : "Needs Review"
    : row.online_payment_state === "completed" && row.square_payment_id ? "Paid" : "Needs Review";
  const needsReview =
    row.identity_review_status === "review_required" ||
    unresolvedReviewIds.has(row.id) ||
    paymentStatus !== "Paid";
  const sidePots = [row.big_bass ? "Big Bass" : null, row.member_pot ? `${row.member_pot[0].toUpperCase()}${row.member_pot.slice(1)}` : null, row.insurance ? "Insurance" : null].filter((value): value is string => Boolean(value));
  const membershipDetails = [angler1, angler2].filter((angler): angler is RegistrationRosterAngler => Boolean(angler)).map((angler, index) => `Angler ${index + 1}: ${angler.membership}`);
  return {
    id: row.id, registrationKey: row.registration_key, registeredAt: row.registered_at,
    angler1Id: row.angler1_id, angler2Id: row.angler2_id,
    membershipSnapshot: row.membership_snapshot,
    registrationPeriod: row.registration_source === "walk_up" ? "Walk-Up" : "Early Online",
    registrationSource: row.registration_source, boatNumber: row.boat_number,
    paymentMethod: row.payment_method, registrationType: row.registration_type,
    participantContactSnapshot: row.participant_contact_snapshot ?? [],
    angler1, angler2,
    entryType: entryAmountCents === 0 ? "Free Entry" : "Base Entry",
    bigBass: row.big_bass, memberPot: row.member_pot, insurance: row.insurance,
    entryAmountCents, membershipAmountCents, bigBassAmountCents, memberPotAmountCents,
    insuranceAmountCents, processingFeeCents: validCents(row.price_snapshot?.cardProcessingFeeCents),
    totalPaidCents: validCents(row.price_snapshot?.totalCents), paymentStatus, needsReview,
    identityReviewStatus: row.identity_review_status, checkedInAt: row.checked_in_at,
    checkedInByAdminId: row.checked_in_by_admin_id,
    boater: angler1.displayName, partner: angler2?.displayName ?? null,
    membershipStatus: angler2
      ? `A1: ${angler1.memberStatus} · A2: ${angler2.memberStatus}`
      : angler1.memberStatus,
    membershipDetails, entryStatus: needsReview ? "Needs Review" : "Confirmed", sidePots,
    registrationTotalCents: validCents(row.price_snapshot?.totalCents),
  };
}

export function summarizeTournamentRegistrationRoster<T extends Pick<TournamentRegistrationRosterRow, "paymentStatus" | "entryStatus"> & { needsReview?: boolean }>(rows: readonly T[]): TournamentRegistrationRosterSummary {
  return {
    total: rows.length,
    paid: rows.filter((row) => row.paymentStatus === "Paid").length,
    needReview: rows.filter(
      (row) =>
        row.needsReview === true ||
        row.entryStatus === "Needs Review" ||
        row.paymentStatus !== "Paid",
    ).length,
  };
}

export function registrationMatchesRosterSearch(
  row: TournamentRegistrationRosterRow,
  search: string,
) {
  const normalizedSearch = search.toLocaleLowerCase("en-US");
  const teamName =
    `${row.angler1.displayName} / ${row.angler2?.displayName ?? ""}`.toLocaleLowerCase("en-US");
  const nameMatches =
    teamName.includes(normalizedSearch) ||
    row.angler1.displayName.toLocaleLowerCase("en-US").includes(normalizedSearch) ||
    row.angler2?.displayName.toLocaleLowerCase("en-US").includes(normalizedSearch) === true;
  const boatMatches = /^\d+$/.test(search) && String(row.boatNumber) === search;
  return nameMatches || boatMatches;
}

export function filterTournamentRegistrationRosterRows(
  rows: readonly TournamentRegistrationRosterRow[],
  filter: RegistrationRosterFilter,
  search: string,
): TournamentRegistrationRosterRow[] {
  const filteredRows =
    filter === "needs_review"
      ? rows.filter((row) => row.needsReview)
      : filter === "walk_ups"
        ? rows
            .filter((row) => row.registrationSource === "walk_up")
            .toSorted(
              (left, right) =>
                (left.boatNumber ?? Number.MAX_SAFE_INTEGER) -
                  (right.boatNumber ?? Number.MAX_SAFE_INTEGER) ||
                left.registeredAt.localeCompare(right.registeredAt),
            )
        : filter === "check_ins"
          ? rows.filter((row) => row.checkedInAt === null)
        : [...rows];

  return search.trim()
    ? filteredRows.filter((row) =>
        registrationMatchesRosterSearch(row, search.trim()),
      )
    : filteredRows;
}

export function paginateTournamentRegistrationRosterRows(
  rows: readonly TournamentRegistrationRosterRow[],
  page: number,
  pageSize: 25 | 50 | 100,
) {
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Number.isFinite(page) && page > 0 ? Math.min(page, totalPages) : 1;
  const startIndex = totalRows ? (currentPage - 1) * pageSize : 0;
  const pageRows = rows.slice(startIndex, startIndex + pageSize);
  return {
    pageRows,
    totalRows,
    totalPages,
    currentPage,
    rangeStart: totalRows ? startIndex + 1 : 0,
    rangeEnd: totalRows ? Math.min(startIndex + pageRows.length, totalRows) : 0,
  };
}

export async function getTournamentRegistrationRoster(tournamentId: string): Promise<TournamentRegistrationRosterRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tournament_registrations")
    .select("id,registration_key,registered_at,registration_type,angler1_id,angler2_id,angler1_name,angler2_name,big_bass,member_pot,insurance,payment_reference,membership_snapshot,participant_contact_snapshot,price_snapshot,identity_review_status,checked_in_at,checked_in_by_admin_id,boat_number,registration_source,payment_method,registration_status,online_payment_state,square_payment_id")
    .eq("tournament_id", tournamentId).eq("registration_status", "active").order("registered_at", { ascending: true });
  if (error) throw new Error("Tournament registration roster could not be loaded.", { cause: error });
  const rows = (data ?? []) as RegistrationRow[];
  const unresolvedReviewIds = await loadUnresolvedReviewRegistrationIds(
    rows.map((row) => row.id),
  );
  const ids = [...new Set(rows.flatMap((row) => [row.angler1_id, row.angler2_id]).filter((id): id is string => Boolean(id)))];
  let names = new Map<string, AnglerNameRow>();
  if (ids.length) {
    const result = await supabase.from("anglers").select("id,first_name,last_name,display_name,email,phone").in("id", ids);
    if (result.error) throw new Error("Registration angler names could not be loaded.", { cause: result.error });
    names = new Map(((result.data ?? []) as AnglerNameRow[]).map((angler) => [angler.id, angler]));
  }
  return rows.map((row) => toRosterRow(row, names, unresolvedReviewIds));
}

export async function listTournamentRegistrationRosterSummaries(tournamentIds: readonly string[]): Promise<Record<string, TournamentRegistrationRosterSummary>> {
  if (!tournamentIds.length) return {};
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tournament_registrations").select("id,tournament_id,payment_reference,identity_review_status,registration_source,online_payment_state,square_payment_id").in("tournament_id", [...tournamentIds]).eq("registration_status", "active");
  if (error) throw new Error("Tournament registration summaries could not be loaded.", { cause: error });
  const result = Object.fromEntries(tournamentIds.map((id) => [id, { total: 0, paid: 0, needReview: 0 }]));
  const unresolvedReviewIds = await loadUnresolvedReviewRegistrationIds(
    (data ?? []).map((row) => row.id),
  );
  for (const row of data ?? []) {
    const summary = result[row.tournament_id];
    if (!summary) continue;
    const paid =
      row.registration_source === "walk_up"
        ? Boolean(row.payment_reference)
        : row.online_payment_state === "completed" && Boolean(row.square_payment_id);
    summary.total += 1;
    if (paid) summary.paid += 1;
    if (
      !paid ||
      row.identity_review_status === "review_required" ||
      unresolvedReviewIds.has(row.id)
    ) {
      summary.needReview += 1;
    }
  }
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
