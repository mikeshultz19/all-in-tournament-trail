import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import type { LatestTournamentResults } from "@/types/results";
import Header from "@/components/Header";
import InsurancePotWinnersSection from "@/components/InsurancePotWinnersSection";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";
import {
  calculateResultPayouts,
  displayResultsPayout,
  formatResultsDate,
  getInsurancePotWinnersForEntry,
  getTeamPayouts,
  isSidePotEntry,
  paginateResultEntries,
  payoutAmount,
} from "@/lib/result-payouts";
import {
  getPublishedTournamentResultsArchive,
} from "@/lib/results";

export const metadata: Metadata = {
  title: "Tournament Results",
  description:
    "View official All-In Tournament Trail tournament results, standings, weights, payouts, Big Bass results, and archived event results.",
  alternates: {
    canonical: "/results",
  },
};
export const dynamic = "force-dynamic";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = Number.parseInt((await searchParams).page ?? "1", 10);
  let latestResults: LatestTournamentResults | null = null;
  let publishedResultsArchive: LatestTournamentResults[] = [];

  try {
    publishedResultsArchive =
      await getPublishedTournamentResultsArchive();
    latestResults = publishedResultsArchive[0] ?? null;
  } catch (error) {
    console.error("Results index load failed.", error);
  }

  const pastTournamentResults = publishedResultsArchive.filter(
    (item: LatestTournamentResults) =>
      item.tournament.id !== latestResults?.tournament?.id,
  );

  const finalEntries =
    latestResults?.results.entries
      .filter((entry) => !isSidePotEntry(entry))
      .sort((a, b) => a.place - b.place) ?? [];

  const payoutTotals = calculateResultPayouts(
    latestResults?.results ?? {},
    latestResults?.insurancePotResult,
  );
  const paginatedEntries = paginateResultEntries(finalEntries, requestedPage);
  const pageHref = (page: number) =>
    page === 1 ? "/results#standings" : `/results?page=${page}#standings`;

  return (
    <main className="min-h-screen bg-black text-white">
      <Header activeItem="Results" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(212,160,23,0.16),transparent_42%)]">
            <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(135deg,transparent,rgba(127,29,29,0.12))]" />
            <header className="relative border-b border-[#D4A017]/50 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#c9aa4a]/70 bg-[#c9aa4a]/10 text-[#d0ae4c] shadow-[0_0_28px_rgba(212,160,23,0.16)] md:size-14">
                  <Trophy aria-hidden="true" className="size-6 md:size-7" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
                    Tournament Complete
                  </p>

                  <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
                    Official Results
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
                Celebrating the anglers, winning weights, and official payouts from the latest AITT tournament.
              </p>
            </header>
          </div>
        </div>
      </section>

      {pastTournamentResults.length > 0 ? (
        <nav
          aria-label="Results archive"
          className="border-b border-white/10 bg-[#111111]"
        >
          <div className={`${PUBLIC_PAGE_CONTAINER} flex items-center gap-4 overflow-x-auto py-3`}>
            <span className="shrink-0 text-xs font-black uppercase tracking-[0.15em] text-neutral-500">
              Archive
            </span>
            {pastTournamentResults.map((item) => (
              <Link
                key={item.tournament.id}
                href={item.completeResultsUrl}
                className="shrink-0 text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a] hover:text-[#f4eee7]"
              >
                {item.tournament.name} ·{" "}
                {formatResultsDate(item.tournament.tournament_date)}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}

      <section className={`${PUBLIC_PAGE_CONTAINER} py-10 md:py-14`}>
        {!latestResults ? (
          <div className="border border-white/10 bg-[#111111] p-10 text-center">
            <h2 className="text-2xl font-black uppercase">
              No Results Available
            </h2>

            <p className="mt-3 text-neutral-400">
              Results will appear here after a tournament is published.
            </p>
          </div>
        ) : (
          <>
            <div className="relative mb-8 overflow-hidden border border-[#8f762f]/70 bg-[linear-gradient(135deg,#171717,#0d0d0d)] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d0ae4c] to-transparent" />
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#f4eee7]">
                {latestResults.tournament.name}
              </h2>

              <p className="mt-2 text-sm font-bold uppercase tracking-[0.15em] text-[#c9aa4a]">
                {latestResults.tournament.lake} •{" "}
                {formatResultsDate(
                  latestResults.tournament.tournament_date,
                )}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border border-white/10 bg-black p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Total Teams
                  </p>

                  <p className="mt-2 text-2xl font-black text-[#f4eee7]">
                    {finalEntries.length}
                  </p>
                </div>

                <div className="border border-white/10 bg-black p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Total Paid Out to Anglers
                  </p>

                  <p className="mt-2 text-2xl font-black text-[#c9aa4a]">
                    {displayResultsPayout(
                      payoutTotals.totalPaidOutToAnglers,
                    )}
                  </p>
                </div>

                <div className="border border-white/10 bg-black p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Big Bass
                  </p>

                  <p className="mt-2 text-2xl font-black text-[#f4eee7]">
                    {latestResults.results.big_bass_weight?.toFixed(2) ?? "—"}{" "}
                    lbs
                  </p>
                </div>

                <div className="border border-white/10 bg-black p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Big Bass Angler
                  </p>

                  <p className="mt-2 text-lg font-black text-[#f4eee7]">
                    {latestResults.results.big_bass_angler ?? "Not recorded"}
                  </p>
                </div>
              </div>
            </div>

            <div id="standings" className="scroll-mt-24 overflow-x-auto border border-[#8f762f]/60 bg-[#111111]">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#8f762f]/60 bg-[#171717]">
                    <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      Place
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      Team
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      Weight
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      Tournament
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      Bronze
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      Silver
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      Gold
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      Big Bass
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a]">
                      Total Won
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEntries.entries.map((entry) => {
                    const insurancePotWinners = getInsurancePotWinnersForEntry(
                      entry,
                      latestResults.insurancePotResult,
                    );
                    const teamPayouts = getTeamPayouts(
                      latestResults.results.entries,
                      entry.team,
                      latestResults.results.big_bass_team,
                      latestResults.results.big_bass_payout,
                    );

                    return (
                      <tr
                        key={`${entry.place}-${entry.team}`}
                        className="border-b border-white/10 last:border-b-0 hover:bg-white/[0.03]"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-[#c9aa4a]">
                          {entry.place}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-[#f4eee7]">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span>{entry.team}</span>
                          {insurancePotWinners.map((winner, index) => (
                            <span
                              key={`${winner.entryId ?? winner.entryName}-${index}`}
                              className="inline-flex shrink-0 items-center rounded-full border border-[#c9aa4a]/60 bg-[#c9aa4a]/10 px-2 py-0.5 text-[0.55rem] font-black uppercase leading-4 tracking-[0.08em] text-[#d0ae4c]"
                            >
                              Insurance
                            </span>
                          ))}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm tabular-nums text-neutral-300">
                          {payoutAmount(entry.weight).toFixed(2)} lbs
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-black tabular-nums text-[#c9aa4a]">
                          {displayResultsPayout(teamPayouts.standardTournament)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-black tabular-nums text-[#c9aa4a]">
                          {displayResultsPayout(teamPayouts.bronze)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-black tabular-nums text-[#c9aa4a]">
                          {displayResultsPayout(teamPayouts.silver)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-black tabular-nums text-[#c9aa4a]">
                          {displayResultsPayout(teamPayouts.gold)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-black tabular-nums text-[#c9aa4a]">
                          {displayResultsPayout(teamPayouts.bigBass)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-black tabular-nums text-[#f4eee7]">
                          {displayResultsPayout(teamPayouts.totalWon)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {paginatedEntries.totalPages > 1 ? (
              <nav aria-label="Standings pagination" className="flex flex-wrap items-center justify-between gap-3 border-x border-b border-[#8f762f]/60 bg-[#111111] px-4 py-4">
                <Link
                  href={pageHref(paginatedEntries.page - 1)}
                  aria-disabled={paginatedEntries.page === 1}
                  className={`border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] ${paginatedEntries.page === 1 ? "pointer-events-none text-neutral-600" : "text-[#c9aa4a] hover:border-[#c9aa4a]/60 hover:text-white"}`}
                >
                  Previous
                </Link>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                  Page {paginatedEntries.page} of {paginatedEntries.totalPages}
                </span>
                <Link
                  href={pageHref(paginatedEntries.page + 1)}
                  aria-disabled={paginatedEntries.page === paginatedEntries.totalPages}
                  className={`border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] ${paginatedEntries.page === paginatedEntries.totalPages ? "pointer-events-none text-neutral-600" : "text-[#c9aa4a] hover:border-[#c9aa4a]/60 hover:text-white"}`}
                >
                  Next
                </Link>
              </nav>
            ) : null}
            <InsurancePotWinnersSection result={latestResults.insurancePotResult} />
          </>
        )}
      </section>
    </main>
  );
}
