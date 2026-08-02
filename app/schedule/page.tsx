import Image from "next/image";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";
import {
  getTournamentImage,
} from "@/data/tournaments";
import {
  getActiveSeasonSchedule,
} from "@/lib/tournaments";
import { getEffectiveTournamentDate } from "@/data/tournaments";
import {
  toPublicTournament,
  type PublicTournamentRecord,
} from "@/lib/tournament-record-adapter";
import { getTournamentDisplay } from "@/lib/tournament-display";

const LAUNCH_REGISTRATION_STATUS = "Registration Closed";

function TournamentRow({ tournament }: { tournament: PublicTournamentRecord }) {
  const thumbnailImage =
    tournament.thumbnailImage ?? getTournamentImage(tournament);
  const display = getTournamentDisplay(tournament);
  const isBassStackChallenge = tournament.tournamentFormat === "bass-stack";

  return (
    <article className="grid gap-5 border-b border-[#4A3A12] px-4 py-6 lg:grid-cols-[180px_minmax(0,1fr)_140px] lg:items-center lg:gap-6 lg:px-5 lg:py-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#D4A017] lg:hidden">
          Lake
        </p>
        <div className="relative h-40 w-full overflow-hidden rounded-md bg-[#111111] lg:h-[104px] lg:w-[180px]">
          <Image
            src={thumbnailImage}
            alt={`${tournament.lake} lake`}
            fill
            sizes="(max-width: 1023px) calc(100vw - 72px), 180px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/90 to-transparent px-3 pb-8 pt-2.5 sm:px-4 sm:pt-3">
            <h3 className="text-sm font-bold uppercase leading-tight tracking-wide text-white">
              {tournament.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#D4A017] lg:hidden">
          About This Tournament
        </p>
        <div className="space-y-2">
          <p className="text-sm leading-6 text-[#B8B8B8]">
            {tournament.description}
          </p>
          {isBassStackChallenge && (
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm leading-6 text-[#D4A017]">
              <span className="inline-flex whitespace-nowrap rounded border border-[#c9aa4a]/70 bg-black/70 px-2 py-0.5 text-[0.58rem] font-black uppercase leading-none tracking-[0.18em] text-[#c9aa4a]">
                BASS STACK
              </span>
              <span>This event is an AITT Bass Stack Challenge.</span>
            </p>
          )}
        </div>
        <span
          className="mt-3 inline-flex border border-neutral-500/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-300"
        >
          {LAUNCH_REGISTRATION_STATUS}
        </span>
        <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-3 border-t border-white/10 pt-4 sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D4A017]">Date</dt>
            <dd className="mt-1 text-xs font-semibold text-[#F2F2F2]"><time dateTime={getEffectiveTournamentDate(tournament)}>{display.date}</time></dd>
          </div>
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D4A017]">Ramp</dt>
            <dd className="mt-1 text-xs font-semibold text-[#F2F2F2]">{display.ramp}</dd>
            <dd className="mt-0.5 text-xs text-[#B8B8B8]">{display.location}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D4A017]">Hours</dt>
            <dd className="mt-1 text-xs font-semibold text-[#F2F2F2]">{display.hours}</dd>
            <dd className="mt-0.5 text-xs text-[#B8B8B8]">{display.stopFishing}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D4A017]">Launch Type</dt>
            <dd className="mt-1 text-xs font-semibold text-[#F2F2F2]">{display.launchType}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D4A017]">Morning Registration</dt>
            <dd className="mt-1 text-xs font-semibold text-[#F2F2F2]">{display.morningRegistration}</dd>
          </div>
        </dl>
      </div>

      <span
        aria-disabled="true"
        className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-sm border border-neutral-700 px-3 py-3 text-center text-xs font-black uppercase tracking-[0.08em] text-neutral-500"
      >
        {LAUNCH_REGISTRATION_STATUS}
      </span>
    </article>
  );
}

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  let tournaments: PublicTournamentRecord[] = [];
  let loadFailed = false;

  try {
    tournaments = (await getActiveSeasonSchedule()).map(toPublicTournament);
  } catch (error) {
    console.error("Tournament schedule load failed.", error);
    loadFailed = true;
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-[#F2F2F2]">
      <Header activeItem="Schedule" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <header className="border-b border-[#D4A017]/30 pb-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All-In Tournament Trail
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
              Tournament Schedule
            </h1>
          </header>
        </div>
      </section>

      <section className={`${PUBLIC_PAGE_CONTAINER} py-10 md:py-14`}>
        <div className="overflow-hidden border border-[#4A3A12] bg-[#111111]">
          <div className="hidden grid-cols-[180px_minmax(0,1fr)_140px] items-center gap-6 border-b border-[#4A3A12] px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#D4A017] lg:grid">
            <span>Lake</span>
            <span>About This Tournament</span>
            <span className="text-center">Status</span>
          </div>

          {tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <TournamentRow key={tournament.slug} tournament={tournament} />
            ))
          ) : (
            <p className="px-5 py-10 text-center text-sm text-neutral-400">
              {loadFailed
                ? "We could not load the tournament schedule. Please try again."
                : "No tournaments have been scheduled yet."}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
