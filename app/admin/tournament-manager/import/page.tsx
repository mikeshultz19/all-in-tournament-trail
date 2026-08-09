import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ImportedResultsReview from "@/components/admin/ImportedResultsReview";
import WeighfishCsvUploader from "@/components/admin/WeighfishCsvUploader";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentPreparationStatus } from "@/lib/tournament-preparation";
import { getNextUpcomingTournament, getTournamentByIdentifier } from "@/lib/tournaments";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getTournamentRegistrationRoster,
  summarizeTournamentRegistrationRoster,
} from "@/lib/tournament-registration-roster";

interface ImportPageProps {
  searchParams: Promise<{ tournament?: string | string[] }>;
}

export const dynamic = "force-dynamic";

export default async function WeighFishImportPage({
  searchParams,
}: ImportPageProps) {
  await requireAdminUser();
  const params = await searchParams;

  const requestedTournament = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;

  const tournament = requestedTournament
    ? await getTournamentByIdentifier(requestedTournament)
    : await getNextUpcomingTournament();

  if (!tournament) {
    return (
      <section className="border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-sm font-semibold text-red-200">
          Select a tournament before importing results.
        </p>
      </section>
    );
  }

  const { data: importedRows } = await createSupabaseServerClient()
    .from("tournament_result_entries")
    .select(
      "id,place,team_name,total_weight,big_fish_weight,bronze_payout,silver_payout,gold_payout,participation_status,original_import_data",
    )
    .eq("tournament_id", tournament.id)
    .order("place");
  const hasImportedRows = Boolean(importedRows?.length);
  const roster = await getTournamentRegistrationRoster(tournament.id);
  const summary = summarizeTournamentRegistrationRoster(roster);
  const preparationStatus = getTournamentPreparationStatus(tournament, summary);
  const preparationComplete = preparationStatus === "Complete";
  const tournamentContext = encodeURIComponent(tournament.slug || tournament.id);
  const membersReturn = `/admin/tournament-manager?tournament=${tournamentContext}&step=1`;

  return (
    <>
      <Link
        href={
          requestedTournament
            ? `/admin/tournament-manager?tournament=${encodeURIComponent(
                requestedTournament,
              )}&step=2`
            : "/admin/tournament-manager?step=2"
        }
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-[#D4A017]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tournament Operations
      </Link>

      <header className="mt-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
          Step 2 of 6
        </p>

        <h1 className="mt-2 text-4xl font-black uppercase text-white">
          Import WeighFish
        </h1>

        <p className="mt-4 max-w-3xl text-neutral-400">
          Import the official WeighFish CSV file. This import becomes the
          official tournament standings and payout information.
        </p>
      </header>

      <section className="mt-8 border border-[#D4A017]/20 bg-[#D4A017]/5 p-6">
        <h2 className="text-lg font-black uppercase text-white">Tournament</h2>

        <p className="mt-2 text-neutral-300">
          Ready to import results for <strong>{tournament.name}</strong>
        </p>
      </section>

      <section className="mt-8 border border-white/10 bg-[#111111] p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
          Tournament Preparation
        </p>

        {preparationComplete || hasImportedRows ? (
          <p className="mt-2 text-sm leading-6 text-emerald-300">
            {preparationComplete
              ? "Tournament preparation is complete. Import Results is unlocked."
              : "Existing imported results remain available for review or reset."}
          </p>
        ) : (
          <div className="mt-2 space-y-3">
            <p className="text-sm leading-6 text-neutral-300">
              Complete Tournament Preparation before importing results.
            </p>
            <p className="text-sm leading-6 text-neutral-400">
              Resolve registration review issues and confirm the paper
              membership checklist first.
            </p>
            {hasImportedRows ? (
              <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-300">
                An import already exists for this tournament. Changing
                preparation confirmations later will lock Import Results until
                preparation is confirmed again.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/registration-review?tournament=${tournamentContext}`}
                className="inline-flex min-h-10 items-center border border-white/15 px-4 text-xs font-black uppercase text-white transition hover:border-[#D4A017] hover:text-[#D4A017]"
              >
                Registration Review
              </Link>
              <Link
                href={`/admin/members?tournament=${tournamentContext}&returnTo=${encodeURIComponent(membersReturn)}`}
                className="inline-flex min-h-10 items-center border border-white/15 px-4 text-xs font-black uppercase text-white transition hover:border-[#D4A017] hover:text-[#D4A017]"
              >
                {tournament.name} Members List →
              </Link>
            </div>
          </div>
        )}
      </section>

      {preparationComplete || hasImportedRows ? (
        <div className="mt-8">
          {!hasImportedRows ? (
            <WeighfishCsvUploader key={tournament.id} tournamentId={tournament.id} />
          ) : (
            <ImportedResultsReview
              tournamentId={tournament.id}
              tournamentSlug={tournament.slug || tournament.id}
              rows={importedRows ?? []}
              verified={Boolean(tournament.results_verified_at)}
              published={tournament.result_status === "official"}
            />
          )}
        </div>
      ) : null}
    </>
  );
}
