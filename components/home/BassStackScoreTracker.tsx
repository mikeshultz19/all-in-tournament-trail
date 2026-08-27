import Link from "next/link";
import { RadioTower } from "lucide-react";

export default function BassStackScoreTracker() {
  return (
    <section
      aria-labelledby="bass-stack-score-tracker-heading"
      className="border border-white/10 bg-[#111111]"
    >
      <div className="flex items-center border-b border-red-900/40 bg-gradient-to-r from-red-950/55 via-[#17100f] to-black px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <h2 id="bass-stack-score-tracker-heading" className="shrink-0">
            <span className="inline-flex min-w-[48px] items-center justify-center rounded border border-[#c9aa4a]/70 bg-black/70 px-2 py-1 text-center text-[0.48rem] font-black uppercase leading-none tracking-[0.08em] text-[#c9aa4a] sm:min-w-[54px] sm:px-2.5 sm:text-[0.55rem]">
              Bass
              <br />
              Stack
            </span>
            <span className="sr-only">Texas Boat Works Live Score Tracker</span>
          </h2>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="inline-flex shrink-0 items-center rounded-full border border-red-400/70 bg-red-600 px-1.5 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.16em] text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                LIVE
              </span>
              <span className="relative min-w-0 pb-1 font-black uppercase tracking-[0.08em] text-white text-[0.72rem] leading-tight sm:text-sm">
                Score Tracker
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-red-600/80 via-[#c9aa4a]/50 to-transparent"
                />
              </span>
            </div>
            <p className="min-w-0 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-neutral-500 sm:text-[0.65rem]">
              Presented by <span className="font-black tracking-[-0.01em] text-[#0095DF]">Texas Boat Works</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="grid grid-cols-[3rem_minmax(0,1fr)_5.5rem] border-y border-white/10 text-[0.62rem] font-black uppercase tracking-[0.12em] text-neutral-500">
          <span className="py-2">Place</span>
          <span className="py-2">Angler / Team</span>
          <span className="py-2 text-right">Total Weight</span>
        </div>

        <div className="grid grid-cols-[3rem_minmax(0,1fr)_5.5rem] items-center py-3 text-sm text-neutral-400">
          <span aria-hidden="true">—</span>
          <span className="font-bold text-white">Squaw Creek — Feb 14, 2027</span>
          <span className="text-right font-black tabular-nums text-[#D4A017]">—</span>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-neutral-400">
            <RadioTower aria-hidden="true" className="size-4 shrink-0 text-red-500" />
            REAL-TIME UPDATES
          </p>
          <Link
            href="/bass-stack/results"
            className="inline-flex min-h-11 shrink-0 items-center text-xs font-black uppercase tracking-[0.1em] text-[#D4A017] transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
          >
            View All →
          </Link>
        </div>
      </div>
    </section>
  );
}
