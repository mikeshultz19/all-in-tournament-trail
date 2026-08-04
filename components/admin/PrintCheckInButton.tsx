"use client";

export default function PrintCheckInButton() {
  return <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center border border-white/15 px-4 text-xs font-black uppercase text-white hover:border-white/30">Print Check-In List</button>;
}
