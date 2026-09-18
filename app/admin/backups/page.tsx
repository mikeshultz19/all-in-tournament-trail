import AdminPanel from "@/components/admin/AdminPanel";
import DisasterRecoveryStatus from "@/components/admin/DisasterRecoveryStatus";
import { requireAdminUser } from "@/lib/admin-auth";
import { getActiveSeasonSchedule, getNextUpcomingTournament } from "@/lib/tournaments";

export const dynamic = "force-dynamic";

export default async function AdminBackupsPage({ searchParams }: { searchParams: Promise<{ tournament?: string }> }) {
  await requireAdminUser();
  const params = await searchParams;
  const [tournaments, currentTournament] = await Promise.all([getActiveSeasonSchedule(), getNextUpcomingTournament()]);
  const selectedTournament = tournaments.find((item) => item.id === params.tournament || item.slug === params.tournament)
    ?? currentTournament
    ?? tournaments[0]
    ?? null;

  return <>
    <header>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">AITT Admin Center</p>
      <h1 className="mt-2 text-4xl font-black uppercase text-white">Backups</h1>
      <p className="mt-3 max-w-3xl text-neutral-400">Monitor the independent disaster-recovery registration backup and run authorized synchronization or rebuild actions.</p>
    </header>

    <form className="mt-6 flex max-w-2xl gap-3">
      <select name="tournament" defaultValue={selectedTournament?.id ?? ""} className="min-h-11 flex-1 border border-white/15 bg-[#111] px-3 text-sm text-white" aria-label="Select tournament for backup rebuild">
        <option value="">Select a tournament</option>
        {tournaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <button className="min-h-11 border border-[#D4A017]/60 px-5 text-xs font-black uppercase tracking-[0.1em] text-[#D4A017]">View Backup</button>
    </form>

    {selectedTournament ? <>
      <AdminPanel accent className="mt-6 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4A017]">Selected Tournament</p>
        <h2 className="mt-2 text-2xl font-black uppercase text-white">{selectedTournament.name}</h2>
        <p className="mt-2 text-xs text-neutral-500">Rebuild queues authoritative registration state; it does not create registrations or payments.</p>
      </AdminPanel>
      <DisasterRecoveryStatus tournamentId={selectedTournament.id} />
    </> : <p className="mt-6 border border-white/10 bg-[#111] p-5 text-neutral-400">No active-season tournaments are available.</p>}
  </>;
}
