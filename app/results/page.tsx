import Header from "@/components/Header";
import WinnersCircle from "@/components/WinnersCircle";
import { getLatestPublishedTournamentResults } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  let latestResults = null;

  try {
    latestResults = await getLatestPublishedTournamentResults();
  } catch (error) {
    console.error("Results index load failed.", error);
  }

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
            Official tournament results, payouts, photos, statistics, and event
            recaps from the current seeded tournament record.
          </p>
        </div>
      </section>

      <WinnersCircle latestResults={latestResults} />
    </main>
  );
}
