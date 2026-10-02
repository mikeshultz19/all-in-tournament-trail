import Link from "next/link";

import PrintRegistrationRosterButton from "@/components/admin/PrintRegistrationRosterButton";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import { getTournamentRegistrationRoster } from "@/lib/tournament-registration-roster";

export const dynamic = "force-dynamic";

export default async function LaunchOrderPrintPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  await requireAdminUser();
  const { tournament: requestedTournament } = await searchParams;
  const tournament = requestedTournament ? await getTournamentByIdentifier(requestedTournament) : null;
  if (!tournament) return <p className="p-6 text-black">A valid tournament is required.</p>;
  const rows = (await getTournamentRegistrationRoster(tournament.id)).filter((row) => row.assignedBoatNumber !== null && row.assignedBoatNumber !== undefined).sort((left, right) => (left.assignedBoatNumber ?? Number.MAX_SAFE_INTEGER) - (right.assignedBoatNumber ?? Number.MAX_SAFE_INTEGER));

  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-white text-black print:static print:z-auto print:overflow-visible"><style>{`@page { size: portrait; margin: 0.5in; }`}</style><main className="mx-auto max-w-3xl px-5 py-6 print:max-w-none print:p-0">
    <div className="mb-6 flex gap-2 print:hidden"><PrintRegistrationRosterButton /><Link href={`/admin/launch-order?tournament=${encodeURIComponent(tournament.id)}`} className={adminButtonStyles("secondary", "border-black/20 text-black hover:text-black")}>Back to Launch Order</Link></div>
    <header className="border-b-2 border-black pb-4"><p className="text-sm font-black tracking-[0.22em]">AITT</p><h1 className="mt-2 text-2xl font-black uppercase">Launch Order by Boat Number</h1><p className="mt-1 text-sm font-bold">{tournament.name}</p></header>
    <table className="mt-5 w-full border-collapse text-left text-sm"><thead className="border-b-2 border-black"><tr><th className="px-3 py-2">Reg #</th><th className="px-3 py-2">Participants</th><th className="px-3 py-2">Boat #</th><th className="px-3 py-2">Weight</th></tr></thead><tbody className="divide-y divide-black/20">{rows.map((row) => <tr key={row.id}><td className="px-3 py-2 font-black">#{row.boatNumber ?? "—"}</td><td className="px-3 py-2 font-bold">{row.angler1.displayName}{row.angler2 ? ` / ${row.angler2.displayName}` : ""}</td><td className="px-3 py-2 text-lg font-black">{row.assignedBoatNumber}</td><td aria-label={`Blank weight for boat ${row.assignedBoatNumber}`} className="h-10 min-w-24 border-l border-black/20 px-3 py-2">&nbsp;</td></tr>)}{!rows.length ? <tr><td colSpan={4} className="px-3 py-8 text-center text-black/60">No Boat Numbers have been assigned yet.</td></tr> : null}</tbody></table>
  </main></div>;
}
