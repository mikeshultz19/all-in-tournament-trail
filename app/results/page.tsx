import Header from "@/components/Header";
import { getLatestPublishedTournamentResults } from "@/lib/results";

export const dynamic = "force-dynamic";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatTournamentDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ResultsPage() {
  let latestResults = null;

  try {
    latestResults = await getLatestPublishedTournamentResults();
  } catch (error) {
    console.error("Results index load failed.", error);
  }

  const finalEntries =
    latestResults?.results.entries
      .filter((entry) => entry.kind !== "sidePot")
      .sort((a, b) => a.place - b.place) ?? [];

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
                {formatTournamentDate(
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
                    Total Payout
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#c9aa4a]">
                    {formatCurrency(
                      latestResults.results.total_payout +
                        latestResults.results.bronze_payout +
                        latestResults.results.silver_payout +
                        latestResults.results.gold_payout +
                        latestResults.results.insurance_pot_payout +
                        (latestResults.results.big_bass_payout ?? 0),
                    )}
                  </p>
                </div>

                <div className="border border-white/10 bg-black p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Big Bass
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#f4eee7]">
                    {latestResults.results.big_bass_weight?.toFixed(2) ?? "—"} lbs
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
                      Base Payout
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {finalEntries.map((entry) => (
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
                        {entry.weight.toFixed(2)} lbs
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-black tabular-nums text-[#c9aa4a]">
                        {formatCurrency(entry.baseWinnings ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}