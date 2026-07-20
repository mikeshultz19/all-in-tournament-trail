"use client";

import { useEffect, useState } from "react";

const EVENT_DATE = new Date("2026-11-01T06:00:00-06:00");

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateCountdown(): Countdown {
  const difference = Math.max(EVENT_DATE.getTime() - Date.now(), 0);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function FeaturedTournament() {
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(calculateCountdown());
    };

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const countdownItems = [
    { label: "Days", value: countdown.days },
    { label: "Hrs", value: countdown.hours },
    { label: "Min", value: countdown.minutes },
    { label: "Sec", value: countdown.seconds },
  ];

  return (
    <article className="overflow-hidden rounded-md border border-yellow-700/50 bg-[#080808]">

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
          backgroundImage: "url('/images/featured-tournament.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

        <p className="absolute bottom-3 left-4 text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400">
          Tournament Stop 01
        </p>
      </div>

      {/* Info */}
      <div className="px-4 pt-4 pb-4">

        <div className="text-center">
          <h3 className="text-lg font-black uppercase text-white sm:text-xl">
            Eagle Mountain Lake
          </h3>

          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-yellow-500">
            November 1, 2026
          </p>
        </div>

        {/* Countdown */}
        <div className="mt-4">
          <p className="mb-2 text-center text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Countdown to Takeoff
          </p>

          <div className="grid grid-cols-4 border-y border-yellow-700/25 py-3">
            {countdownItems.map((item, index) => (
              <div
                key={item.label}
                className={`text-center ${
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

        {/* Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <span
            aria-disabled="true"
            className="cursor-not-allowed border border-zinc-800 px-2 py-2.5 text-center text-[9px] font-black uppercase tracking-[0.08em] text-zinc-600"
          >
            Event Info
          </span>

          <span
            aria-disabled="true"
            className="cursor-not-allowed bg-red-950 px-2 py-2.5 text-center text-[9px] font-black uppercase tracking-[0.08em] text-zinc-400"
          >
            Register Now
          </span>
        </div>

      </div>

    </article>
  );
}
