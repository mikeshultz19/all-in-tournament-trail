import { getDisasterRecoveryStatus } from "@/lib/disaster-recovery/status";
import { rebuildDisasterRecoveryTournamentAction } from "@/app/admin/registration-review/disaster-recovery-actions";

export default async function DisasterRecoveryStatus({ tournamentId }: { tournamentId: string }) {
  const status = await getDisasterRecoveryStatus();
  return <section className="mt-5 border border-white/10 bg-[#111] p-4" aria-label="Disaster recovery backup status">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-sm font-bold uppercase text-white">Disaster-Recovery Backup</h2><p className="mt-1 text-xs text-neutral-400">Google confirmation is required before a registration is considered backed up.</p></div>
      <div className={`text-xs font-bold uppercase ${!status.available || status.failed || !status.lastSuccessfulAt ? "text-amber-300" : "text-emerald-300"}`}>{!status.available ? "Setup Required" : status.failed ? "Backup Failing" : status.pending ? "Backup Pending" : status.lastSuccessfulAt ? "Backup Healthy" : "Not Yet Synchronized"}</div>
    </div>
    <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4"><Metric label="Last success" value={status.lastSuccessfulAt ? new Date(status.lastSuccessfulAt).toLocaleString() : "None"} /><Metric label="Pending" value={status.pending} /><Metric label="Failed" value={status.failed} /><Metric label="Status" value={status.available ? "Connected" : "Unavailable"} /></dl>
    {!status.available ? <p className="mt-3 text-xs text-amber-200">Configure the staging Google Sheet and server-only credentials before enabling synchronization.</p> : null}
    <p className="mt-3 text-xs text-amber-200">Manual synchronization is disabled until the authenticated GitHub Actions dispatch path is rehearsed.</p>
    <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled className="cursor-not-allowed border border-white/10 px-3 py-2 text-xs font-bold uppercase text-neutral-500">Sync Now unavailable</button><form action={rebuildDisasterRecoveryTournamentAction}><input type="hidden" name="tournamentId" value={tournamentId} /><button className="border border-white/20 px-3 py-2 text-xs font-bold uppercase text-white">Rebuild Tournament Backup</button></form></div>
  </section>;
}

function Metric({ label, value }: { label: string; value: string | number }) { return <div><dt className="uppercase text-neutral-500">{label}</dt><dd className="mt-1 font-bold text-white">{value}</dd></div>; }
