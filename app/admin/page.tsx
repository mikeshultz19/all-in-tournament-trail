import Link from "next/link";
import {
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  ListChecks,
  Megaphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import AdminPanel from "@/components/admin/AdminPanel";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";

import {
  getActiveSeasonSchedule,
  getNextUpcomingTournament,
} from "@/lib/tournaments";
import {
  listTournamentPurchasedMembershipCounts,
  listTournamentRegistrationRosterSummaries,
} from "@/lib/tournament-registration-roster";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  let data: Awaited<ReturnType<typeof loadAdminHomeData>> | null = null;

  try {
    data = await loadAdminHomeData();
  } catch (error) {
    console.error("Admin home dashboard load failed.", error);
  }

  if (!data) {
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

  const {
    selectedTournament,
    selectedIdentifier,
    registrationSummary,
    newMemberships,
    websitePublished,
  } = data;

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
          <AdminPanel accent className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm border border-red-500/30 bg-red-500/10 text-red-400">
                  <CalendarDays aria-hidden="true" className="size-4" />
                </span>
                <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">
                  Current Tournament
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase text-white">
                  {selectedTournament.name}
                </h2></div>
              </div>

              <Link
                href={`/admin/tournament-manager?tournament=${selectedIdentifier}`}
                className={adminButtonStyles("primary", "min-h-11 px-5")}
              >
                Open Tournament Manager
              </Link>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatusCard
                label="Registration & Check-In"
                value={String(registrationSummary?.total ?? 0)}
                detail={`${registrationSummary?.needReview ?? 0} need review`}
                actionHref={`/admin/registration-review?tournament=${encodeURIComponent(selectedTournament.id)}`}
                actionLabel="Open Roster"
              />
              <StatusCard
                label="New Memberships"
                value={String(newMemberships)}
              />
              <StatusCard
                label="Website Status"
                value={websitePublished ? "Published" : "Not Published"}
              />
            </dl>
          </AdminPanel>
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

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <QuickLink
              href="/admin/tournament-manager"
              title="Tournament Manager"
              icon={ClipboardList}
            />
            <QuickLink
              href="/admin/tournament"
              title="Tournament Info"
              icon={CalendarDays}
            />
            <QuickLink
              href="/admin/registration-review"
              title="Registration & Check-In"
              icon={ListChecks}
            />
            <QuickLink
              href="/admin/members"
              title="Members"
              icon={UsersRound}
            />
            <QuickLink
              href="/admin/announcements"
              title="Announcements"
              icon={Megaphone}
            />
            <QuickLink
              href="/admin/analytics"
              title="Website Analytics"
              icon={ChartNoAxesCombined}
            />
          </div>
        </section>
      </div>
  );
}

async function loadAdminHomeData() {
  const [tournaments, nextTournament] = await Promise.all([
    getActiveSeasonSchedule(),
    getNextUpcomingTournament(),
  ]);

  const tournamentIds = tournaments.map((tournament) => tournament.id);

  const [registrationSummaries, purchasedMembershipCounts] =
    await Promise.all([
      listTournamentRegistrationRosterSummaries(tournamentIds),
      listTournamentPurchasedMembershipCounts(tournamentIds),
    ]);

  const selectedTournament = nextTournament ?? tournaments[0] ?? null;
  const selectedId = selectedTournament?.id;

  return {
    selectedTournament,
    selectedIdentifier: selectedTournament
      ? encodeURIComponent(selectedTournament.slug || selectedTournament.id)
      : "",
    registrationSummary: selectedId
      ? registrationSummaries[selectedId]
      : undefined,
    newMemberships: selectedId ? purchasedMembershipCounts[selectedId] ?? 0 : 0,
    websitePublished: Boolean(selectedTournament?.official_results_published_at),
  };
}

function StatusCard({
  label,
  value,
  detail,
  actionHref,
  actionLabel,
}: {
  label: string;
  value: string;
  detail?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-sm border border-white/10 bg-black/30 p-4">
      <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </dt>
      <dd className="mt-2 text-lg font-bold text-white">
        {isStatusValue(value) ? <AdminStatusBadge>{value}</AdminStatusBadge> : value}
      </dd>
      {detail ? (
        <p className="mt-1 text-xs text-neutral-500">{detail}</p>
      ) : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-3 inline-flex text-xs font-black uppercase text-[#D4A017] hover:text-white">
          {actionLabel} →
        </Link>
      ) : null}
    </div>
  );
}

function isStatusValue(value: string) {
  return ["Ready", "Needs Review", "Published", "Not Published"].includes(value);
}

function QuickLink({
  href,
  title,
  icon: Icon,
}: {
  href: string;
  title: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-14 items-center gap-3 rounded-sm border border-[#D4A017]/20 bg-gradient-to-r from-[#15130d] to-[#111111] px-3 py-2.5 transition hover:border-[#D4A017]/55 hover:bg-[#D4A017]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-[#D4A017]/20 bg-[#D4A017]/10 text-[#D4A017] transition group-hover:border-[#D4A017]/45 group-hover:bg-[#D4A017]/15 group-hover:text-[#e2b22a]">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="text-xs font-black uppercase tracking-[0.08em] text-neutral-100 transition group-hover:text-[#E8C966]">{title}</span>
    </Link>
  );
}
