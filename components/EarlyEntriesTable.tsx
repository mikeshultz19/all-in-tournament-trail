"use client";

import Link from "next/link";
import { useState } from "react";

import type { PublicEarlyEntry } from "@/lib/public-early-entry";

const bonusPotLabels = { bronze: "Bronze", silver: "Silver", gold: "Gold" } as const;
export const PUBLIC_EARLY_ENTRIES_PAGE_SIZE = 25;

export function paginatePublicEarlyEntries(
  entries: readonly PublicEarlyEntry[],
  requestedPage: number,
) {
  const totalEntries = entries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PUBLIC_EARLY_ENTRIES_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = (currentPage - 1) * PUBLIC_EARLY_ENTRIES_PAGE_SIZE;

  return {
    entries: entries.slice(startIndex, startIndex + PUBLIC_EARLY_ENTRIES_PAGE_SIZE),
    currentPage,
    totalEntries,
    totalPages,
    rangeStart: totalEntries === 0 ? 0 : startIndex + 1,
    rangeEnd: Math.min(startIndex + PUBLIC_EARLY_ENTRIES_PAGE_SIZE, totalEntries),
  };
}

function optionIndicator(label: string, selected: boolean) {
  return (
    <span
      role="img"
      aria-label={`${label}: ${selected ? "Selected" : "Not selected"}`}
      className={selected ? "text-white" : "text-neutral-600"}
    >
      {selected ? "✓" : "—"}
    </span>
  );
}

export default function EarlyEntriesTable({
  entries,
  registrationHref,
  registrationOpen,
}: {
  entries: readonly PublicEarlyEntry[];
  registrationHref: string;
  registrationOpen: boolean;
}) {
  const [requestedPage, setRequestedPage] = useState(1);
  const pagination = paginatePublicEarlyEntries(entries, requestedPage);

  if (entries.length === 0) {
    return (
      <div className="border-y border-white/10 py-10 text-center">
        <p className="text-neutral-300">No tournament entries have been posted yet.</p>
        {registrationOpen && (
          <Link href={registrationHref} className="mt-4 inline-flex bg-red-700 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-600">
            Register
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-white/10" tabIndex={0} aria-label="Scrollable tournament entries">
      <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
        <caption className="sr-only">Tournament entries, ordered from oldest registration to newest.</caption>
        <thead className="bg-[#171717] text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">
          <tr>
            <th scope="col" className="min-w-32 border-b border-[#4A3A12] px-4 py-3">BOAT #</th>
            <th scope="col" className="min-w-32 border-b border-[#4A3A12] px-4 py-3">Competing As</th>
            <th scope="col" className="min-w-44 border-b border-[#4A3A12] px-4 py-3">Angler 1</th>
            <th scope="col" className="min-w-44 border-b border-[#4A3A12] px-4 py-3">Angler 2</th>
            <th scope="col" className="min-w-28 border-b border-[#4A3A12] px-4 py-3">Big Bass</th>
            <th scope="col" className="min-w-32 border-b border-[#4A3A12] px-4 py-3">Bonus Pot</th>
            <th scope="col" className="min-w-36 border-b border-[#4A3A12] px-4 py-3">Insurance Pot</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-[#0E0E0E] text-neutral-200">
          {pagination.entries.map((entry, index) => (
            <tr key={`${entry.registeredAt}-${entry.boatNumber ?? "unassigned"}-${entry.angler1DisplayName}-${index}`} className="hover:bg-white/[0.03]">
              <td className="whitespace-nowrap px-4 py-3 font-black text-white">{entry.boatNumber?.toString() ?? "—"}</td>
              <td className="px-4 py-3 font-black uppercase tracking-[0.1em] text-[#D4A017]">
                {entry.entryMode === "team" ? "Team" : "Solo"}
              </td>
              <td className="px-4 py-3 font-semibold text-white">{entry.angler1DisplayName}</td>
              <td className="px-4 py-3">{entry.entryMode === "solo" ? "Solo" : entry.angler2DisplayName}</td>
              <td className="px-4 py-3">{optionIndicator("Big Bass", entry.bigBassSelected)}</td>
              <td className="px-4 py-3">{entry.bonusPot ? bonusPotLabels[entry.bonusPot] : <span className="text-neutral-600">—</span>}</td>
              <td className="px-4 py-3">{optionIndicator("Insurance Pot", entry.insurancePotSelected)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination.totalPages > 1 && (
        <nav aria-label="Tournament entries pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#111111] px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-neutral-300">
          <button
            type="button"
            onClick={() => setRequestedPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            aria-label="Previous page"
            className="border border-white/15 px-3 py-2 enabled:text-[#D4A017] enabled:hover:border-[#D4A017]/60 disabled:cursor-not-allowed disabled:text-neutral-600"
          >
            Previous
          </button>
          <span aria-live="polite">{pagination.rangeStart}–{pagination.rangeEnd} of {pagination.totalEntries}</span>
          <span aria-current="page">Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button
            type="button"
            onClick={() => setRequestedPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            aria-label="Next page"
            className="border border-white/15 px-3 py-2 enabled:text-[#D4A017] enabled:hover:border-[#D4A017]/60 disabled:cursor-not-allowed disabled:text-neutral-600"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
