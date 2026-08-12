"use client";

import Link from "next/link";

export default function MobileMenuHomeLink({ active }: { active: boolean }) {
  return (
    <Link
      href="/"
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        event.currentTarget.closest("details")?.removeAttribute("open");
      }}
      className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-sm font-black uppercase tracking-[0.08em] transition duration-200 hover:bg-white/5 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400 ${
        active ? "text-red-500" : "text-zinc-100"
      }`}
    >
      Home
    </Link>
  );
}
