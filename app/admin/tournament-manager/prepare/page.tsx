import Link from "next/link";

import PrepareMembershipReminder from "@/components/admin/PrepareMembershipReminder";
import PrintCheckInButton from "@/components/admin/PrintCheckInButton";
import { requireAdminUser } from "@/lib/admin-auth";
import { getTournamentByIdentifier } from "@/lib/tournaments";
import {
  getTournamentRegistrationRoster,
  summarizeTournamentRegistrationRoster,
} from "@/lib/tournament-registration-roster";

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

  const rows = await getTournamentRegistrationRoster(tournament.id);
  const summary = summarizeTournamentRegistrationRoster(rows);
  const context = encodeURIComponent(tournament.slug || tournament.id);
  const returnHref = `/admin/tournament-manager?tournament=${context}&step=1`;
  const hasExistingImport = Boolean(
    tournament.weighfish_imported || tournament.weighfish_imported_at,
  );

  return (
    <div className="space-y-5">
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
          Registration Roster
        </h1>
        <p className="mt-2 text-sm text-neutral-400">{tournament.name}</p>
      </header>

      <section className="border border-white/10 bg-[#111] p-4">
        <h2 className="text-sm font-black uppercase text-white">
          Online Registration Roster
        </h2>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
          <Metric label="Teams" value={summary.total} />
          <Metric label="Paid" value={summary.paid} />
          <Metric label="Need Review" value={summary.needReview} />
        </dl>
      </section>

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
        returnHref={returnHref}
      />

      <div className="flex flex-wrap gap-3 print:hidden">
        <a
          href={`/admin/tournament-manager/prepare/export?tournament=${context}`}
          className="inline-flex min-h-11 items-center bg-[#D4A017] px-4 text-xs font-black uppercase text-black"
        >
          Export for WeighFish
        </a>
        <PrintCheckInButton />
        <Link
          href={`/admin/registration-review?tournament=${encodeURIComponent(
            tournament.id,
          )}`}
          className="inline-flex min-h-11 items-center border border-white/15 px-4 text-xs font-black uppercase text-white"
        >
          Review Registrations
        </Link>
      </div>

      <div className="overflow-x-auto border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs font-black uppercase text-neutral-500">
            <tr>
              {[
                "Team / Solo",
                "Boater",
                "Partner",
                "Membership Status",
                "Entry Status",
                "Payment Status",
                "Side Pots",
              ].map((label) => (
                <th key={label} className="px-3 py-3">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-3 uppercase text-neutral-300">
                  {row.registrationType}
                </td>
                <td className="px-3 py-3 font-bold text-white">{row.boater}</td>
                <td className="px-3 py-3 text-neutral-300">
                  {row.partner ?? "—"}
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  {row.membershipStatus}
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  {row.entryStatus}
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  {row.paymentStatus}
                </td>
                <td className="px-3 py-3 text-neutral-300">
                  {row.sidePots.join(", ") || "None"}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
      <dd className="mt-1 font-black text-white">{value}</dd>
    </div>
  );
}
