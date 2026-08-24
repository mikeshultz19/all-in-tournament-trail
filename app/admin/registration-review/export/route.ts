import { requireAdminUser } from "@/lib/admin-auth";
import { filterTournamentRegistrationRosterRows, getTournamentRegistrationRoster, type RegistrationRosterFilter } from "@/lib/tournament-registration-roster";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import { formatRosterGeneratedAt } from "@/lib/tournament-time";

export const dynamic = "force-dynamic";

function csv(value: string | number | boolean | null) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function slug(value: string) { return value.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export async function GET(request: Request) {
  await requireAdminUser();
  const searchParams = new URL(request.url).searchParams;
  const identifier = searchParams.get("tournament");
  const tournament = identifier ? await getTournamentByIdentifier(identifier) : null;
  if (!tournament) return new Response("A valid tournament is required.", { status: 400, headers: { "cache-control": "private, no-store" } });
  const filter = searchParams.get("filter") === "needs_review" || searchParams.get("filter") === "walk_ups" || searchParams.get("filter") === "check_ins"
    ? searchParams.get("filter")
    : "all";
  const search = searchParams.get("search")?.trim() ?? "";
  const rows = filterTournamentRegistrationRosterRows(
    await getTournamentRegistrationRoster(tournament.id),
    filter as RegistrationRosterFilter,
    search,
  );
  const generatedAt = formatRosterGeneratedAt(new Date());
  const header = ["registration_id","boat_number","registration_type","angler_1_name","angler_2_name","angler_1_member_status","angler_2_member_status","member_pots","insurance","big_bass","registered_at","needs_review","roster_generated_at"];
  const body = rows.map((row) => [row.registrationKey,row.boatNumber,row.registrationType,row.angler1.displayName,row.angler2?.displayName ?? null,row.angler1.memberStatus,row.angler2?.memberStatus ?? null,row.memberPot ? title(row.memberPot) : "None",row.insurance ? "Yes" : "No",row.bigBass ? "Yes" : "No",row.registeredAt,row.needsReview ? "Needs Review" : "",generatedAt].map(csv).join(","));
  const date = new Date(tournament.tournament_date).toISOString().slice(0, 10);
  return new Response([header.map(csv).join(","), ...body].join("\r\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="AITT-${slug(tournament.name)}-Registration-Roster-${date}.csv"`, "cache-control": "private, no-store" } });
}

function title(value: string) { return value[0].toUpperCase() + value.slice(1); }
