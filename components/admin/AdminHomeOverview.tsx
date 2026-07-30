import Link from "next/link";

import {
  getTournamentOperationSteps,
  getTournamentRegistrationStatus,
} from "@/lib/admin-tournament-operations";
import { formatAdminTournamentDate } from "@/lib/admin-tournaments";
import type { Tournament } from "@/types/tournament";

export default function AdminHomeOverview({
  tournament,
  comparisonDate,
  pendingRegistrationReviews,
}: {
  tournament: Tournament;
  comparisonDate: string;
  pendingRegistrationReviews: number;
}) {
  const now = new Date(comparisonDate);
  const registrationStatus = getTournamentRegistrationStatus(tournament, now);
  const nextStep = getTournamentOperationSteps(tournament, now).find(
    (step) => step.state === "current",
  );
  const workflowRequiresAction = nextStep?.items.some(
    (item) => item.status === "incomplete",
  );
  const resultsAwaitingCertification = [
    "imported",
    "under_review",
    "ready_to_publish",
  ].includes(tournament.result_status);
  const hasOutstandingActions =
    pendingRegistrationReviews > 0 ||
    resultsAwaitingCertification ||
    Boolean(nextStep && workflowRequiresAction);
  const tournamentContext = encodeURIComponent(tournament.slug || tournament.id);

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="home-current-tournament"
        className="border border-white/10 bg-[#111111] p-5 sm:p-6"
      >
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
          Current Tournament
        </p>
        <h1
          id="home-current-tournament"
          className="mt-2 text-2xl font-black uppercase text-white sm:text-3xl"
        >
          {tournament.name}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {formatAdminTournamentDate(tournament.tournament_date, true)}
        </p>

        <dl className="mt-5 grid gap-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase text-neutral-500">
              Registration Status
            </dt>
            <dd className="mt-1 font-black uppercase text-white">
              {registrationStatus}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-neutral-500">
              Results Status
            </dt>
            <dd className="mt-1 font-black uppercase text-white">
              {tournament.result_status.replaceAll("_", " ")}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="needs-attention">
        <h2
          id="needs-attention"
          className="text-lg font-black uppercase text-white"
        >
          Needs Attention
        </h2>
        <div className="mt-3 divide-y divide-white/10 border border-white/10 bg-[#111111]">
          {pendingRegistrationReviews > 0 && (
            <Link
              href="/admin/registration-review"
              className="flex items-center justify-between gap-4 px-5 py-4 hover:text-[#D4A017]"
            >
              <span className="font-bold text-white">Registration Review</span>
              <span className="text-sm font-black text-[#D4A017]">
                {pendingRegistrationReviews} Pending
              </span>
            </Link>
          )}

          {resultsAwaitingCertification && (
            <Link
              href={`/admin/tournament-manager/publish?tournament=${tournamentContext}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:text-[#D4A017]"
            >
              <span className="font-bold text-white">Tournament Results</span>
              <span className="text-right text-sm font-black text-[#D4A017]">
                Awaiting Certification
              </span>
            </Link>
          )}

          {nextStep && workflowRequiresAction && (
            <Link
              href={`${nextStep.actionHref}${
                nextStep.actionHref.includes("?")
                  ? ""
                  : `?tournament=${tournamentContext}`
              }`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:text-[#D4A017]"
            >
              <span className="font-bold text-white">
                Next Tournament Workflow Step
              </span>
              <span className="text-right text-sm font-black text-[#D4A017]">
                {nextStep.title}
              </span>
            </Link>
          )}

          {!hasOutstandingActions && (
            <p className="px-5 py-4 font-bold text-neutral-300">
              <span aria-hidden="true">✓</span> No Outstanding Actions
            </p>
          )}
        </div>
      </section>

      <nav aria-label="Quick actions">
        <h2 className="text-lg font-black uppercase text-white">
          Quick Actions
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            ["Open Tournament", `/admin/tournament-manager?tournament=${tournamentContext}`],
            ["Registration Review", "/admin/registration-review"],
            ["Members", "/admin/members"],
            ["Website", "/admin/announcements"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-11 items-center border border-white/15 px-5 text-xs font-black uppercase tracking-[0.1em] text-neutral-200 hover:border-[#D4A017] hover:text-[#D4A017]"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
