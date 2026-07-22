import type { TournamentEntrySummary } from "@/lib/public-early-entry";

type EarlyRegistrationStatsProps = TournamentEntrySummary & { unavailable?: boolean };

const primaryStats = [
  ["Total Entries", "totalEntries"],
  ["Big Bass", "bigBassEntries"],
  ["Insurance Pot", "insurancePotEntries"],
  ["Bronze Pot", "bronzeEntries"],
  ["Silver Pot", "silverEntries"],
  ["Gold Pot", "goldEntries"],
] as const;

const entryTypeStats = [
  ["Solo Entries", "soloEntries"],
  ["Team Entries", "teamEntries"],
] as const;

export default function EarlyRegistrationStats({ unavailable = false, ...summary }: EarlyRegistrationStatsProps) {
  return (
    <section aria-labelledby="early-registration-status-heading" className="mt-6 border-t border-white/10 pt-5">
      <div className="flex items-center gap-3">
        <h4 id="early-registration-status-heading" className="shrink-0 text-[10px] font-black uppercase tracking-[0.16em] text-red-500 sm:text-xs">Early Registration Status</h4>
        <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-red-700/70 to-transparent" />
      </div>
      {unavailable ? (
        <p className="mt-4 border border-[#4A3A12] bg-[#0D0D0D] px-4 py-5 text-center text-sm text-zinc-400" role="status">Early registration statistics are temporarily unavailable.</p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {primaryStats.map(([label, key]) => (
              <div key={key} className="min-w-0 border border-[#4A3A12] bg-[#0D0D0D] px-3 py-3 text-center transition-colors hover:border-[#9A741A]">
                <dt className="break-words text-[8px] font-black uppercase tracking-[0.1em] text-zinc-200 sm:text-[9px]">{label}</dt>
                <dd className="mt-1 text-xl font-black leading-none text-[#D4A017] sm:text-2xl">{summary[key]}</dd>
              </div>
            ))}
          </dl>
          <dl className="mt-2 grid grid-cols-2 gap-2">
            {entryTypeStats.map(([label, key]) => (
              <div key={key} className="flex min-w-0 items-center justify-between gap-2 border border-white/10 bg-[#0B0B0B] px-3 py-2.5">
                <dt className="break-words text-[8px] font-black uppercase tracking-[0.1em] text-zinc-300 sm:text-[9px]">{label}</dt>
                <dd className="shrink-0 text-lg font-black leading-none text-white">{summary[key]}</dd>
              </div>
            ))}
          </dl>
          {summary.totalEntries === 0 && <p className="mt-3 text-center text-xs text-zinc-500">Be the first to register online.</p>}
        </>
      )}
    </section>
  );
}
