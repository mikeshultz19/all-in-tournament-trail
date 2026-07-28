import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import TournamentResultsForm from "@/components/admin/TournamentResultsForm";
import { getTournamentResults } from "@/lib/results";
import {
  getNextUpcomingTournament,
  getTournamentByIdentifier,
} from "@/lib/tournaments";

export const dynamic = "force-dynamic";

export default async function ResultsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string | string[] }>;
}) {
  const params = await searchParams;
  const identifier = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;
  let tournament = null;
  let results = null;
  let loadFailed = false;

  try {
    tournament = identifier
      ? await getTournamentByIdentifier(identifier)
      : await getNextUpcomingTournament();
    results = tournament ? await getTournamentResults(tournament.id) : null;
  } catch (error) {
    console.error("Tournament Results page load failed.", error);
    loadFailed = true;
  }

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Admin Center
      </Link>
      <div className="mt-6 border-b border-white/10 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
          Management
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Tournament Results
        </h1>
      </div>

      {tournament ? (
        <>
          <TournamentResultsForm
            tournament={tournament}
            initialEntries={results?.entries ?? []}
            initialTotalPayout={results?.total_payout ?? 0}
            initialBronzePayout={results?.bronze_payout ?? 0}
            initialSilverPayout={results?.silver_payout ?? 0}
            initialGoldPayout={results?.gold_payout ?? 0}
            initialInsurancePotPayout={results?.insurance_pot_payout ?? 0}
            initialBigBassPayout={results?.big_bass_payout ?? 0}
            initialBigBassAngler={results?.big_bass_angler ?? null}
            initialBigBassTeam={results?.big_bass_team ?? null}
            initialBigBassWeight={results?.big_bass_weight ?? null}
            initialChampionImageUrl={results?.champion_image_url ?? null}
            initialBigBassImageUrl={results?.big_bass_image_url ?? null}
          />
        </>
      ) : (
        <section className="mt-6 border border-white/10 bg-[#111111] p-6">
          <h2 className="text-xl font-black uppercase text-white">
            {loadFailed ? "Results Unavailable" : "Tournament Not Found"}
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            {loadFailed
              ? "Apply the results migration, then try again."
              : "Choose an existing tournament from the Admin Center."}
          </p>
        </section>
      )}
    </>
  );
}
