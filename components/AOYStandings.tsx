import Link from "next/link";
import { aoyStandings } from "@/data/aoyStandings";
import { getUpcomingTournaments } from "@/data/tournaments";

export default function AOYStandings() {
  const upcomingSchedule = getUpcomingTournaments().slice(0, 3);
  const topThree = [...aoyStandings]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  return (
    <section className="bg-black px-4 pb-8 pt-4 sm:px-6">
      <div className="mx-auto grid max-w-[1300px] gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        {/* AOY Standings */}
        <article className="overflow-hidden border border-[#8f762f]/60 bg-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#171717] px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-500">
                Points Race
              </p>

              <h2 className="mt-1 text-xl font-black uppercase tracking-wide text-white">
                AOY Standings
              </h2>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9aa4a]">
              Top 3
            </span>
          </div>

          <div className="grid grid-cols-[52px_minmax(0,1fr)_76px_88px] border-b border-white/10 bg-black px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500 sm:grid-cols-[58px_minmax(0,1fr)_90px_100px] sm:px-4">
            <span>Place</span>
            <span>Angler</span>
            <span className="text-center">Events</span>
            <span className="text-right">Points</span>
          </div>

          <div>
            {topThree.map((standing) => (
              <div
                key={`${standing.rank}-${standing.team}`}
                className="grid grid-cols-[52px_minmax(0,1fr)_76px_88px] items-center border-b border-white/5 px-3 py-3 last:border-b-0 sm:grid-cols-[58px_minmax(0,1fr)_90px_100px] sm:px-4"
              >
                <div>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center border text-xs font-black ${
                      standing.rank === 1
                        ? "border-[#c9aa4a] bg-[#c9aa4a] text-black"
                        : "border-white/15 bg-black text-white"
                    }`}
                  >
                    {standing.rank}
                  </span>
                </div>

                <p className="truncate pr-2 text-sm font-bold uppercase tracking-wide text-white">
                  {standing.team}
                </p>

                <p className="text-center text-sm font-semibold text-neutral-400">
                  {standing.eventsFished}
                </p>

                <p className="text-right text-sm font-black tabular-nums text-[#c9aa4a]">
                  {standing.points.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-white/10 bg-[#171717] px-4 py-3">
            <span
              aria-disabled="true"
              className="inline-flex min-h-9 cursor-not-allowed items-center justify-center border border-[#8f762f]/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-600"
            >
              View Full Standings
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </span>
          </div>
        </article>

        {/* Upcoming Schedule */}
        <article className="overflow-hidden border border-[#8f762f]/60 bg-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#171717] px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-500">
                2026–2027 Season
              </p>

              <h2 className="mt-1 text-xl font-black uppercase tracking-wide text-white">
                Upcoming Schedule
              </h2>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9aa4a]">
              Next 3
            </span>
          </div>

          <div className="grid grid-cols-[64px_minmax(0,1fr)_160px] border-b border-white/10 bg-black px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-500 sm:grid-cols-[76px_minmax(0,1fr)_190px] sm:px-4">
            <span>Stop</span>
            <span>Lake</span>
            <span className="text-right">Date</span>
          </div>

          <div>
            {upcomingSchedule.map((event, index) => (
              <div
                key={event.slug}
                className="grid grid-cols-[64px_minmax(0,1fr)_160px] items-center border-b border-white/5 px-3 py-4 last:border-b-0 sm:grid-cols-[76px_minmax(0,1fr)_190px] sm:px-4"
              >
                <span className="inline-flex h-8 w-10 items-center justify-center border border-[#8f762f]/60 bg-black text-xs font-black text-[#c9aa4a]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className="truncate pr-3 text-sm font-black uppercase tracking-wide text-white sm:text-base">
                  {event.lake}
                </p>

                <p className="text-right text-xs font-semibold text-neutral-300 sm:text-sm">
                  {new Date(`${event.date}T12:00:00`).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 bg-[#171717] px-4 py-3">
            <p className="hidden text-[10px] uppercase tracking-[0.12em] text-neutral-500 sm:block">
              All tournaments are scheduled for Sunday.
            </p>

            <Link
              href="/schedule"
              className="inline-flex min-h-9 items-center justify-center border border-[#c9aa4a] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9aa4a] transition hover:bg-[#c9aa4a] hover:text-black"
            >
              View Full Schedule
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
