import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

import MembersList from "@/components/admin/MembersList";
import { listMembersForSeason } from "@/lib/memberships";
import { getActiveSeason } from "@/lib/seasons";
import { getTournamentById, getTournamentByIdentifier } from "@/lib/tournaments";
import type { AdminMemberListRow, Season } from "@/types/aoy";
import type { Tournament } from "@/types/tournament";

export const dynamic = "force-dynamic";

export default async function MembersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    q?: string;
    status?: string;
    page?: string;
    tournament?: string;
    returnTo?: string;
  }>;
}) {
  const params = await searchParams;
  const saved = params.saved === "1";
  const deleted = params.deleted === "1";
  const search = params.q?.trim() ?? "";
  const status =
    params.status === "active" || params.status === "inactive"
      ? params.status
      : "all";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const requestedTournament = params.tournament?.trim() ?? "";
  const returnTo = params.returnTo?.trim() ?? "";
  const pageSize = requestedTournament ? 10000 : 25;
  let activeSeason: Season | null = null;
  let selectedTournament: Tournament | null = null;
  let members: AdminMemberListRow[] = [];
  let total = 0;
  let loadFailed = false;

  try {
    activeSeason = await getActiveSeason();
    selectedTournament = requestedTournament
      ? await getTournamentByIdentifier(requestedTournament)
      : null;
    if (activeSeason) {
      const result = await listMembersForSeason(activeSeason.id, {
        search,
        active: status === "all" ? null : status === "active",
        page,
        pageSize,
      });
      const filteredMembers = selectedTournament
        ? await filterMembersForTournament(result.members, selectedTournament)
        : result.members;
      members = filteredMembers;
      total = selectedTournament ? filteredMembers.length : result.total;
    }
  } catch (error) {
    console.error("Admin members load failed.", error);
    loadFailed = true;
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {returnTo ? (
          <Link
            href={returnTo}
            className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to Insurance Pot
          </Link>
        ) : null}
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Admin Center
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
            Membership Management
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Members
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            Manage AITT members and view their eligibility for the current
            season.
          </p>
          {selectedTournament ? (
            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]">
              Filtered for {selectedTournament.name}
            </p>
          ) : null}
        </div>

        <Link
          href="/admin/members/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#D4A017] px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition-colors hover:bg-[#e2b22a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add Member
        </Link>
      </div>

      {saved && (
        <p
          className="mt-6 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300"
          role="status"
        >
          Member added successfully.
        </p>
      )}
      {deleted && (
        <p className="mt-6 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300" role="status">
          Member deleted successfully.
        </p>
      )}

      {loadFailed ? (
        <section className="mt-8 border border-red-500/30 bg-red-500/10 px-6 py-10 text-center">
          <h2 className="text-lg font-black uppercase text-white">
            Members Unavailable
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-300">
            We could not load membership records. Please try again.
          </p>
        </section>
      ) : (
        <>
          {activeSeason ? (
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
              Current Season:{" "}
              <span className="text-neutral-300">{activeSeason.name}</span>
            </p>
          ) : null}
          <MembersList
            members={members}
            total={total}
            page={page}
            pageSize={pageSize}
            initialSearch={search}
            statusFilter={status}
          />
        </>
      )}
    </>
  );
}

async function filterMembersForTournament(
  members: AdminMemberListRow[],
  tournament: Tournament,
): Promise<AdminMemberListRow[]> {
  const filtered = await Promise.all(
    members.map(async (member) => {
      if (!member.is_active || member.membership_status !== "active") {
        return false;
      }

      if (!member.first_eligible_tournament_id) {
        return true;
      }

      const firstEligibleTournament = await getTournamentById(
        member.first_eligible_tournament_id,
      );

      if (!firstEligibleTournament || firstEligibleTournament.season_id !== tournament.season_id) {
        return false;
      }

      if (tournament.event_type === "championship") {
        return true;
      }

      if (
        tournament.regular_season_number === null ||
        firstEligibleTournament.regular_season_number === null
      ) {
        return false;
      }

      return (
        firstEligibleTournament.regular_season_number <=
        tournament.regular_season_number
      );
    }),
  );

  return members.filter((_, index) => filtered[index]);
}
