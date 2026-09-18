import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import { getTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";
import { buildRegistrationWorkbook } from "@/lib/registration-spreadsheet";

export const dynamic = "force-dynamic";

function slug(value: string) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: Request) {
  await requireAdminUser();
  const identifier = new URL(request.url).searchParams.get("tournament");
  const tournament = identifier ? await getTournamentByIdentifier(identifier) : null;
  if (!tournament) {
    return new Response("A valid tournament is required.", { status: 400, headers: { "cache-control": "private, no-store" } });
  }

  // Disaster recovery deliberately ignores UI search, filters, and pagination.
  const rows = await getTournamentRegistrationRoster(tournament.id);
  const body = await buildRegistrationWorkbook(rows, {
    tournamentName: tournament.name,
    tournamentDate: tournament.tournament_date,
  });
  const date = new Date(tournament.tournament_date).toISOString().slice(0, 10);
  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="AITT-${slug(tournament.name)}-Registration-Roster-${date}.xlsx"`,
      "cache-control": "private, no-store",
    },
  });
}
