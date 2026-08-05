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

    function updateCountdown() {
      setCountdown(calculateCountdown(tournament!.date));
    }

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 60000);

    return () => window.clearInterval(interval);
  }, [tournament]);

  if (!tournament) {
    return (
      <article className="rounded-xl border border-white/10 bg-[#111111] p-5 text-center">
        <p className="text-sm text-neutral-400">
          Tournament information is not currently available.
        </p>
      </article>
    );
  }

  const registrationOpen =
    operations?.registrationCanSubmit ??
    (tournament.registrationStatus === "open" &&
      !["cancelled", "postponed"].includes(tournament.tournamentStatus));

  const statusLabel =
    TOURNAMENT_STATUS_LABELS[tournament.tournamentStatus];

  const formattedDate = new Date(
    `${tournament.date}T12:00:00`,
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="overflow-hidden rounded-xl border border-[#8f762f]/60 bg-[#101010] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-red-500">
          Next Tournament
        </p>

        <h2 className="mt-2 text-xl font-black uppercase leading-tight text-white">
          {tournament.name}
        </h2>

        <p className="mt-1 text-sm font-bold text-[#D4A017]">
          {tournament.lake}
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="flex items-start gap-3">
          <CalendarDays
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#D4A017]"
          />

          <div>
            <p className="text-sm font-bold text-white">{formattedDate}</p>

            <p className="mt-1 text-xs text-neutral-400">
              {countdown.days} days, {countdown.hours} hours,{" "}
              {countdown.minutes} minutes until takeoff
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#D4A017]"
          />

          <div>
            <p className="text-sm font-bold text-white">
              {tournament.venue || tournament.lake}
            </p>

            {tournament.city ? (
              <p className="mt-1 text-xs text-neutral-400">
                {tournament.city}, Texas
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-y border-white/10 py-3">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-neutral-500">
            Status
          </span>

          <span className="text-xs font-black uppercase tracking-[0.1em] text-[#D4A017]">
            {statusLabel}
          </span>
        </div>

        {operations ? (
          <p className="text-center text-xs leading-5 text-neutral-400">
            {registrationOpen
              ? `Registration closes ${operations.earlyRegistrationDeadline}`
              : operations.registrationReason}
          </p>
        ) : null}

        <div className="grid gap-3">
          {registrationOpen ? (
            <Link
              href={`/register?tournament=${tournament.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-red-700 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600"
            >
              Register Now
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-md bg-red-950 px-5 text-xs font-black uppercase tracking-[0.12em] text-neutral-400"
            >
              Registration Unavailable
            </span>
          )}

          <Link
            href="/schedule"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/15 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-[#D4A017] hover:text-[#D4A017]"
          >
            View Tournament Schedule
          </Link>
        </div>
      </div>
    </article>
  );
}