"use client";

import Link from "next/link";

import SiteCraftBadge from "@/components/SiteCraftBadge";
import { SOCIAL_LINKS } from "@/config/social-links";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Schedule", href: "/schedule" },
  { label: "Results", href: "/results" },
  { label: "Rules", href: "/rules" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  {
    label: "Facebook",
    href: SOCIAL_LINKS.facebook.href,
    external: true,
  },
  {
    label: "Instagram",
    href: SOCIAL_LINKS.instagram.href,
    external: true,
  },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openContactModal() {
  window.dispatchEvent(new Event("open-contact"));
}

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black text-zinc-400">
      <nav
        aria-label="Footer navigation"
        className="mx-auto max-w-[1400px] px-3 py-2 sm:px-8"
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] leading-4 sm:gap-x-3 sm:text-xs">
          {footerLinks.map((link, index) => (
            <li
              key={link.href}
              className="flex items-center gap-x-2.5 sm:gap-x-3"
            >
              {index > 0 && (
                <span aria-hidden="true" className="text-yellow-500/70">
                  •
                </span>
              )}

              <Link
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="whitespace-nowrap transition-colors hover:text-red-500 focus-visible:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/*
           * MOBILE-ONLY CONTACT BUTTON
           *
           * This dispatches the same open-contact event already handled by
           * FeedbackWidget. It therefore opens the same modal as the desktop
           * floating Contact tab.
           *
           * md:hidden keeps this footer item off the desktop version.
           */}
          <li className="flex items-center gap-x-2.5 sm:gap-x-3 md:hidden">
            <span aria-hidden="true" className="text-yellow-500/70">
              •
            </span>

            <button
              type="button"
              onClick={openContactModal}
              className="whitespace-nowrap font-semibold text-yellow-400 transition-colors hover:text-yellow-300 focus-visible:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
            >
              Contact
            </button>
          </li>
        </ul>
      </nav>

      <div className="border-t border-zinc-900 px-3 py-2 sm:px-8">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 text-[9px] leading-tight text-zinc-500 sm:grid-cols-[1fr_auto_1fr] sm:text-xs">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#d0ae4c] sm:text-xs">
              Fish Your Way. Bet Your Way. Win Your Way.
            </p>

            <p className="mt-1 text-[10px] text-zinc-400 sm:text-xs">
              © 2026 All In Tournament Trail
            </p>

            <p className="mt-0.5">All Rights Reserved.</p>
          </div>

          <div className="col-span-2 row-start-2 flex flex-col items-center justify-center text-center text-[8px] text-zinc-600 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:text-[10px]">
            <p>Website Designed by SiteCraft Web Design</p>
            <SiteCraftBadge />
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center justify-self-end gap-1 text-right uppercase tracking-[0.08em] transition-colors hover:text-yellow-400 focus-visible:text-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 sm:tracking-[0.12em]"
          >
            <span aria-hidden="true">↑</span>
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}