import type { RegistrationBackupRow } from "./google-sheets";
import { DisasterRecoveryStageError } from "./processor";

export type RegistrationDbRow = Record<string, unknown> & {
  id: string;
  boat_number: number | null;
  registered_at: string;
  updated_at: string;
  registration_status: string;
  registration_source: string;
  registration_type: string;
  angler1_name: string;
  angler2_name: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  identity_review_status: string;
  checked_in_at: string | null;
};

type RegistrationQuery = {
  select(fields: string): RegistrationQuery;
  eq(field: string, value: unknown): RegistrationQuery;
  lte(field: string, value: unknown): RegistrationQuery;
  gte(field: string, value: unknown): RegistrationQuery;
  single(): Promise<{ data: RegistrationDbRow | null; error: Error | null }>;
};

export type RegistrationLoaderClient = { from(table: string): RegistrationQuery };

export async function loadRegistrationRows(supabase: RegistrationLoaderClient, registrationId: string): Promise<{ current: RegistrationBackupRow; change: RegistrationBackupRow }> {
  const { data, error } = await supabase.from("tournament_registrations")
    .select("id,boat_number,registered_at,updated_at,registration_status,registration_source,registration_type,angler1_name,angler2_name,participant_contact_snapshot,membership_snapshot,big_bass,member_pot,insurance,price_snapshot,payment_method,payment_reference,identity_review_status,checked_in_at")
    .eq("id", registrationId)
    .single();
  if (error || !data) throw new DisasterRecoveryStageError("SUPABASE_REGISTRATION_LOAD_FAILED");

  const contacts = Array.isArray(data.participant_contact_snapshot) ? data.participant_contact_snapshot as Array<Record<string, string>> : [];
  const memberships = Array.isArray(data.membership_snapshot) ? data.membership_snapshot as Array<Record<string, string>> : [];
  const snapshot = data.price_snapshot as { lineItems?: Array<{ code?: string; priceCents?: number }> ; totalCents?: number } | null;
  const line = (code: string) => snapshot?.lineItems?.find((item) => item.code === code)?.priceCents ?? null;
  const current: RegistrationBackupRow = {
    "Registration ID": data.id, "Registration Number": data.boat_number, "Registration Timestamp": data.registered_at,
    "Registration Status": data.registration_status, Source: data.registration_source === "walk_up" ? "Walk-Up" : "Online", "Team or Solo": data.registration_type === "team" ? "Team" : "Solo",
    "Angler 1 Name": data.angler1_name, "Angler 1 Phone": contacts[0]?.phone ?? "", "Angler 1 Email": contacts[0]?.email ?? "", "Angler 1 Membership Status": memberships[0]?.resolvedClassification ?? memberships[0]?.submittedClassification ?? "Needs Review",
    "Angler 2 Name": data.angler2_name ?? "", "Angler 2 Phone": contacts[1]?.phone ?? "", "Angler 2 Email": contacts[1]?.email ?? "", "Angler 2 Membership Status": memberships[1]?.resolvedClassification ?? memberships[1]?.submittedClassification ?? "",
    "Base Entry": line("base_entry"), Bronze: line("bronze"), Silver: line("silver"), Gold: line("gold"), "Big Bass": line("big_bass"), Insurance: line("insurance"), "Amount Collected": snapshot?.totalCents ?? null,
    "Payment Method": data.payment_method ?? "", "Payment Status": data.payment_reference ? "Paid" : "Needs Review", "Payment Reference": data.payment_reference ?? "", "Review Status": data.identity_review_status, "Check-In Status": data.checked_in_at ? "Checked In" : "Pending Check-In", "Last Updated": data.updated_at,
  };
  return { current, change: { ...current, "Changed At": data.updated_at } };
}
