"use client";

import Image from "next/image";
import Link from "next/link";
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

export default function SeasonBanner() {
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setCountdown(calculateCountdown());

    const interval = window.setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const countdownItems = [
    { label: "Days", value: countdown.days },
    { label: "Hrs", value: countdown.hours },
    { label: "Mins", value: countdown.minutes },
    { label: "Secs", value: countdown.seconds },
  ];

  return (
    <section className="border-y border-yellow-600/40 bg-[#070707] px-4">
      <div className="mx-auto grid max-w-[1100px] overflow-hidden lg:grid-cols-[150px_1fr_300px]">
        {/* Trophy */}
        <div className="hidden items-center justify-center border-r border-yellow-600/25 px-3 py-2 lg:flex">
          <Image
            src="/images/trophy-inaugural-v2.png"
            alt="All In Championship Trophy"
            width={500}
            height={650}
            priority
            className="h-auto w-full max-w-[95px] object-contain"
          />
        </div>

        {/* Championship message */}
        <div className="flex flex-col items-center justify-center px-5 py-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-400 sm:text-xs">
            ★ Inaugural Season ★
          </p>

          <h2 className="mt-2 text-lg font-black uppercase leading-tight text-white sm:text-xl md:text-[24px]">
            The First Champions
          </h2>

          <p className="mt-1 text-lg font-black uppercase leading-tight text-yellow-500 sm:text-xl md:text-[24px]">
            Will Be Crowned
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="border border-red-700/80 bg-red-950/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
              November 1, 2026
            </span>

            <span className="border border-red-700/80 bg-red-950/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
              Eagle Mountain Lake
            </span>
          </div>
        </div>

        {/* Live countdown */}
        <div className="flex flex-col justify-center border-t border-yellow-600/25 px-5 py-4 lg:border-l lg:border-t-0">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.22em] text-yellow-400 sm:text-xs">
            Countdown to History
          </p>

          <div className="mt-3 grid grid-cols-4">
            {countdownItems.map((item, index) => (
              <div
                key={item.label}
                className={`text-center ${
                  index !== countdownItems.length - 1
                    ? "border-r border-yellow-600/25"
                    : ""
                }`}
              >
                <p className="text-xl font-black leading-none text-white md:text-2xl">
                  {String(item.value).padStart(2, "0")}
                </p>

                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/register"
            className="mt-3 block bg-yellow-500 px-4 py-2 text-center text-xs font-black uppercase tracking-wide text-black transition-colors hover:bg-yellow-400"
          >
            Register Now
            <span className="mt-0.5 block text-[9px] tracking-wide">
              Eagle Mountain Lake • Nov. 1, 2026
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}