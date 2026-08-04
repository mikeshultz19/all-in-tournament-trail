import Link from "next/link";

import {
  getActiveSeasonSchedule,
  getNextUpcomingTournament,
} from "@/lib/tournaments";
import { listTournamentRegistrationRosterSummaries } from "@/lib/tournament-registration-roster";
import { listTournamentImportEvidence } from "@/lib/tournament-import-evidence";
import { listTournamentInsurancePotResults } from "@/lib/insurance-pot-results";
import { listOnSiteCloseouts } from "@/lib/on-site-closeout";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const now = new Date();

  try {
    const [tournaments, nextTournament] = await Promise.all([
      getActiveSeasonSchedule(),
      getNextUpcomingTournament(),
    ]);

    const tournamentIds = tournaments.map((tournament) => tournament.id);

    const [
      registrationSummaries,
      importEvidence,
      insuranceResults,
      closeouts,
    ] = await Promise.all([
      listTournamentRegistrationRosterSummaries(tournamentIds),
      listTournamentImportEvidence(tournamentIds),
      listTournamentInsurancePotResults(tournamentIds),
      listOnSiteCloseouts(tournamentIds),
    ]);

    const selectedTournament =
      nextTournament ?? tournaments[0] ?? null;

    const selectedId = selectedTournament?.id;
    const selectedIdentifier = selectedTournament
      ? encodeURIComponent(selectedTournament.slug || selectedTournament.id)
      : "";

    const registrationSummary = selectedId
      ? registrationSummaries[selectedId]
      : undefined;

    const imported = selectedId
      ? Boolean(importEvidence[selectedId])
      : false;

    const insuranceSaved = selectedId
      ? Boolean(insuranceResults[selectedId])
      : false;

    const payoutComplete = selectedId
      ? closeouts[selectedId]?.status === "complete"
      : false;

    return (
      <div className="space-y-6">
        <header className="border-b border-white/10 pb-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
            AITT Admin Center
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase text-white">
            Home
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
            Quick access to tournament operations, website management, memberships,
            and registration review.
          </p>
        </header>

        {selectedTournament ? (
          <section className="border border-white/10 bg-[#111111] p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">
                  Current Tournament
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase text-white">
                  {selectedTournament.name}
                </h2>
              </div>

              <Link
                href={`/admin/tournament-manager?tournament=${selectedIdentifier}`}
                className="inline-flex min-h-11 items-center justify-center bg-[#D4A017] px-5 text-xs font-black uppercase text-black"
              >
                Open Tournament Manager
              </Link>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatusCard
                label="Registrations"
                value={String(registrationSummary?.total ?? 0)}
                detail={`${registrationSummary?.needReview ?? 0} need review`}
              />
              <StatusCard
                label="Results Import"
                value={imported ? "Started" : "Not Started"}
              />
              <StatusCard
                label="Insurance Pot"
                value={insuranceSaved ? "Saved" : "Not Started"}
              />
              <StatusCard
                label="Payouts"
                value={payoutComplete ? "Complete" : "Not Complete"}
              />
            </dl>
          </section>
        ) : (
          <section className="border border-white/10 bg-[#111111] p-6">
            <h2 className="text-xl font-black uppercase text-white">
              No Tournament Available
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Add a tournament before using tournament operations.
            </p>
          </section>
        )}

        <section>
          <h2 className="text-lg font-black uppercase text-white">
            Quick Access
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <QuickLink
              href="/admin/tournament-manager"
              title="Tournament Manager"
              description="Run tournament-day operations from preparation through publication."
            />
            <QuickLink
              href="/admin/tournament"
              title="Tournament Info"
              description="Edit public tournament dates, locations, registration details, and event information."
            />
            <QuickLink
              href="/admin/registration-review"
              title="Registration Review"
              description="Resolve registrations that need attention."
            />
            <QuickLink
              href="/admin/members"
              title="Members"
              description="Review and manage AITT memberships."
            />
            <QuickLink
              href="/admin/announcements"
              title="Announcements"
              description="Manage public website announcements."
            />
            <QuickLink
              href="/admin/analytics"
              title="Website Analytics"
              description="Review website traffic and registration interest."
            />
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Admin home dashboard load failed.", error);

    return (
      <section className="border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-xl font-black uppercase text-white">
          Admin Dashboard Unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          We could not load the admin dashboard. Please try again.
        </p>
      </section>
    );
  }
}

function StatusCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="border border-white/10 bg-black/30 p-4">
      <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </dt>
      <dd className="mt-2 text-lg font-black uppercase text-white">{value}</dd>
      {detail ? (
        <p className="mt-1 text-xs text-neutral-500">{detail}</p>
      ) : null}
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="border border-white/10 bg-[#111111] p-5 transition hover:border-[#D4A017]"
    >
      <h3 className="font-black uppercase text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{description}</p>
    </Link>
  );
}