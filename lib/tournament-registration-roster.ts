import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface TournamentRegistrationRosterRow {
  id: string;
  registrationKey: string;
  registeredAt: string;
  registrationType: "team" | "solo";
  boater: string;
  partner: string | null;
  membershipStatus: string;
  membershipDetails: string[];
  entryStatus: string;
  paymentStatus: string;
  sidePots: string[];
  registrationTotalCents: number | null;
  checkedInAt: string | null;
  checkedInByAdminId: string | null;
}

export interface TournamentRegistrationRosterSummary {
  total: number;
  paid: number;
  needReview: number;
}

type RegistrationMembershipPurchaseRow = {
  tournament_id: string;
  payment_reference: string | null;
  price_snapshot: {
    lineItems?: Array<{ code?: string }>;
  } | null;
};

export function countPurchasedRegistrationMemberships(
  rows: readonly Pick<RegistrationMembershipPurchaseRow, "payment_reference" | "price_snapshot">[],
): number {
  return rows.reduce((total, row) => {
    if (!row.payment_reference) return total;
    return total + (row.price_snapshot?.lineItems ?? []).filter((item) => item.code === "annual_membership").length;
  }, 0);
}

type RegistrationRow = {
  id: string;
  registration_key: string;
  registered_at: string;
  registration_type: "team" | "solo";
  angler1_name: string;
  angler2_name: string | null;
  big_bass: boolean;
  member_pot: "bronze" | "silver" | "gold" | null;
  insurance: boolean;
  payment_reference: string | null;
  membership_snapshot: Array<{
    status?: string;
    eligibleForTournament?: boolean;
    resolvedClassification?: string;
  }> | null;
  price_snapshot: { totalCents?: number } | null;
  identity_review_status: string;
  checked_in_at: string | null;
  checked_in_by_admin_id: string | null;
};

function toRosterRow(row: RegistrationRow): TournamentRegistrationRosterRow {
  const memberships = row.membership_snapshot ?? [];
  const membershipStatus = memberships.length > 0 && memberships.every((item) => item.status === "active" && item.eligibleForTournament === true)
    ? "Member"
    : memberships.some((item) => item.status === "active") ? "Mixed" : "Non-Member";
  const sidePots = [row.big_bass ? "Big Bass" : null, row.member_pot ? `${row.member_pot[0].toUpperCase()}${row.member_pot.slice(1)}` : null, row.insurance ? "Insurance" : null].filter((value): value is string => Boolean(value));
  return {
    id: row.id,
    registrationKey: row.registration_key,
    registeredAt: row.registered_at,
    registrationType: row.registration_type,
    boater: row.angler1_name,
    partner: row.angler2_name,
    membershipStatus,
    membershipDetails: memberships.map((membership, index) => {
      const classification = membership.resolvedClassification === "current" ? "Member" : "Non-Member";
      return `Angler ${index + 1}: ${classification}`;
    }),
    entryStatus: row.identity_review_status === "review_required" ? "Needs Review" : "Confirmed",
    paymentStatus: row.payment_reference ? "Paid" : "Needs Review",
    sidePots,
    registrationTotalCents: Number.isInteger(row.price_snapshot?.totalCents)
      ? row.price_snapshot!.totalCents!
      : null,
    checkedInAt: row.checked_in_at,
    checkedInByAdminId: row.checked_in_by_admin_id,
  };
}

export function summarizeTournamentRegistrationRoster(rows: readonly TournamentRegistrationRosterRow[]): TournamentRegistrationRosterSummary {
  return {
    total: rows.length,
    paid: rows.filter((row) => row.paymentStatus === "Paid").length,
    needReview: rows.filter((row) => row.entryStatus === "Needs Review" || row.paymentStatus !== "Paid").length,
  };
}

export async function getTournamentRegistrationRoster(tournamentId: string): Promise<TournamentRegistrationRosterRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tournament_registrations")
    .select("id,registration_key,registered_at,registration_type,angler1_name,angler2_name,big_bass,member_pot,insurance,payment_reference,membership_snapshot,price_snapshot,identity_review_status,checked_in_at,checked_in_by_admin_id")
    .eq("tournament_id", tournamentId)
    .order("registered_at", { ascending: true });
  if (error) throw new Error("Tournament registration roster could not be loaded.", { cause: error });
  return ((data ?? []) as RegistrationRow[]).map(toRosterRow);
}

export async function listTournamentRegistrationRosterSummaries(tournamentIds: readonly string[]): Promise<Record<string, TournamentRegistrationRosterSummary>> {
  if (tournamentIds.length === 0) return {};
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tournament_registrations")
    .select("tournament_id,payment_reference,identity_review_status")
    .in("tournament_id", [...tournamentIds]);
  if (error) throw new Error("Tournament registration summaries could not be loaded.", { cause: error });
  const result = Object.fromEntries(tournamentIds.map((id) => [id, { total: 0, paid: 0, needReview: 0 }]));
  for (const row of data ?? []) {
    const summary = result[row.tournament_id];
    if (!summary) continue;
    summary.total += 1;
    if (row.payment_reference) summary.paid += 1;
    if (!row.payment_reference || row.identity_review_status === "review_required") summary.needReview += 1;
  }
  return result;
}

export async function listTournamentPurchasedMembershipCounts(
  tournamentIds: readonly string[],
): Promise<Record<string, number>> {
  if (tournamentIds.length === 0) return {};
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournament_registrations")
    .select("tournament_id,payment_reference,price_snapshot")
    .in("tournament_id", [...tournamentIds]);
  if (error) throw new Error("Tournament registration membership purchases could not be loaded.", { cause: error });

  const rows = (data ?? []) as RegistrationMembershipPurchaseRow[];
  return Object.fromEntries(tournamentIds.map((tournamentId) => [
    tournamentId,
    countPurchasedRegistrationMemberships(rows.filter((row) => row.tournament_id === tournamentId)),
  ]));
}
