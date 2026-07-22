"use client";

import Link from "next/link";
import SiteCraftBadge from "@/components/SiteCraftBadge";

function openFeedback() {
  window.dispatchEvent(new Event("open-feedback"));
}

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black text-zinc-300">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-wide text-white">
            All-In Tournament Trail
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
            Premier team bass fishing competition in North Texas.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-yellow-400">
            Navigation
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/" className="transition hover:text-red-500">
              Home
            </Link>
            <Link href="/schedule" className="transition hover:text-red-500">
              Schedule
            </Link>
            <Link href="/results" className="transition hover:text-red-500">
              Results
            </Link>
            <span aria-disabled="true" className="cursor-not-allowed text-zinc-600">
              Standings
            </span>
            <span aria-disabled="true" className="cursor-not-allowed text-zinc-600">
              Rules
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-yellow-400">
            Resources
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link
              href="/how-it-works"
              className="transition hover:text-red-500"
            >
              How It Works
            </Link>
            <button type="button" onClick={openFeedback} className="w-fit text-left transition hover:text-red-500">
              Contact Us
            </button>
            <button
              type="button"
              onClick={openFeedback}
              className="w-fit text-left transition hover:text-red-500"
            >
              Feedback
            </button>
            <span aria-disabled="true" className="cursor-not-allowed text-zinc-600">
              Sponsors
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-yellow-400">
            Contact
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <a
              href="mailto:support@allintournamenttrail.com"
              className="break-all transition hover:text-red-500"
            >
              support@allintournamenttrail.com
            </a>
            <span aria-disabled="true" className="text-zinc-600">
              Facebook
            </span>
            <span aria-disabled="true" className="text-zinc-600">
              Instagram
            </span>
            <span aria-disabled="true" className="text-zinc-600">
              YouTube
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-900 px-5 py-5">
        <div className="mx-auto grid max-w-[1400px] items-center gap-4 text-center text-xs uppercase tracking-wider text-zinc-500 lg:grid-cols-[1fr_auto_1fr] lg:text-left">
          <p>
            © {new Date().getFullYear()} All-In Tournament Trail. All rights
            reserved.
          </p>
          <div aria-hidden="true" />
          <div className="flex justify-center lg:justify-end">
            <SiteCraftBadge />
          </div>
        </div>
      </div>
    </footer>
  );
}
