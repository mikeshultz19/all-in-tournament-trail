import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RegistrationHistorySource = "online" | "walk_up";
export type RegistrationHistoryStatus = "active" | "cancelled";

export interface RegistrationHistoryContact {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  phone: string;
  membership: "current" | "joining" | "non-member";
}

export interface RegistrationHistoryReview {
  id: string;
  participantPosition: number;
  participantName: string;
  kind: string;
  status: string;
  reason: string;
  note: string | null;
  createdAt: string;
  resolvedAt: string | null;
  history: Array<{
    previousStatus: string;
    newStatus: string;
    method: string;
    note: string | null;
    createdAt: string;
  }>;
}

export interface AdminRegistrationHistoryRow {
  id: string;
  registrationKey: string;
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  registeredAt: string;
  registrationType: "team" | "solo";
  source: RegistrationHistorySource;
  status: RegistrationHistoryStatus;
  angler1Name: string;
  angler2Name: string | null;
  boatNumber: number | null;
  contacts: RegistrationHistoryContact[];
  membershipSnapshot: Array<Record<string, unknown>>;
  priceSnapshot: {
    lineItems?: Array<{ name?: string; priceCents?: number }>;
    cardProcessingFeeCents?: number;
    totalCents?: number;
  } | null;
  bigBass: boolean;
  memberPot: "bronze" | "silver" | "gold" | null;
  insurance: boolean;
  paymentReference: string | null;
  paymentMethod: string | null;
  onlinePaymentState: string | null;
  squarePaymentId: string | null;
  checkedInAt: string | null;
  identityReviewStatus: string;
  reviews: RegistrationHistoryReview[];
}

export interface RegistrationHistoryFilters {
  search?: string;
  tournamentId?: string;
  source?: "all" | RegistrationHistorySource;
}

type RegistrationDbRow = {
  id: string;
  registration_key: string;
  tournament_id: string;
  registered_at: string;
  registration_type: "team" | "solo";
  registration_source: RegistrationHistorySource;
  registration_status: RegistrationHistoryStatus;
  angler1_name: string;
  angler2_name: string | null;
  boat_number: number | null;
  participant_contact_snapshot: RegistrationHistoryContact[] | null;
  membership_snapshot: Array<Record<string, unknown>> | null;
  price_snapshot: AdminRegistrationHistoryRow["priceSnapshot"];
  big_bass: boolean;
  member_pot: "bronze" | "silver" | "gold" | null;
  insurance: boolean;
  payment_reference: string | null;
  payment_method: string | null;
  online_payment_state: string | null;
  square_payment_id: string | null;
  checked_in_at: string | null;
  identity_review_status: string;
  tournament: { name: string; tournament_date: string };
};

type ReviewDbRow = {
  id: string;
  registration_id: string;
  participant_position: number;
  original_display_name: string;
  review_kind: string;
  review_status: string;
  review_reason: string;
  review_note: string | null;
  created_at: string;
  resolved_at: string | null;
};

type ReviewHistoryDbRow = {
  review_id: string;
  previous_status: string;
  new_status: string;
  resolution_method: string;
  review_note: string | null;
  created_at: string;
};

function searchableText(row: AdminRegistrationHistoryRow): string {
  return [
    row.angler1Name,
    row.angler2Name,
    row.boatNumber,
    ...row.contacts.flatMap((contact) => [
      contact.firstName,
      contact.lastName,
      `${contact.firstName} ${contact.lastName}`,
      contact.email,
      contact.phone,
    ]),
  ]
    .filter((value) => value !== null && value !== undefined)
    .join(" ")
    .toLocaleLowerCase();
}

export function filterRegistrationHistory(
  rows: readonly AdminRegistrationHistoryRow[],
  filters: RegistrationHistoryFilters,
): AdminRegistrationHistoryRow[] {
  const search = filters.search?.trim().toLocaleLowerCase() ?? "";
  const source = filters.source ?? "all";
  return rows.filter(
    (row) =>
      (!filters.tournamentId || row.tournamentId === filters.tournamentId) &&
      (source === "all" || row.source === source) &&
      (!search || searchableText(row).includes(search)),
  );
}

