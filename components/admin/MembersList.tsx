"use client";

import { Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { formatMemberDate } from "@/lib/member-list";
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
  total = members.length,
  page = 1,
  pageSize = 25,
  initialSearch = "",
  statusFilter = "all",
}: {
  members: readonly AdminMemberListRow[];
  total?: number;
  page?: number;
  pageSize?: number;
  initialSearch?: string;
  statusFilter?: "all" | "active" | "inactive";
}) {
  const [query, setQuery] = useState(initialSearch);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (query === initialSearch) return;
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [initialSearch, pathname, query, router, searchParams]);

  function hrefFor(nextPage: number, nextStatus = statusFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    if (nextStatus !== "all") params.set("status", nextStatus);
    else params.delete("status");
    return `${pathname}?${params.toString()}`;
  }

  const exportParams = new URLSearchParams();
  if (initialSearch) exportParams.set("q", initialSearch);
  if (statusFilter !== "all") exportParams.set("status", statusFilter);
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  if (members.length === 0 && !initialSearch && statusFilter === "all") {
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
          Showing {first}–{last} of {total} members
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((value) => (
            <Link key={value} href={hrefFor(1, value)} className={`border px-3 py-2 text-xs font-black uppercase ${statusFilter === value ? "border-[#D4A017] text-[#D4A017]" : "border-white/15 text-neutral-400"}`}>
              {value}
            </Link>
          ))}
        </div>
        <a href={`/admin/members/export?${exportParams.toString()}`} className="inline-flex min-h-10 items-center border border-[#D4A017] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">
          Export CSV
        </a>
      </div>

      {members.length === 0 ? (
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
              {members.map((member) => (
                <tr
                  key={member.membership_id}
                  className="border-b border-white/10 last:border-b-0 hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/members/${member.angler_id}`}
                      className="font-black text-white transition-colors hover:text-[#D4A017]"
                    >
                      {member.display_name}
                    </Link>
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
                      {member.is_active
                        ? statusLabels[member.membership_status]
                        : `Inactive · ${statusLabels[member.membership_status]}`}
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
                      href={`/admin/members/${member.angler_id}`}
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
      {total > 0 && (
        <nav className="mt-5 flex items-center justify-end gap-3" aria-label="Members pagination">
          <Link href={hrefFor(Math.max(1, page - 1))} aria-disabled={page <= 1} className={`border border-white/15 px-4 py-2 text-xs font-black uppercase ${page <= 1 ? "pointer-events-none text-neutral-600" : "text-neutral-200"}`}>Previous</Link>
          <span className="text-sm text-neutral-400">Page {page} of {pageCount}</span>
          <Link href={hrefFor(Math.min(pageCount, page + 1))} aria-disabled={page >= pageCount} className={`border border-white/15 px-4 py-2 text-xs font-black uppercase ${page >= pageCount ? "pointer-events-none text-neutral-600" : "text-neutral-200"}`}>Next</Link>
        </nav>
      )}
    </section>
  );
}
