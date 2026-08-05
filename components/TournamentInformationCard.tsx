import Link from "next/link";
import { CalendarClock, CircleSlash2 } from "lucide-react";

export default function TournamentInformationCard() {
  return (
    <section
      aria-labelledby="tournament-information-heading"
      className="rounded-lg border border-[#8f762f]/60 bg-[#101010] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
    >
      <h2
        id="tournament-information-heading"
        className="text-sm font-black uppercase tracking-[0.1em] text-white"
      >
        Tournament Information
      </h2>

      <div className="mt-3 space-y-4 border-t border-white/10 pt-4">
        <div className="flex items-start gap-3">
          <CircleSlash2
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-red-500"
          />

          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-red-400">
              Non-Members
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-300">
              Off limits begin Monday at 12:00 AM before the tournament.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CalendarClock
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#D4A017]"
          />

          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#D4A017]">
              Members
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-300">
              Registered members are eligible for one practice day: Friday
              or Saturday immediately before the tournament.
            </p>

            <p className="mt-1 text-[0.68rem] leading-4 text-neutral-500">
              One day only. Not both days.
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/rules#practice-rules"
        className="mt-4 inline-flex text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#D4A017] transition hover:text-yellow-300"
      >
        View Complete Practice Rules →
      </Link>
    </section>
  );
}