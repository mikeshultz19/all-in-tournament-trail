import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

import MembersList from "@/components/admin/MembersList";
import { listMembersForSeason } from "@/lib/memberships";
import { getActiveSeason } from "@/lib/seasons";
import type { AdminMemberListRow, Season } from "@/types/aoy";

export const dynamic = "force-dynamic";

export default async function MembersAdminPage() {
  let activeSeason: Season | null = null;
  let members: AdminMemberListRow[] = [];
  let loadFailed = false;

  try {
    activeSeason = await getActiveSeason();
    members = activeSeason
      ? await listMembersForSeason(activeSeason.id)
      : [];
  } catch (error) {
    console.error("Admin members load failed.", error);
    loadFailed = true;
  }

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Admin Center
      </Link>

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
        </div>

        <Link
          href="/admin/members/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#D4A017] px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition-colors hover:bg-[#e2b22a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add Member
        </Link>
      </div>

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
          <MembersList members={members} />
        </>
      )}
    </>
  );
}
