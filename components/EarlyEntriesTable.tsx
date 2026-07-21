import Link from "next/link";

import type { PublicEarlyEntry } from "@/lib/public-early-entry";
import { formatPublicRegistrationTimestamp } from "@/lib/tournament-time";

const bonusPotLabels = { bronze: "Bronze", silver: "Silver", gold: "Gold" } as const;

export default function EarlyEntriesTable({
  entries,
  registrationHref,
  registrationOpen,
}: {
  entries: readonly PublicEarlyEntry[];
  registrationHref: string;
  registrationOpen: boolean;
}) {
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
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <caption className="sr-only">Tournament entries, ordered from oldest registration to newest.</caption>
        <thead className="bg-[#171717] text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">
          <tr>
            <th scope="col" className="min-w-60 border-b border-[#4A3A12] px-4 py-3">Registered</th>
            <th scope="col" className="min-w-44 border-b border-[#4A3A12] px-4 py-3">Angler 1</th>
            <th scope="col" className="min-w-44 border-b border-[#4A3A12] px-4 py-3">Angler 2</th>
            <th scope="col" className="min-w-28 border-b border-[#4A3A12] px-4 py-3">Big Bass</th>
            <th scope="col" className="min-w-32 border-b border-[#4A3A12] px-4 py-3">Bonus Pot</th>
            <th scope="col" className="min-w-36 border-b border-[#4A3A12] px-4 py-3">Insurance Pot</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-[#0E0E0E] text-neutral-200">
          {entries.map((entry) => (
            <tr key={`${entry.registeredAt}-${entry.angler1DisplayName}`} className="hover:bg-white/[0.03]">
              <td className="whitespace-nowrap px-4 py-3"><time dateTime={entry.registeredAt}>{formatPublicRegistrationTimestamp(entry.registeredAt)}</time></td>
              <td className="px-4 py-3 font-semibold text-white">{entry.angler1DisplayName}</td>
              <td className="px-4 py-3">{entry.entryMode === "solo" ? "Solo" : entry.angler2DisplayName}</td>
              <td className="px-4 py-3">{entry.bigBassSelected ? "Yes" : <span className="text-neutral-600">—</span>}</td>
              <td className="px-4 py-3">{entry.bonusPot ? bonusPotLabels[entry.bonusPot] : <span className="text-neutral-600">—</span>}</td>
              <td className="px-4 py-3">{entry.insurancePotSelected ? "Yes" : <span className="text-neutral-600">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
