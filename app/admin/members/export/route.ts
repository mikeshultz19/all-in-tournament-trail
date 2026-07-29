import { requireAdminUser } from "@/lib/admin-auth";
import { listMembersForSeason } from "@/lib/memberships";
import { getActiveSeason } from "@/lib/seasons";

function csv(value: string | null): string {
  const text = value ?? "";
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  try {
    await requireAdminUser();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const season = await getActiveSeason();
  if (!season) return new Response("No active season.", { status: 404 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const { members } = await listMembersForSeason(season.id, {
    search: url.searchParams.get("q") ?? "",
    active: status === "active" ? true : status === "inactive" ? false : null,
    pageSize: 10000,
  });
  const header = [
    "First Name", "Last Name", "Email", "Phone", "Status",
    "Membership Season", "First Eligible Tournament",
    "Membership Effective Date",
  ];
  const rows = members.map((member) => [
    member.first_name, member.last_name, member.email, member.phone,
    member.membership_status, member.season_name,
    member.first_eligible_tournament_name, member.effective_date,
  ].map(csv).join(","));

  return new Response([header.map(csv).join(","), ...rows].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aitt-members-${season.slug}.csv"`,
    },
  });
}
