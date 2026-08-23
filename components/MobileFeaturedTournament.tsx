"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import type { Tournament } from "@/data/tournaments";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-operations";
import type { TournamentOperationsViewModel } from "@/lib/tournament-view-model";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
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
  };
}

export default function MobileFeaturedTournament({
  tournament,
  operations,
}: {
  tournament: Tournament | null;
  operations?: TournamentOperationsViewModel | null;
}) {
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    if (!tournament) {
      return;
    }

    const tournamentDate = tournament.date;

    function updateCountdown() {
      setCountdown(calculateCountdown(tournamentDate));
    }

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 60000);

    return () => window.clearInterval(interval);
  }, [tournament]);

  if (!tournament) {
    return (
      <article className="rounded-lg border border-white/10 bg-[#111111] p-4 text-center">
        <p className="text-xs leading-5 text-neutral-400">
          Tournament information is not currently available.
        </p>
      </article>
    );
  }

  const statusLabel =
    TOURNAMENT_STATUS_LABELS[tournament.tournamentStatus];
  const registrationOpen = operations?.registrationCanSubmit ?? false;

  const formattedDate = new Date(
    `${tournament.date}T12:00:00`,
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="overflow-hidden rounded-lg border border-[#8f762f]/60 bg-[#101010] shadow-[0_10px_24px_rgba(0,0,0,0.3)]">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-red-500">
          Next Tournament
        </p>

        <h2 className="mt-1.5 text-lg font-black uppercase leading-tight text-white">
          {tournament.name}
        </h2>

      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex items-start gap-2.5">
          <CalendarDays
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0 text-[#D4A017]"
          />

          <div className="min-w-0">
            <p className="text-xs font-bold text-white">
              {formattedDate}
            </p>

            <p className="mt-0.5 text-[0.68rem] leading-4 text-neutral-400">
              {countdown.days}d {countdown.hours}h {countdown.minutes}m until
              takeoff
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0 text-[#D4A017]"
          />

          <div className="min-w-0">
            <p className="text-xs font-bold text-white">
              {tournament.venue || tournament.lake}
            </p>

            {tournament.city ? (
              <p className="mt-0.5 text-[0.68rem] leading-4 text-neutral-400">
                {tournament.city}, Texas
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0 text-[#D4A017]"
          />

          <div className="min-w-0">
            <p className="text-xs font-bold text-white">
              Scales Close            </p>

            {tournament.scalesCloseText ? (
              <p className="mt-0.5 text-[0.68rem] leading-4 text-neutral-400">
                {tournament.scalesCloseText}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-y border-white/10 py-2.5">
          <span className="text-[0.6rem] font-black uppercase tracking-[0.13em] text-neutral-500">
            Status
          </span>

          <span className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#D4A017]">
            {statusLabel}
          </span>
        </div>

        <div className="grid gap-2.5">
          {registrationOpen ? (
            <Link
              href={`/register?tournament=${tournament.slug}`}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md bg-red-700 px-4 text-[0.68rem] font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
            >
              Register
            </Link>
          ) : (
            <span
              aria-disabled="true"
              title={operations?.registrationReason ?? "Registration is not currently available."}
              className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-md bg-zinc-800 px-4 text-[0.68rem] font-black uppercase tracking-[0.1em] text-zinc-500"
            >
              {operations?.registrationReason ?? "Registration Unavailable"}
            </span>
          )}

          <Link
            href="/registrations"
            className="inline-flex cursor-pointer items-center justify-center py-1 text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#D4A017] transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
          >
            View Tournament Entries →
          </Link>

          <Link
            href="/schedule"
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-white/15 px-4 text-[0.68rem] font-black uppercase tracking-[0.1em] text-white transition hover:border-[#D4A017] hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
          >
            View Schedule
          </Link>
        </div>
      </div>
    </article>
  );
}
