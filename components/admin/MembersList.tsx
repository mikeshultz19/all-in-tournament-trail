"use client";

import { Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  filterMemberRows,
  formatMemberDate,
} from "@/lib/member-list";
import type {
  AdminMemberListRow,
  MembershipStatus,
} from "@/types/aoy";

const statusStyles: Record<MembershipStatus, string> = {
  active:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-white/15 bg-white/[0.03] text-neutral-300",
  refunded: "border-red-500/30 bg-red-500/10 text-red-300",
};

const statusLabels: Record<MembershipStatus, string> = {
  active: "Active",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function MembersList({
  members,
}: {
  members: readonly AdminMemberListRow[];
}) {
  const [query, setQuery] = useState("");
  const filteredMembers = useMemo(
    () => filterMemberRows(members, query),
    [members, query],
  );

  if (members.length === 0) {
    return (
      <section className="mt-8 border border-white/10 bg-[#111111] px-6 py-14 text-center sm:px-10">
        <UserPlus
          aria-hidden="true"
          className="mx-auto size-8 text-[#D4A017]"
          strokeWidth={1.75}
        />
        <h2 className="mt-5 text-xl font-black uppercase text-white">
          No members have been added.
        </h2>
        <Link
          href="/admin/members/new"
          className="mt-6 inline-flex min-h-11 items-center justify-center bg-[#D4A017] px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition-colors hover:bg-[#e2b22a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
        >
          Add First Member
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-8" aria-labelledby="members-list-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-xl">
          <label
            htmlFor="member-search"
            className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400"
          >
            Search Members
          </label>
          <div className="relative mt-2">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
            />
            <input
              id="member-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, or phone"
              autoComplete="off"
              className="min-h-12 w-full border border-white/15 bg-[#111111] pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#D4A017]"
            />
          </div>
        </div>

        <p
          id="members-list-heading"
          className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500"
          aria-live="polite"
        >
          {filteredMembers.length}{" "}
          {filteredMembers.length === 1 ? "Member" : "Members"}
        </p>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="mt-5 border border-white/10 bg-[#111111] px-6 py-12 text-center">
          <h2 className="text-lg font-black uppercase text-white">
            No members match your search.
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            Check the spelling or search by email or phone.
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto border border-white/10 bg-[#111111]">
          <table className="min-w-[1180px] w-full border-collapse text-left">
            <thead className="border-b border-white/10 bg-black">
              <tr>
                {[
                  "Member",
                  "Membership Status",
                  "Season",
                  "First Eligible Tournament",
                  "Member Since",
                  "Last Updated",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-4 py-4 text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.membership_id}
                  className="border-b border-white/10 last:border-b-0 hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4">
                    <p className="font-black text-white">
                      {member.display_name}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {[member.email, member.phone]
                        .filter(Boolean)
                        .join(" · ") || "No contact information"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex border px-2.5 py-1 text-xs font-black uppercase tracking-[0.1em] ${statusStyles[member.membership_status]}`}
                    >
                      {statusLabels[member.membership_status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-neutral-300">
                    {member.season_name}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-neutral-200">
                    {member.first_eligible_tournament_name ??
                      "Not assigned"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-neutral-300">
                    {formatMemberDate(member.effective_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-neutral-300">
                    {formatMemberDate(member.updated_at)}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/members/${member.angler_id}?season=${encodeURIComponent(member.season_id)}`}
                      className="inline-flex min-h-10 items-center justify-center border border-white/15 px-4 text-xs font-black uppercase tracking-[0.12em] text-neutral-200 transition-colors hover:border-[#D4A017] hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
