import Link from "next/link";
import { CalendarDays, Globe, UsersRound } from "lucide-react";

import { getTournamentRegistrationStatus } from "@/lib/admin-tournament-operations";
import { formatAdminTournamentDate } from "@/lib/admin-tournaments";
import type { TournamentRegistrationReviewSummary } from "@/lib/registration-identity-review";
import type { TournamentMembershipSummary } from "@/lib/admin-home-membership-summary";
import type { TournamentRegistrationRosterSummary } from "@/lib/tournament-registration-roster";
import type { Tournament } from "@/types/tournament";

export default function AdminHomeOverview({
  tournament,
  comparisonDate,
  registrationReviewSummary,
  resultsPublished,
  membershipSummary,
}: {
  tournament: Tournament;
  comparisonDate: string;
  registrationReviewSummary: TournamentRegistrationReviewSummary;
  resultsPublished: boolean;
  membershipSummary: TournamentMembershipSummary;
  onlineRegistrationSummary: TournamentRegistrationRosterSummary;
}) {
  const registrationStatus = getTournamentRegistrationStatus(
    tournament,
    new Date(comparisonDate),
  );
  const tournamentContext = encodeURIComponent(
    tournament.slug || tournament.id,
  );
  const { total, verified, pending } = registrationReviewSummary;

  return (
    <div className="space-y-5">
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
          {tournament.lake} ·{" "}
          {formatAdminTournamentDate(tournament.tournament_date, true)}
        </p>

        <dl className="mt-5 grid gap-4 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase text-neutral-500">
              Registration
            </dt>
            <dd className="mt-1 font-black uppercase text-white">
              {registrationStatus}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-neutral-500">
              Results
            </dt>
            <dd className="mt-1 font-black uppercase text-white">
              {resultsPublished ? "Published" : "Not Published"}
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase text-white">
              Registration &amp; Check-In
            </h2>
            <Link
              href="/admin/registration-review"
              className="text-xs font-black uppercase text-[#D4A017] hover:text-white"
            >
              View Registration &amp; Check-In →
            </Link>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <CompactMetric label="Registered" value={total} />
            <CompactMetric label="Verified" value={verified} />
            <CompactMetric label="Need Review" value={pending} attention={pending > 0} />
          </dl>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase text-white">
              Membership Summary
            </h2>
            <Link
              href="/admin/members"
              className="text-xs font-black uppercase text-[#D4A017] hover:text-white"
            >
              View Membership Details →
            </Link>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <CompactMetric label="Online Memberships" value={membershipSummary.online} />
            <CompactMetric label="Event Memberships" value={membershipSummary.event} />
            <CompactMetric label="Total Memberships" value={membershipSummary.total} />
          </dl>
        </div>
      </section>

      <nav aria-label="Quick actions">
        <h2 className="text-lg font-black uppercase text-white">
          Quick Actions
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            {
              label: "Open Tournament",
              href: `/admin/tournament-manager?tournament=${tournamentContext}`,
              icon: CalendarDays,
            },
            { label: "Members", href: "/admin/members", icon: UsersRound },
            { label: "Website", href: "/admin/announcements", icon: Globe },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded bg-white/5 text-zinc-400 transition group-hover:bg-red-600/15 group-hover:text-red-400">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm font-bold text-white">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function CompactMetric({ label, value, attention = false }: { label: string; value: number; attention?: boolean }) {
  return <div><dt className="text-xs uppercase text-neutral-500">{label}</dt><dd className={`mt-1 font-black ${attention ? "text-[#D4A017]" : "text-white"}`}>{value}</dd></div>;
}
