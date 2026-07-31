import Link from "next/link";
import {
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Globe,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";

import {
  getTournamentOperationSteps,
  getTournamentRegistrationStatus,
} from "@/lib/admin-tournament-operations";
import { formatAdminTournamentDate } from "@/lib/admin-tournaments";
import type { Tournament } from "@/types/tournament";
import type { RegistrationReviewDashboardSummary } from "@/lib/registration-identity-review";

export default function AdminHomeOverview({
  tournament,
  comparisonDate,
  registrationReviewSummary,
}: {
  tournament: Tournament;
  comparisonDate: string;
  registrationReviewSummary: RegistrationReviewDashboardSummary;
}) {
  const {
    pendingReviewCount,
    duplicateCount,
    membershipMatchCount,
  } = registrationReviewSummary;
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

      <section
        aria-labelledby="registration-review-summary"
        className="rounded-2xl border border-white/10 bg-zinc-950 p-5 lg:p-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-zinc-300">
              <UsersRound aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="registration-review-summary"
                className="text-lg font-bold text-white"
              >
                Registration Review
              </h2>
              <p className="mt-4 text-4xl font-bold text-white">
                {pendingReviewCount}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Registrations need attention
              </p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 divide-x divide-white/10">
            <div className="px-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Possible Duplicates
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {duplicateCount}
              </p>
            </div>
            <div className="px-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Membership Matches
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {membershipMatchCount}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
            {pendingReviewCount === 0 ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-400">
                All Clear
                <CircleCheck aria-hidden="true" className="h-5 w-5" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-400">
                Action Needed
                <CircleAlert aria-hidden="true" className="h-5 w-5" />
              </span>
            )}
            <Link
              href="/admin/registration-review"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
            >
              Review Registrations
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="needs-attention">
        <h2
          id="needs-attention"
          className="text-lg font-black uppercase text-white"
        >
          Needs Attention
        </h2>
        <div className="mt-3 divide-y divide-white/10 border border-white/10 bg-[#111111]">
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
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Open Tournament",
              href: `/admin/tournament-manager?tournament=${tournamentContext}`,
              icon: CalendarDays,
            },
            {
              label: "Registration Review",
              href: "/admin/registration-review",
              icon: UserRoundSearch,
            },
            {
              label: "Members",
              href: "/admin/members",
              icon: UsersRound,
            },
            {
              label: "Website",
              href: "/admin/announcements",
              icon: Globe,
            },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-24 items-center gap-4 rounded-xl border border-white/10 bg-zinc-950 p-4 text-left transition hover:border-white/20 hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400 transition group-hover:bg-red-600/15 group-hover:text-red-400">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="text-sm font-bold text-white">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
