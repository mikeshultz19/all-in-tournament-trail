"use client";

import Link from "next/link";
import SiteCraftBadge from "@/components/SiteCraftBadge";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Tournament Schedule", href: "/schedule" },
  { label: "Results", href: "/results" },
  { label: "Rules", href: "/rules" },
  { label: "Contact", href: "/contact" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/groups/",
    external: true,
  },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
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
        </ul>
      </nav>

      <div className="border-t border-zinc-900 px-3 py-2 sm:px-8">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-2 text-[9px] leading-tight text-zinc-500 sm:text-xs">
          <p className="text-left">© 2025 All In Tournament Trail</p>
          <div className="flex justify-center">
            <SiteCraftBadge />
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center justify-self-end gap-1 text-right uppercase tracking-[0.08em] transition-colors hover:text-yellow-400 focus-visible:text-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 sm:tracking-[0.12em]"
          >
            <span aria-hidden="true">↑</span> Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}
