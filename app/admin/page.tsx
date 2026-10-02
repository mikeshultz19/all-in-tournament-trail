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
import { getTournamentRegistrationRoster, listTournamentRegistrationRosterSummaries } from "@/lib/tournament-registration-roster";
import { listTournamentCollectionSummaries } from "@/lib/tournament-collection-summary";
import { listTournamentInsurancePotResults } from "@/lib/insurance-pot-results";

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
    websitePublished,
    paymentSummary,
    launchOrderCount,
    checkInsRemaining,
    walkUpCount,
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

              <div className="flex flex-col items-stretch gap-3 lg:items-end">
                <Link
                  href={`/admin/tournament-manager?tournament=${selectedIdentifier}`}
                  className={adminButtonStyles("primary", "min-h-11 px-5")}
                >
                  Open Tournament Manager
                </Link>
                <div className="rounded-sm border border-white/10 bg-black/30 px-4 py-3 lg:min-w-52">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Website Status</p>
                  <div className="mt-2"><AdminStatusBadge>{websitePublished ? "Published" : "Not Published"}</AdminStatusBadge></div>
                </div>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatusCard
                label="Registration & Check-In"
                value={String(registrationSummary?.total ?? 0)}
                detail={`${walkUpCount} walk-ups · ${registrationSummary?.needReview ?? 0} need review`}
                actionHref={`/admin/registration-review?tournament=${encodeURIComponent(selectedTournament.id)}`}
                actionLabel="Open Roster"
              />
              <PaymentTotalsCard summary={paymentSummary} />
              <StatusCard
                label="Launch Order by Boat Number"
                value={`${launchOrderCount} assigned`}
                detail={`${checkInsRemaining} check-ins remaining`}
                actionHref={`/admin/launch-order?tournament=${encodeURIComponent(selectedTournament.id)}`}
                actionLabel="Open Launch Order"
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
              href="/admin/payment-recovery"
              title="Payment Recovery"
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

  const registrationSummaries = await listTournamentRegistrationRosterSummaries(tournamentIds);

  const selectedTournament = nextTournament ?? tournaments[0] ?? null;
  const selectedId = selectedTournament?.id;
  const selectedRoster = selectedId ? await getTournamentRegistrationRoster(selectedId) : [];
  const paymentSummary = selectedId
    ? (await listTournamentCollectionSummaries(
      [selectedId],
      await listTournamentInsurancePotResults([selectedId]),
    ))[selectedId] ?? null
    : null;
  const launchOrderCount = selectedRoster
    .filter((row) => row.assignedBoatNumber !== null && row.assignedBoatNumber !== undefined)
    .length;
  const checkInsRemaining = selectedRoster.filter((row) => !row.checkedInAt).length;
  const walkUpCount = selectedRoster.filter((row) => row.registrationSource === "walk_up").length;

  return {
    selectedTournament,
    selectedIdentifier: selectedTournament
      ? encodeURIComponent(selectedTournament.slug || selectedTournament.id)
      : "",
    registrationSummary: selectedId
      ? registrationSummaries[selectedId]
      : undefined,
    websitePublished: Boolean(selectedTournament?.official_results_published_at),
    paymentSummary,
    launchOrderCount,
    checkInsRemaining,
    walkUpCount,
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

function PaymentTotalsCard({ summary }: { summary: Awaited<ReturnType<typeof loadAdminHomeData>>["paymentSummary"] }) {
  const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  return (
    <div className="rounded-sm border border-white/10 bg-black/30 p-4">
      <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Payment Totals</dt>
      {summary ? (
        <dl className="mt-2 space-y-1.5 text-xs">
          <PaymentTotal label="Total collected" value={money(summary.totalRegistrationFundsCollectedCents)} emphasized />
          <PaymentTotal label="Payout funds" value={money(summary.totalTournamentPayoutFundsCents)} />
          <PaymentTotal label="Memberships" value={money(summary.membershipRevenueCents)} />
        </dl>
      ) : <p className="mt-2 text-xs text-neutral-500">No payment totals available.</p>}
    </div>
  );
}

function PaymentTotal({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return <div className="flex items-baseline justify-between gap-2"><dt className="text-neutral-500">{label}</dt><dd className={`font-black tabular-nums ${emphasized ? "text-[#D4A017]" : "text-white"}`}>{value}</dd></div>;
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
