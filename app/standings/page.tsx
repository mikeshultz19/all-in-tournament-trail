import Header from "@/components/Header";
import {
  getPublishedAoyStandings,
  type PublicAoyStanding,
} from "@/lib/aoy-standings";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  let standings: PublicAoyStanding[] = [];

  try {
    standings = await getPublishedAoyStandings();
  } catch (error) {
    console.error("AOY standings page load failed.", error);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header activeItem="Standings" />

      <section className="border-b border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto max-w-[1500px] px-6 py-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
            All-In Tournament Trail
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase tracking-tight">
            AOY Standings
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-neutral-400">
            Current Angler of the Year points from officially published AITT tournament results.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-12">
        {standings.length === 0 ? (
          <div className="border border-white/10 bg-[#111111] px-6 py-12 text-center">
            <p className="text-sm text-neutral-400">
              AOY standings will appear after the first tournament results are published.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#8f762f]/60 bg-[#111111]">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[#8f762f]/60 bg-[#171717]">
                  {["Rank", "Angler / Team", "Events", "Points"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-[#c9aa4a] ${
                          heading === "Events" || heading === "Points"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => (
                  <tr
                    key={standing.angler}
                    className="border-b border-white/10 last:border-b-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 text-sm font-black text-[#c9aa4a]">
                      {standing.place}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold uppercase tracking-wide text-white">
                      {standing.angler}
                    </td>
                    <td className="px-5 py-4 text-right text-sm tabular-nums text-neutral-300">
                      {standing.events}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-black tabular-nums text-[#c9aa4a]">
                      {standing.points.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
