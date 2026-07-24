"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getTournamentImage,
  type Tournament,
} from "@/data/tournaments";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-operations";
import { getTournamentDisplay } from "@/lib/tournament-display";
import type { TournamentOperationsViewModel } from "@/lib/tournament-view-model";
import EarlyRegistrationStats from "@/components/EarlyRegistrationStats";
import type { TournamentEntrySummary } from "@/lib/public-early-entry";
import type { TournamentStatus } from "@/types/tournament";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateCountdown(date: string): Countdown {
  const difference = Math.max(
    new Date(`${date}T06:00:00-06:00`).getTime() - Date.now(),
    0,
  );

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function FeaturedTournament({
  tournament,
  operations,
  earlyRegistrationSummary,
  earlyRegistrationStatsUnavailable = false,
  lifecycleStatus,
}: {
  tournament: Tournament | null;
  operations?: TournamentOperationsViewModel | null;
  earlyRegistrationSummary?: TournamentEntrySummary;
  earlyRegistrationStatsUnavailable?: boolean;
  lifecycleStatus?: TournamentStatus;
}) {
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      if (tournament) {
        setCountdown(calculateCountdown(tournament.date));
      }
    };

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [tournament]);

  const countdownItems = [
    { label: "Days", value: countdown.days },
    { label: "Hrs", value: countdown.hours },
    { label: "Min", value: countdown.minutes },
    { label: "Sec", value: countdown.seconds },
  ];

  if (!tournament) {
    return (
      <article className="border border-yellow-700/50 bg-[#080808] p-6 text-center text-sm text-zinc-500">
        Tournament information is not currently available.
      </article>
    );
  }

  const registrationOpen = operations?.registrationCanSubmit ?? (
    tournament.registrationStatus === "open" &&
    !["cancelled", "postponed"].includes(tournament.tournamentStatus)
  );
  const display = getTournamentDisplay(tournament);

  return (
    <article className="w-full min-w-0 max-w-full overflow-hidden rounded-md border border-yellow-700/50 bg-[#080808]">

      {/* Header */}
      <div className="flex h-11 items-center gap-3 border-b border-yellow-700/30 px-4">
        <h2 className="shrink-0 text-xs font-black uppercase tracking-[0.16em] text-red-500 sm:text-sm">
          Featured Tournament
        </h2>

        <div className="h-px flex-1 bg-gradient-to-r from-red-700/80 to-transparent" />
      </div>

      {/* Image */}
      <div
        className="relative h-[180px] bg-cover bg-center"
        style={{
          backgroundImage: `url('${getTournamentImage(tournament)}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

        <p className="absolute bottom-3 left-4 text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400">Next Tournament</p>
      </div>

      {/* Info */}
      <div className="px-4 pt-4 pb-4">

        <div className="text-center">
          <h3 className="text-lg font-black uppercase text-white sm:text-xl">
            {tournament.name}
          </h3>

          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-yellow-500">
            {new Date(`${tournament.date}T12:00:00`).toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric", year: "numeric" },
            )}
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            {tournament.lake}
            {tournament.venue ? ` · ${tournament.venue}` : ""}
            {tournament.city ? ` · ${tournament.city}, Texas` : ""}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 border border-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-200">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
            Tournament Status:{" "}
            {lifecycleStatus ??
              TOURNAMENT_STATUS_LABELS[tournament.tournamentStatus]}
          </p>
        </div>

        {/* Countdown */}
        <div className="mt-4">
          <p className="mb-2 text-center text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Countdown to Takeoff
          </p>

          <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] border-y border-yellow-700/25 py-3">
            {countdownItems.map((item, index) => (
              <div
                key={item.label}
                className={`min-w-0 text-center ${
                  index !== countdownItems.length - 1
                    ? "border-r border-yellow-700/25"
                    : ""
                }`}
              >
                <p className="text-lg font-black text-white">
                  {String(item.value).padStart(2, "0")}
                </p>

                <p className="mt-1 text-[7px] font-bold uppercase tracking-wider text-zinc-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Registration */}
        <div className="mt-4 flex w-full justify-center">
          {registrationOpen ? (
            <Link
              href={`/register?tournament=${tournament.slug}`}
              className="w-full bg-red-700 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
            >
              Register Now
            </Link>
          ) : (
            <span aria-disabled="true" className="w-full cursor-not-allowed bg-red-950 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.08em] text-zinc-400">
              {tournament.registrationStatus === "closed" || operations?.registrationPeriod === "fully_closed" ? "Registration Closed" : "Registration Unavailable"}
            </span>
          )}
        </div>

        <section aria-labelledby="tournament-information-heading" className="mt-4 border border-[#4A3A12] bg-[#0d0d0d]">
          <h4 id="tournament-information-heading" className="border-b border-[#4A3A12] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#D4A017]">
            Tournament Information
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
            <div className="border-b border-white/10 p-4 sm:border-r xl:border-b-0">
              <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">Date</dt>
              <dd className="mt-2 text-sm font-bold text-white"><time dateTime={operations?.effectiveDate ?? tournament.date}>{display.date}</time></dd>
              <dd className="mt-1 text-xs text-zinc-400">{display.dayOfWeek}</dd>
            </div>
            <div className="border-b border-white/10 p-4 xl:border-b-0 xl:border-r">
              <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">Ramp</dt>
              <dd className="mt-2 text-sm font-bold text-white">{display.ramp}</dd>
              <dd className="mt-1 text-xs text-zinc-400">{display.location}</dd>
            </div>
            <div className="border-b border-white/10 p-4 sm:border-r sm:border-b-0">
              <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">Hours</dt>
              <dd className="mt-2 text-sm font-bold text-white">{display.hours}</dd>
              <dd className="mt-1 text-xs text-zinc-400">{display.stopFishing}</dd>
            </div>
            <div className="p-4">
              <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">Launch Type</dt>
              <dd className="mt-2 text-sm font-bold text-white">{display.launchType}</dd>
              <dd className="mt-1 text-xs leading-4 text-zinc-400">Subject to change by Tournament Director</dd>
            </div>
            <div className="border-t border-white/10 p-4 sm:col-span-2 xl:col-span-1 xl:border-l xl:border-t-0">
              <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">Morning Registration</dt>
              <dd className="mt-2 text-sm font-bold text-white">
                <span className="block text-xs font-normal text-zinc-400">Opens at</span>
                {display.morningRegistration}
              </dd>
              <dd className="mt-1 text-xs leading-4 text-zinc-400">In person at the ramp</dd>
            </div>
          </dl>
        </section>

        <Link
          href="/registrations"
          className="mt-3 block border border-[#4A3A12] px-3 py-2.5 text-center text-[9px] font-black uppercase tracking-[0.1em] text-yellow-400 transition hover:border-yellow-600 hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
        >
          View Tournament Entries
        </Link>

        {operations && (
          <p className="mt-3 text-center text-xs leading-5 text-zinc-400">
            {registrationOpen ? (
              <>Registration closes <time dateTime={operations.earlyRegistrationDeadlineIso}>{operations.earlyRegistrationDeadline}</time></>
            ) : operations.registrationReason}
          </p>
        )}

        {earlyRegistrationSummary && (
          <EarlyRegistrationStats
            {...earlyRegistrationSummary}
            unavailable={earlyRegistrationStatsUnavailable}
          />
        )}

      </div>

    </article>
  );
}
