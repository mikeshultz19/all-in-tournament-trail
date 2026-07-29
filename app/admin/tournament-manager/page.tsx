import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Upload,
} from "lucide-react";
import Link from "next/link";

import {
  getNextUpcomingTournament,
  getTournamentByIdentifier,
  getActiveSeasonSchedule,
} from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";

interface TournamentManagerPageProps {
  searchParams: Promise<{ tournament?: string | string[] }>;
}

export const dynamic = "force-dynamic";

function getTournamentLabel(tournament: Tournament) {
  const record = tournament as Tournament & {
    name?: string | null;
    title?: string | null;
    lake?: string | null;
    location?: string | null;
    tournament_date?: string | null;
    date?: string | null;
  };

  const name =
    record.name ??
    record.title ??
    record.lake ??
    record.location ??
    "Tournament";

  const dateValue = record.tournament_date ?? record.date;

  if (!dateValue) {
    return name;
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return name;
  }

  return `${name} — ${parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function getTournamentIdentifier(tournament: Tournament) {
  const record = tournament as Tournament & {
    slug?: string | null;
  };

  return record.slug ?? tournament.id;
}

export default async function TournamentManagerPage({
  searchParams,
}: TournamentManagerPageProps) {
  const params = await searchParams;

  const requestedTournament = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;

  let tournaments: Tournament[] = [];
  let selectedTournament: Tournament | null = null;
  let loadFailed = false;

  try {
    tournaments = await getActiveSeasonSchedule();

    selectedTournament = requestedTournament
      ? await getTournamentByIdentifier(requestedTournament)
      : await getNextUpcomingTournament();
  } catch (error) {
    console.error("Tournament Manager load failed.", error);
    loadFailed = true;
  }

  const selectedTournamentIdentifier = selectedTournament
    ? getTournamentIdentifier(selectedTournament)
    : null;

  const steps = selectedTournamentIdentifier
    ? [
        {
          number: 1,
          title: "Tournament Information",
          description:
            "Review the tournament details, schedule, registration, and public information.",
          href: `/admin/tournament?tournament=${encodeURIComponent(
            selectedTournamentIdentifier,
          )}`,
          icon: CheckCircle2,
        },
        {
          number: 2,
          title: "Import WeighFish",
          description:
            "Upload the official WeighFish CSV, validate the results, and import tournament standings and payouts.",
          href: `/admin/tournament-manager/import?tournament=${encodeURIComponent(
            selectedTournamentIdentifier,
          )}`,
          icon: FileSpreadsheet,
        },
        {
          number: 3,
          title: "Insurance Review",
          description:
            "Review and enter the tournament's manual Insurance payout.",
          href: `/admin/tournament-manager/insurance?tournament=${encodeURIComponent(
            selectedTournamentIdentifier,
          )}`,
          icon: ShieldCheck,
        },
        {
          number: 4,
          title: "Winner Photos",
          description:
            "Upload the champion and Big Bass winner photos used throughout the public website.",
          href: `/admin/tournament-manager/photos?tournament=${encodeURIComponent(
            selectedTournamentIdentifier,
          )}`,
          icon: Camera,
        },
        {
          number: 5,
          title: "Publish Tournament",
          description:
            "Perform the final review and publish the completed tournament results.",
          href: `/admin/tournament-manager/publish?tournament=${encodeURIComponent(
            selectedTournamentIdentifier,
          )}`,
          icon: Upload,
        },
      ]
    : [];

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Admin Center
      </Link>

      <header className="mt-6 border-b border-white/10 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
          Post-Tournament Workflow
        </p>

        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Tournament Manager
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
          Complete each step after tournament day. WeighFish provides the
          official standings and payouts. Insurance is reviewed separately,
          winner photos are uploaded, and the tournament is published only
          after the final review.
        </p>
      </header>

      {loadFailed ? (
        <section className="mt-6 border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="text-xl font-black uppercase text-white">
            Tournament Manager Unavailable
          </h2>

          <p className="mt-3 text-sm leading-6 text-neutral-300">
            We could not load tournament information. Please try again.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-6 border border-white/10 bg-[#111111] p-5 sm:p-6">
            <label
              htmlFor="tournament-manager-select"
              className="text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]"
            >
              Select Tournament
            </label>

            {tournaments.length > 0 ? (
              <form className="mt-3 flex flex-col gap-3 sm:flex-row">
                <select
                  id="tournament-manager-select"
                  name="tournament"
                  defaultValue={selectedTournamentIdentifier ?? ""}
                  className="min-h-12 flex-1 border border-white/15 bg-black px-4 text-sm font-bold text-white outline-none transition-colors focus:border-[#D4A017]"
                >
                  {!selectedTournament && (
                    <option value="">Select a tournament</option>
                  )}

                  {tournaments.map((tournament) => {
                    const identifier = getTournamentIdentifier(tournament);

                    return (
                      <option key={tournament.id} value={identifier}>
                        {getTournamentLabel(tournament)}
                      </option>
                    );
                  })}
                </select>

                <button
                  type="submit"
                  className="min-h-12 bg-[#D4A017] px-6 text-xs font-black uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#e5b52a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
                >
                  Load Tournament
                </button>
              </form>
            ) : (
              <div className="mt-4">
                <p className="text-sm leading-6 text-neutral-400">
                  No tournaments have been created yet.
                </p>

                <Link
                  href="/admin/tournament"
                  className="mt-4 inline-flex min-h-11 items-center bg-[#D4A017] px-5 text-xs font-black uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#e5b52a]"
                >
                  Open Tournament Information
                </Link>
              </div>
            )}
          </section>

          {selectedTournament ? (
            <>
              <section className="mt-6 border border-[#4A3A12] bg-[#D4A017]/5 p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]">
                  Selected Tournament
                </p>

                <h2 className="mt-2 text-xl font-black uppercase text-white">
                  {getTournamentLabel(selectedTournament)}
                </h2>
              </section>

              <section
                aria-label="Tournament workflow"
                className="mt-6 grid gap-4"
              >
                {steps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <Link
                      key={step.number}
                      href={step.href}
                      className="group border border-white/10 bg-[#111111] p-5 transition-colors hover:border-[#D4A017]/70 hover:bg-[#D4A017]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017] sm:p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center border border-[#D4A017]/40 bg-[#D4A017]/10 text-[#D4A017]">
                          <Icon aria-hidden="true" className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
                            Step {step.number}
                          </p>

                          <h3 className="mt-1 text-lg font-black uppercase text-white transition-colors group-hover:text-[#D4A017]">
                            {step.title}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-neutral-400">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </section>
            </>
          ) : tournaments.length > 0 ? (
            <section className="mt-6 border border-white/10 bg-[#111111] p-6">
              <h2 className="text-xl font-black uppercase text-white">
                Select a Tournament
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-400">
                Select the tournament you want to process, then load it to open
                the post-tournament workflow.
              </p>
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
