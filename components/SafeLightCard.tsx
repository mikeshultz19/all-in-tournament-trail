import type { SafeLightViewModel } from "@/lib/tournament-view-model";
import TournamentInfoIcon from "@/components/TournamentInfoIcon";

interface SafeLightCardProps {
  safeLight: SafeLightViewModel;
  compact?: boolean;
}

export default function SafeLightCard({ safeLight, compact = false }: SafeLightCardProps) {
  return (
    <section aria-labelledby="safe-light-heading" className={`border border-[#4A3A12] bg-[#111111] ${compact ? "p-5" : "p-6"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <TournamentInfoIcon src="/icons/sun-safe-light.svg" className="size-8 text-[#D4A017] sm:size-9" />
          <h2 id="safe-light-heading" className="text-sm font-black uppercase tracking-[0.14em] text-[#D4A017]">Estimated Safe Light</h2>
        </div>
        {safeLight.isOverridden && <span className="border border-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-300">Adjusted by Tournament Officials</span>}
      </div>
      <p className={`${compact ? "mt-2 text-xl" : "mt-3 text-2xl"} font-black text-white`}>{compact ? safeLight.time : `Approximately ${safeLight.time}`}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{compact ? "Sunrise" : "Fort Worth sunrise"}: {safeLight.officialSunrise}</p>
      {safeLight.publicOverrideReason && <p className="mt-3 border-l-2 border-[#D4A017] pl-3 text-sm text-neutral-300">{safeLight.publicOverrideReason}</p>}
      {!compact && <><p className="mt-4 text-sm leading-6 text-neutral-300">Be on the water and prepared to launch before this time.</p><p className="text-sm leading-6 text-neutral-400">Final launch timing is determined by Tournament Officials.</p></>}
    </section>
  );
}
