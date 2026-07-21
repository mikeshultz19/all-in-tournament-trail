import type { TournamentEntrySummary as TournamentEntrySummaryData } from "@/lib/public-early-entry";

const potMetrics = [
  ["Big Bass", "bigBassEntries"],
  ["Bronze", "bronzeEntries"],
  ["Silver", "silverEntries"],
  ["Gold", "goldEntries"],
  ["Insurance Pot", "insurancePotEntries"],
] as const;

export default function TournamentEntrySummary({
  summary,
  registrationDeadline,
  registrationDeadlineIso,
  registrationHref,
  registrationOpen = false,
  showActions = false,
}: {
  summary: TournamentEntrySummaryData;
  registrationDeadline?: string;
  registrationDeadlineIso?: string;
  registrationHref?: string;
  registrationOpen?: boolean;
  showActions?: boolean;
}) {
  return (
    <section aria-labelledby="entry-summary-heading" className="mb-8 border-y border-white/10 bg-[#0E0E0E] px-4 py-6 text-center sm:px-6">
      <h2 id="entry-summary-heading" className="sr-only">Tournament entry summary</h2>
      <p className="text-2xl font-black text-white sm:text-3xl">
        {summary.totalEntries} Tournament {summary.totalEntries === 1 ? "Entry" : "Entries"}
      </p>
      <p className="mt-1 text-sm text-neutral-400">
        {summary.teamEntries} Team {summary.teamEntries === 1 ? "Entry" : "Entries"}
        <span aria-hidden="true"> • </span>
        {summary.soloEntries} Solo {summary.soloEntries === 1 ? "Entry" : "Entries"}
      </p>
      <dl className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-5">
        {potMetrics.map(([label, key]) => (
          <div key={key}>
            <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">{label}</dt>
            <dd className="mt-1 text-xl font-black text-white">{summary[key]}</dd>
          </div>
        ))}
      </dl>
      {registrationDeadline && (
        <p className="mt-5 border-t border-white/10 pt-5 text-sm text-neutral-400">
          <span className="font-black uppercase tracking-[0.12em] text-neutral-500">Registration closes:</span>{" "}
          <time dateTime={registrationDeadlineIso} className="font-semibold text-white">{registrationDeadline}</time>
          <span className="block text-xs text-neutral-500">America/Chicago (local tournament time)</span>
        </p>
      )}
      {showActions && (
        <div className="mx-auto mt-5 flex max-w-xl flex-col justify-center gap-3 border-t border-white/10 pt-5 sm:flex-row">
          {registrationOpen && registrationHref ? (
            <Link href={registrationHref} className="inline-flex min-h-11 items-center justify-center bg-red-700 px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]">
              Register Now
            </Link>
          ) : (
            <span aria-disabled="true" className="inline-flex min-h-11 cursor-not-allowed items-center justify-center border border-zinc-800 px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-500">
              Registration Closed
            </span>
          )}
          <Link href="/registrations" className="inline-flex min-h-11 items-center justify-center border border-[#6B5318] px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-yellow-400 transition hover:border-yellow-500 hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]">
            View Tournament Entries
          </Link>
        </div>
      )}
    </section>
  );
}
import Link from "next/link";
