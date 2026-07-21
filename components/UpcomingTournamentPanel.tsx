import type { watchPageData } from "@/data/watch";

type Tournament = typeof watchPageData.tournament;
export default function UpcomingTournamentPanel({ tournament }: { tournament: Tournament }) {
  return (
    <aside className="h-full border border-[#5B4715] bg-[#131313] p-5 sm:p-6 lg:p-7">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-500">Up Next</p>
      <div className="mt-4 border-b border-[#5B4715] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D4A017]">{tournament.label}</p>
        <h2 className="mt-2 text-2xl font-black uppercase leading-tight text-white">{tournament.lake}</h2>
        <p className="mt-3 font-bold text-white">{tournament.date}</p>
        <p className="mt-1 text-sm text-zinc-400">{tournament.venue}</p>
        <p className="text-sm text-zinc-400">{tournament.location}</p>
      </div>

      <section className="pt-6">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#D4A017]">Live Broadcast</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-300">Watch the official tournament weigh-in live from this page. Broadcast availability and start time may vary based on tournament conditions.</p>
        <div className="mt-5 border-l-2 border-red-600 bg-black/25 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-white">Broadcast Status</p>
          <p className="mt-1 text-sm text-zinc-400">Offline — Check back on tournament day</p>
        </div>
      </section>

      <section className="mt-6 border-t border-[#5B4715] pt-6">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#D4A017]">What You’ll See</h3>
        <ul className="mt-4 space-y-2 pl-4 text-sm text-zinc-300 marker:text-red-500">
          <li>Live angler weigh-ins</li>
          <li>Current tournament standings</li>
          <li>Big Bass updates</li>
          <li>Winner announcements</li>
        </ul>
      </section>
    </aside>
  );
}
