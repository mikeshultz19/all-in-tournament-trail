import Link from "next/link";

import AdminPanel from "@/components/admin/AdminPanel";
import LaunchOrderTable from "@/components/admin/LaunchOrderTable";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import { getTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";

export const dynamic = "force-dynamic";

export default async function LaunchOrderPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  await requireAdminUser();
  const { tournament: requestedTournament } = await searchParams;
  const tournament = requestedTournament ? await getTournamentByIdentifier(requestedTournament) : null;
  if (!tournament) return <p className="border border-white/10 bg-[#111] p-5 text-neutral-400">A valid tournament is required.</p>;
  const rows = (await getTournamentRegistrationRoster(tournament.id)).filter((row) => row.assignedBoatNumber !== null && row.assignedBoatNumber !== undefined).sort((left, right) => (left.assignedBoatNumber ?? Number.MAX_SAFE_INTEGER) - (right.assignedBoatNumber ?? Number.MAX_SAFE_INTEGER));

  return <div className="space-y-6">
    <header><p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">Tournament Operations</p><h1 className="mt-2 text-3xl font-black uppercase text-white">Launch Order by Boat Number</h1><p className="mt-2 text-neutral-400">{tournament.name}</p></header>
    <div className="flex flex-wrap gap-3"><Link href={`/admin/launch-order/print?tournament=${encodeURIComponent(tournament.id)}`} target="_blank" className={adminButtonStyles("primary")}>Print / Save PDF</Link><Link href={`/admin?tournament=${encodeURIComponent(tournament.id)}`} className={adminButtonStyles("secondary")}>Back to Dashboard</Link></div>
    <AdminPanel className="overflow-hidden p-0"><LaunchOrderTable rows={rows} /></AdminPanel>
  </div>;
}
