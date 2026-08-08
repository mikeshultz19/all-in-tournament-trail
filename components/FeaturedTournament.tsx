"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getTournamentImage,
  type Tournament,
} from "@/data/tournaments";
import { getTournamentDisplay } from "@/lib/tournament-display";
import type { TournamentOperationsViewModel } from "@/lib/tournament-view-model";
import EarlyRegistrationStats from "@/components/EarlyRegistrationStats";
import type { TournamentEntrySummary } from "@/lib/public-early-entry";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateCountdown(date: string): Countdown {
  const difference = Math.max(
    new Date(`${date}T05:00:00-05:00`).getTime() - Date.now(),
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
}: {
  tournament: Tournament | null;
  operations?: TournamentOperationsViewModel | null;
  earlyRegistrationSummary?: TournamentEntrySummary;
  earlyRegistrationStatsUnavailable?: boolean;
}) {
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const countdownDate = operations?.effectiveDate ?? tournament?.date ?? null;

  useEffect(() => {
    const updateCountdown = () => {
      if (countdownDate) {
        setCountdown(calculateCountdown(countdownDate));
      }
    };

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [countdownDate]);

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

  const display = getTournamentDisplay(tournament);
  const registrationOpen = operations?.registrationCanSubmit === true;

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
            {display.date}
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            {tournament.lake}
            {tournament.venue ? ` · ${tournament.venue}` : ""}
            {tournament.city ? ` · ${tournament.city}` : ""}
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

        <section aria-labelledby="tournament-information-heading" className="mt-4 border border-[#4A3A12] bg-[#0d0d0d]">
          <h4 id="tournament-information-heading" className="border-b border-[#4A3A12] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#D4A017]">
            Tournament Details
          </h4>
          <dl className="grid grid-cols-1 text-center sm:grid-cols-2 md:grid-cols-6 min-[1280px]:grid-cols-5">
  <div className="border-b border-white/10 p-3 sm:border-r md:col-span-2 min-[1280px]:col-span-1 min-[1280px]:border-b-0">
    <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">
      Date
    </dt>

    <dd className="mt-1.5 text-sm font-bold text-white">
      <time dateTime={countdownDate ?? tournament.date}>
        {display.date}
      </time>
    </dd>

    <dd className="mt-1 text-xs text-zinc-400">
      {display.dayOfWeek}
    </dd>
  </div>

  <div className="border-b border-white/10 p-3 md:col-span-2 md:border-r min-[1280px]:col-span-1 min-[1280px]:border-b-0">
    <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">
      Ramp
    </dt>

    {tournament.venue && (
      <dd className="mt-1.5 whitespace-pre-line text-sm font-bold text-white">
        {tournament.venue}
      </dd>
    )}
  </div>

  <div className="border-b border-white/10 p-3 md:col-span-2 min-[1280px]:col-span-1 min-[1280px]:border-b-0 min-[1280px]:border-r">
    <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">
      Hours
    </dt>

    {tournament.hours && (
      <dd className="mt-1.5 whitespace-pre-line text-sm font-bold text-white">
        {tournament.hours}
      </dd>
    )}

    {tournament.stopFishing && (
      <dd className="mt-1 whitespace-pre-line text-xs text-zinc-400">
        {tournament.stopFishing}
      </dd>
    )}
  </div>

  <div className="border-b border-white/10 p-3 sm:border-r md:col-span-3 md:border-b-0 min-[1280px]:col-span-1">
    <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">
      Launch Type
    </dt>

    {tournament.launchTypeText && (
      <dd className="mt-1.5 whitespace-pre-line text-sm font-bold text-white">
        {tournament.launchTypeText}
      </dd>
    )}
  </div>

  <div className="p-3 sm:col-span-2 md:col-span-3 min-[1280px]:col-span-1 min-[1280px]:border-l">
    <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#D4A017]">
      Morning Registration
    </dt>

    {tournament.morningRegistrationText && (
      <dd className="mt-1.5 whitespace-pre-line text-sm font-bold text-white">
        {tournament.morningRegistrationText}
      </dd>
    )}
  </div>
</dl>
        </section>

        {tournament.registrationInformation && (
          <section
            aria-labelledby="registration-information-heading"
            className="mt-3 border border-[#4A3A12] bg-[#0d0d0d]"
          >
            <h4
              id="registration-information-heading"
              className="border-b border-[#4A3A12] px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#D4A017]"
            >
              Registration Information
            </h4>
            <p className="whitespace-pre-line px-4 py-3 text-center text-xs leading-5 text-white">
              {tournament.registrationInformation}
            </p>
          </section>
        )}

        {tournament.practiceInformation && (
          <section
            aria-labelledby="practice-information-heading"
            className="mt-3 border border-[#4A3A12] bg-[#0d0d0d]"
          >
            <h4
              id="practice-information-heading"
              className="border-b border-[#4A3A12] px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#D4A017]"
            >
              Practice Information
            </h4>
            <p className="whitespace-pre-line px-4 py-3 text-center text-xs leading-5 text-white">
              {tournament.practiceInformation}
            </p>
          </section>
        )}

        <div className="mt-3 space-y-3">
          {registrationOpen ? (
            <Link
              href={`/register?tournament=${tournament.slug}`}
              className="block w-full cursor-pointer bg-red-700 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
            >
              Register Now
            </Link>
          ) : (
            <span
              aria-disabled="true"
              title={operations?.registrationReason ?? "Registration is not currently available."}
              className="block w-full cursor-not-allowed bg-zinc-800 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.08em] text-zinc-500"
            >
              Registration Closed
            </span>
          )}
          <Link
            href="/registrations"
            className="block w-full cursor-pointer border border-[#4A3A12] px-3 py-2.5 text-center text-[9px] font-black uppercase tracking-[0.1em] text-yellow-400 transition hover:border-yellow-600 hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
          >
            View Tournament Entries
          </Link>
        </div>

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
