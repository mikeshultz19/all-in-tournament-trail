import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface TournamentRegistrationRosterRow {
  id: string;
  registrationType: "team" | "solo";
  boater: string;
  partner: string | null;
  membershipStatus: string;
  entryStatus: string;
  paymentStatus: string;
  sidePots: string[];
}

export interface TournamentRegistrationRosterSummary {
  total: number;
  paid: number;
  needReview: number;
}

type RegistrationRow = {
  id: string;
  registration_type: "team" | "solo";
  angler1_name: string;
  angler2_name: string | null;
  big_bass: boolean;
  member_pot: "bronze" | "silver" | "gold" | null;
  insurance: boolean;
  payment_reference: string | null;
  membership_snapshot: Array<{ status?: string; eligibleForTournament?: boolean }> | null;
  identity_review_status: string;
};

function toRosterRow(row: RegistrationRow): TournamentRegistrationRosterRow {
  const memberships = row.membership_snapshot ?? [];
  const membershipStatus = memberships.length > 0 && memberships.every((item) => item.status === "active" && item.eligibleForTournament === true)
    ? "Member"
    : memberships.some((item) => item.status === "active") ? "Mixed" : "Non-Member";
  const sidePots = [row.big_bass ? "Big Bass" : null, row.member_pot ? `${row.member_pot[0].toUpperCase()}${row.member_pot.slice(1)}` : null, row.insurance ? "Insurance" : null].filter((value): value is string => Boolean(value));
  return {
    id: row.id,
    registrationType: row.registration_type,
    boater: row.angler1_name,
    partner: row.angler2_name,
    membershipStatus,
    entryStatus: row.identity_review_status === "review_required" ? "Needs Review" : "Confirmed",
    paymentStatus: row.payment_reference ? "Paid" : "Needs Review",
    sidePots,
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
    .select("id,registration_type,angler1_name,angler2_name,big_bass,member_pot,insurance,payment_reference,membership_snapshot,identity_review_status")
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
