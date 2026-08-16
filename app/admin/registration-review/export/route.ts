import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";
import { getTournamentByIdentifier } from "@/lib/tournaments";

export const dynamic = "force-dynamic";

function csv(value: string | number | boolean | null) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function cents(value: number | null) { return value === null ? null : (value / 100).toFixed(2); }
function slug(value: string) { return value.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export async function GET(request: Request) {
  await requireAdminUser();
  const identifier = new URL(request.url).searchParams.get("tournament");
  const tournament = identifier ? await getTournamentByIdentifier(identifier) : null;
  if (!tournament) return new Response("A valid tournament is required.", { status: 400, headers: { "cache-control": "private, no-store" } });
  const rows = await getTournamentRegistrationRoster(tournament.id);
  const header = ["registration_id","registration_period","registration_timestamp","registration_type","angler_1_first_name","angler_1_last_name","angler_1_membership","angler_2_first_name","angler_2_last_name","angler_2_membership","member_benefits_eligible","entry_type","big_bass","member_pot","insurance_pot","entry_amount","membership_amount","big_bass_amount","member_pot_amount","insurance_amount","processing_fee","total_paid","payment_status","check_in_status"];
  const body = rows.map((row) => [row.registrationKey,"early_online",row.registeredAt,row.registrationType,row.angler1.firstName,row.angler1.lastName,row.angler1.membership,row.angler2?.firstName ?? null,row.angler2?.lastName ?? null,row.angler2?.membership ?? null,row.memberBenefitsEligible,row.entryType,row.bigBass,row.memberPot,row.insurance,cents(row.entryAmountCents),cents(row.membershipAmountCents),cents(row.bigBassAmountCents),cents(row.memberPotAmountCents),cents(row.insuranceAmountCents),cents(row.processingFeeCents),cents(row.totalPaidCents),row.paymentStatus,row.checkedInAt ? "checked_in" : "not_checked_in"].map(csv).join(","));
  const date = new Date(tournament.tournament_date).toISOString().slice(0, 10);
  return new Response([header.map(csv).join(","), ...body].join("\r\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="AITT-${slug(tournament.name)}-Registration-Roster-${date}.csv"`, "cache-control": "private, no-store" } });
}
