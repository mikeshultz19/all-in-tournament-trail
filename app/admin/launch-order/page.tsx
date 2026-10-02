import Link from "next/link";

import AdminPanel from "@/components/admin/AdminPanel";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import { getTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";
import { launchFlightLabel } from "@/lib/launch-order";

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
    <AdminPanel className="overflow-hidden p-0"><table className="w-full text-left text-sm"><thead className="border-b border-white/15 bg-black/30 text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400"><tr><th className="px-4 py-3">Reg #</th><th className="px-4 py-3">Participants</th><th className="px-4 py-3">Flight</th><th className="px-4 py-3">Boat #</th><th className="px-4 py-3">Weight</th></tr></thead><tbody className="divide-y divide-white/10">{rows.map((row) => <tr key={row.id}><td className="px-4 py-3 font-black text-[#D4A017]">#{row.boatNumber ?? "—"}</td><td className="px-4 py-3 font-bold text-white">{row.angler1.displayName}{row.angler2 ? ` / ${row.angler2.displayName}` : ""}</td><td className="px-4 py-3 font-bold text-white">{launchFlightLabel(row.assignedBoatNumber as number)}</td><td className="px-4 py-3 text-lg font-black text-white">{row.assignedBoatNumber}</td><td aria-label={`Blank weight for boat ${row.assignedBoatNumber}`} className="h-12 min-w-28 border-l border-white/10 px-4 py-3">&nbsp;</td></tr>)}{!rows.length ? <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">No Boat Numbers have been assigned yet.</td></tr> : null}</tbody></table></AdminPanel>
  </div>;
}