async function readAll<T>(
  requestPage: (from: number, to: number) => Promise<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const result = await requestPage(from, from + pageSize - 1);
    if (result.error) throw result.error;
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

export async function listAllRegistrationHistory(): Promise<AdminRegistrationHistoryRow[]> {
  const supabase = createSupabaseServerClient();
  const registrations = await readAll<RegistrationDbRow>(async (from, to) => {
    const result = await supabase
      .from("tournament_registrations")
      .select("id,registration_key,tournament_id,registered_at,registration_type,registration_source,registration_status,angler1_name,angler2_name,boat_number,participant_contact_snapshot,membership_snapshot,price_snapshot,big_bass,member_pot,insurance,payment_reference,payment_method,online_payment_state,square_payment_id,checked_in_at,identity_review_status,tournament:tournaments!inner(name,tournament_date)")
      .order("registered_at", { ascending: false })
      .range(from, to);
    return { data: result.data as unknown as RegistrationDbRow[] | null, error: result.error };
  });
  const reviews = await readAll<ReviewDbRow>(async (from, to) => {
    const result = await supabase
      .from("registration_identity_reviews")
      .select("id,registration_id,participant_position,original_display_name,review_kind,review_status,review_reason,review_note,created_at,resolved_at")
      .order("created_at", { ascending: true })
      .range(from, to);
    return { data: result.data as ReviewDbRow[] | null, error: result.error };
  });
  const history = await readAll<ReviewHistoryDbRow>(async (from, to) => {
    const result = await supabase
      .from("registration_identity_review_history")
      .select("review_id,previous_status,new_status,resolution_method,review_note,created_at")
      .order("created_at", { ascending: true })
      .range(from, to);
    return { data: result.data as ReviewHistoryDbRow[] | null, error: result.error };
  });
  const historyByReview = new Map<string, ReviewHistoryDbRow[]>();
  for (const item of history) historyByReview.set(item.review_id, [...(historyByReview.get(item.review_id) ?? []), item]);
  const reviewsByRegistration = new Map<string, ReviewDbRow[]>();
  for (const review of reviews) reviewsByRegistration.set(review.registration_id, [...(reviewsByRegistration.get(review.registration_id) ?? []), review]);

  return registrations.map((row) => ({
    id: row.id,
    registrationKey: row.registration_key,
    tournamentId: row.tournament_id,
    tournamentName: row.tournament.name,
    tournamentDate: row.tournament.tournament_date,
    registeredAt: row.registered_at,
    registrationType: row.registration_type,
    source: row.registration_source,
    status: row.registration_status,
    angler1Name: row.angler1_name,
    angler2Name: row.angler2_name,
    boatNumber: row.boat_number,
    contacts: row.participant_contact_snapshot ?? [],
    membershipSnapshot: row.membership_snapshot ?? [],
    priceSnapshot: row.price_snapshot,
    bigBass: row.big_bass,
    memberPot: row.member_pot,
    insurance: row.insurance,
    paymentReference: row.payment_reference,
    paymentMethod: row.payment_method,
    onlinePaymentState: row.online_payment_state,
    squarePaymentId: row.square_payment_id,
    checkedInAt: row.checked_in_at,
    identityReviewStatus: row.identity_review_status,
    reviews: (reviewsByRegistration.get(row.id) ?? []).map((review) => ({
      id: review.id,
      participantPosition: review.participant_position,
      participantName: review.original_display_name,
      kind: review.review_kind,
      status: review.review_status,
      reason: review.review_reason,
      note: review.review_note,
      createdAt: review.created_at,
      resolvedAt: review.resolved_at,
      history: (historyByReview.get(review.id) ?? []).map((item) => ({
        previousStatus: item.previous_status,
        newStatus: item.new_status,
        method: item.resolution_method,
        note: item.review_note,
        createdAt: item.created_at,
      })),
    })),
  }));
}
