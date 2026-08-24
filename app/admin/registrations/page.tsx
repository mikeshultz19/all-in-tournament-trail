import Link from "next/link";
import type { ReactNode } from "react";

import AdminPanel from "@/components/admin/AdminPanel";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import RegistrationHistoryList from "@/components/admin/RegistrationHistoryList";
import {
  filterRegistrationHistory,
  listAllRegistrationHistory,
  type AdminRegistrationHistoryRow,
} from "@/lib/admin-registration-history";
import { getTournaments } from "@/lib/tournaments";

export const dynamic = "force-dynamic";
const pageSize = 50;

export default async function AllRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tournament?: string; source?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const tournamentId = params.tournament?.trim() ?? "";
  const source =
    params.source === "online" || params.source === "walk_up"
      ? params.source
      : "all";
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  let loadFailed = false;
  let tournaments: Awaited<ReturnType<typeof getTournaments>> = [];
  let filtered: AdminRegistrationHistoryRow[] = [];

  try {
    const [allRegistrations, allTournaments] = await Promise.all([
      listAllRegistrationHistory(),
      getTournaments(),
    ]);
    tournaments = allTournaments;
    filtered = filterRegistrationHistory(allRegistrations, {
      search,
      tournamentId,
      source,
    });
  } catch (error) {
    console.error("All registrations load failed.", error);
    loadFailed = true;
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function pageHref(nextPage: number) {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (tournamentId) query.set("tournament", tournamentId);
    if (source !== "all") query.set("source", source);
    if (nextPage > 1) query.set("page", String(nextPage));
    return `/admin/registrations?${query.toString()}`;
  }

  return (
    <>
      <header>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
          Registration History
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase text-white sm:text-4xl">
          All Registrations
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
          Search registrations across every tournament. This historical lookup
          does not replace the tournament-specific Registration &amp; Check-In
          roster.
        </p>
      </header>

      <AdminPanel className="mt-6 p-4 sm:p-5" aria-label="Registration search and filters">
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_minmax(220px,0.7fr)_180px_auto] xl:items-end">
          <Field label="Search">
            <input
              name="q"
              type="search"
              defaultValue={search}
              placeholder="Team, angler, email, phone, or boat #"
              className="min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 text-sm text-white outline-none focus:border-[#D4A017]"
            />
          </Field>
          <Field label="Tournament">
            <select
              name="tournament"
              defaultValue={tournamentId}
              className="min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 text-sm text-white outline-none focus:border-[#D4A017]"
            >
              <option value="">All Tournaments</option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} — {dateOnly(tournament.tournament_date)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select
              name="source"
              defaultValue={source}
              className="min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 text-sm text-white outline-none focus:border-[#D4A017]"
            >
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="walk_up">Walk-Up</option>
            </select>
          </Field>
          <div className="flex gap-2">
            <button className={adminButtonStyles("primary", "min-h-11 flex-1 px-5")}>
              Apply
            </button>
            {search || tournamentId || source !== "all" ? (
              <Link
                href="/admin/registrations"
                className={adminButtonStyles("secondary", "min-h-11 px-4")}
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </AdminPanel>

      {loadFailed ? (
        <AdminPanel className="mt-6 border-red-500/30 p-8 text-center">
          <h2 className="font-black uppercase text-white">
            Registrations unavailable
          </h2>
          <p className="mt-2 text-sm text-neutral-400">Please try again.</p>
        </AdminPanel>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              {filtered.length} registration{filtered.length === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-neutral-500">
              Page {page} of {pageCount}
            </p>
          </div>

          <RegistrationHistoryList rows={rows} />

          {!rows.length ? (
            <AdminPanel className="mt-4 p-10 text-center">
              <h2 className="font-black uppercase text-white">
                No registrations found
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                Clear or adjust the search and filters.
              </p>
            </AdminPanel>
          ) : null}

          {filtered.length > pageSize ? (
            <nav className="mt-6 flex justify-end gap-3" aria-label="All registrations pagination">
              <Link
                href={pageHref(Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={`border border-white/15 px-4 py-2 text-xs font-black uppercase ${
                  page === 1
                    ? "pointer-events-none text-neutral-600"
                    : "text-white"
                }`}
              >
                Previous
              </Link>
              <Link
                href={pageHref(Math.min(pageCount, page + 1))}
                aria-disabled={page === pageCount}
                className={`border border-white/15 px-4 py-2 text-xs font-black uppercase ${
                  page === pageCount
                    ? "pointer-events-none text-neutral-600"
                    : "text-white"
                }`}
              >
                Next
              </Link>
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
      {label}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function dateOnly(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
