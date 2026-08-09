import Link from "next/link";

import PrepareMembershipReminder from "@/components/admin/PrepareMembershipReminder";
import PrintCheckInButton from "@/components/admin/PrintCheckInButton";
import RegistrationCheckInControl from "@/components/admin/RegistrationCheckInControl";
import AdminPanel from "@/components/admin/AdminPanel";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import {
  getTournamentRegistrationRoster,
  summarizeTournamentRegistrationRoster,
} from "@/lib/tournament-registration-roster";
import { getPreparationUndoProtection } from "@/lib/tournament-preparation-protection";

export const dynamic = "force-dynamic";

export default async function PrepareTournamentPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  await requireAdminUser();
  const { tournament: identifier } = await searchParams;
  const tournament = identifier
    ? await getTournamentByIdentifier(identifier)
    : null;

  if (!tournament) {
    return (
      <p className="border border-white/10 bg-[#111] p-5 text-neutral-300">
        Select a tournament in Tournament Manager first.
      </p>
    );
  }

  const [rows, undoProtection] = await Promise.all([
    getTournamentRegistrationRoster(tournament.id),
    getPreparationUndoProtection(tournament.id),
  ]);
  const summary = summarizeTournamentRegistrationRoster(rows);
  const context = encodeURIComponent(tournament.slug || tournament.id);
  const returnHref = `/admin/tournament-manager?tournament=${context}&step=1`;
  const hasExistingImport = Boolean(
    tournament.weighfish_imported || tournament.weighfish_imported_at,
  );

  return (
    <div className="space-y-5">
      <header className="hidden print:block">
        <h1 className="text-xl font-black uppercase">Early Entries &amp; Check-In</h1>
        <p className="mt-1 text-sm">{tournament.name}</p>
      </header>
      <header className="border-b border-white/10 pb-5 print:hidden">
        <Link
          href={returnHref}
          className="text-xs font-black uppercase text-[#D4A017]"
        >
          ← Back to Tournament Manager
        </Link>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-red-500">
          Prepare Tournament
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase text-white">
          Early Entries &amp; Check-In
        </h1>
        <p className="mt-2 text-sm text-neutral-400">{tournament.name}</p>
      </header>

      <AdminPanel className="p-4">
        <h2 className="text-sm font-bold text-white">
          Early Entries &amp; Check-In
        </h2>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
          <Metric label="Teams" value={summary.total} />
          <Metric label="Paid" value={summary.paid} />
          <Metric label="Need Review" value={summary.needReview} />
        </dl>
      </AdminPanel>

      <div className="print:hidden">
        <PrepareMembershipReminder
          tournamentId={tournament.id}
          tournamentName={tournament.name}
          tournamentIdentifier={context}
          needReviewCount={summary.needReview}
          hasExistingImport={hasExistingImport}
          initialRegistrationReviewComplete={Boolean(
            tournament.prepare_registration_review_complete,
          )}
          initialPaperMembershipsConfirmed={Boolean(
            tournament.paper_membership_reminder_checked,
          )}
          undoBlockers={undoProtection.blockers}
          returnHref={returnHref}
        />
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <PrintCheckInButton />
        <Link
          href={`/admin/registration-review?tournament=${encodeURIComponent(
            tournament.id,
          )}`}
          className={adminButtonStyles("secondary", "min-h-11")}
        >
          Review Registrations
        </Link>
      </div>

      <div className="overflow-x-auto rounded-md border border-white/10 bg-[#0f0f0f] shadow-[0_12px_30px_rgba(0,0,0,0.14)] print:overflow-visible">
        <table className="w-full min-w-[1200px] text-left text-sm print:min-w-0 print:text-[10px]">
          <thead className="border-b border-white/15 bg-black/40 text-xs font-black uppercase tracking-[0.06em] text-neutral-400">
            <tr>
              {[
                "Team / Solo",
                "Boater",
                "Partner",
                "Membership Status",
                "Registered",
                "Entry Status",
                "Payment Status",
                "Entry & Options",
                "Check-In",
              ].map((label) => (
                <th key={label} className="px-3 py-3">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-white/[0.025]">
                <td className="px-3 py-3 uppercase text-neutral-300">
                  {row.registrationType}
                </td>
                <td className="px-3 py-3 font-bold text-white">{row.boater}</td>
                <td className="px-3 py-3 text-neutral-300">
                  {row.partner ?? "—"}
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  <span className="font-semibold text-white">{row.membershipStatus}</span>
                  {row.membershipDetails.length ? <span className="mt-1 block text-xs text-neutral-500">{row.membershipDetails.join(" · ")}</span> : null}
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  <span className="font-mono text-xs">{row.registrationKey}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{formatRegistrationTime(row.registeredAt)}</span>
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  {row.entryStatus}
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  {row.paymentStatus}
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  {["Tournament Entry", ...row.sidePots].join(", ")}
                  {row.registrationTotalCents !== null ? <span className="mt-1 block text-xs tabular-nums text-neutral-500">{formatMoney(row.registrationTotalCents)}</span> : null}
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  <RegistrationCheckInControl tournamentId={tournament.id} registrationId={row.id} checkedInAt={row.checkedInAt} />
                  <span className="hidden print:inline">{row.checkedInAt ? "☒" : "☐"}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-8 text-center text-neutral-500"
                >
                  No online registrations are available for this tournament.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase text-neutral-500">{label}</dt>
      <dd className="mt-1 font-black tabular-nums text-white">{value}</dd>
    </div>
  );
}

function formatRegistrationTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
