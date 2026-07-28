import Link from "next/link";
import type { LatestTournamentResults } from "@/types/results";
import Header from "@/components/Header";
import {
  calculateResultPayouts,
  displayResultsPayout,
  formatResultsDate,
  getTeamPayouts,
  isSidePotEntry,
  payoutAmount,
} from "@/lib/result-payouts";
import {
  getPublishedTournamentResultsArchive,
} from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
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
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <section className="border-b border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto max-w-[1500px] px-6 py-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
            All-In Tournament Trail
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase tracking-tight">
            Tournament Results
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-neutral-400">
            Official tournament standings, weights, payouts, and event details.
          </p>
        </div>
      </section>

      {pastTournamentResults.length > 0 ? (
        <nav
          aria-label="Results archive"
          className="border-b border-white/10 bg-[#111111]"
        >
          <div className="mx-auto flex max-w-[1500px] items-center gap-4 overflow-x-auto px-6 py-3">
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

      <section className="mx-auto max-w-[1500px] px-6 py-12">
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
            <div className="mb-8 border border-[#8f762f]/60 bg-[#111111] p-6">
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

            <div className="overflow-x-auto border border-[#8f762f]/60 bg-[#111111]">
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
                  {finalEntries.map((entry) => {
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
                          {entry.team}
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
          </>
        )}
      </section>
    </main>
  );
}
