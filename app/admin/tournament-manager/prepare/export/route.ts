import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import { getTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";

function csv(value: string) { return `"${value.replaceAll('"', '""')}"`; }

export async function GET(request: NextRequest) {
  await requireAdminUser();
  const identifier = request.nextUrl.searchParams.get("tournament");
  const tournament = identifier ? await getTournamentByIdentifier(identifier) : null;
  if (!tournament) return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
  const rows = await getTournamentRegistrationRoster(tournament.id);
  const lines = [["Entry Type","Boater","Partner","Membership Status","Entry Status","Payment Status","Side Pots"], ...rows.map((row) => [row.registrationType,row.boater,row.partner ?? "",row.membershipStatus,row.entryStatus,row.paymentStatus,row.sidePots.join("; ")])].map((row) => row.map(csv).join(","));
  return new NextResponse(lines.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${tournament.slug}-weighfish-roster.csv"`, "Cache-Control": "private, no-store" } });
}
