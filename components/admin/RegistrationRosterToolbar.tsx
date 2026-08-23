"use client";

import { useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { adminButtonStyles } from "@/components/admin/admin-button-styles";

type RosterFilter = "all" | "needs_review" | "walk_ups";

export default function RegistrationRosterToolbar({ tournamentId, filter, search }: { tournamentId: string; filter: RosterFilter; search: string }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState(search);
  const [refreshing, startRefresh] = useTransition();

  function href(nextFilter = filter, nextSearch = searchText) {
    const params = new URLSearchParams({ tournament: tournamentId });
    if (nextFilter !== "all") params.set("filter", nextFilter);
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    return `/admin/registration-review?${params.toString()}`;
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.replace(href(filter, searchText), { scroll: false });
  }

  function clearSearch() {
    setSearchText("");
    router.replace(href(filter, ""), { scroll: false });
  }

  function selectFilter(nextFilter: RosterFilter) {
    router.replace(href(nextFilter, searchText), { scroll: false });
  }

  function refreshRoster() {
    startRefresh(() => router.refresh());
  }

  return <div className="border-b border-white/10 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.08em] text-white">Registration Entries</h2>
        <p className="mt-1 text-xs text-neutral-500">Search and refresh this tournament roster without reloading the page.</p>
      </div>
      <button type="button" onClick={refreshRoster} disabled={refreshing} className={adminButtonStyles("secondary", "min-h-9 px-3")} aria-label="Refresh registration entries">
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>
    </div>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap gap-2" aria-label="Registration filters">
        <FilterButton active={filter === "all"} onClick={() => selectFilter("all")}>All Registrations</FilterButton>
        <FilterButton active={filter === "needs_review"} onClick={() => selectFilter("needs_review")}>Needs Review</FilterButton>
        <FilterButton active={filter === "walk_ups"} onClick={() => selectFilter("walk_ups")}>Walk-Ups</FilterButton>
      </div>
      <form onSubmit={applySearch} role="search" className="flex min-w-0 flex-1 gap-2 sm:ml-auto sm:max-w-md">
        <label htmlFor="registration-search" className="sr-only">Search name or boat number</label>
        <div className="relative min-w-0 flex-1">
          <input id="registration-search" name="search" type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search name or boat #" className="min-h-9 w-full border border-white/15 bg-[#111] px-3 pr-10 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#D4A017]" />
          {searchText ? <button type="button" onClick={clearSearch} aria-label="Clear search" title="Clear search" className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-lg text-neutral-400 hover:text-white">×</button> : null}
        </div>
        <button className={adminButtonStyles("secondary", "min-h-9 px-3")}>Search</button>
      </form>
    </div>
  </div>;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={adminButtonStyles(active ? "primary" : "secondary", "min-h-9 px-3")}>{children}</button>;
}
