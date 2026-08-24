"use client";

import { useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { adminButtonStyles } from "@/components/admin/admin-button-styles";

type RosterFilter = "all" | "needs_review" | "walk_ups" | "check_ins";

export default function RegistrationRosterToolbar({
  tournamentId,
  filter,
  search,
  page,
  pageSize,
  totalRows,
  totalPages,
  rangeStart,
  rangeEnd,
}: {
  tournamentId: string;
  filter: RosterFilter;
  search: string;
  page: number;
  pageSize: 25 | 50 | 100;
  totalRows: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
}) {
  const router = useRouter();
  const [searchText, setSearchText] = useState(search);
  const [refreshing, startRefresh] = useTransition();

  function href({
    nextFilter = filter,
    nextSearch = searchText,
    nextPage = 1,
    nextPageSize = pageSize,
  }: {
    nextFilter?: RosterFilter;
    nextSearch?: string;
    nextPage?: number;
    nextPageSize?: 25 | 50 | 100;
  } = {}) {
    const params = new URLSearchParams({ tournament: tournamentId });
    if (nextFilter !== "all") params.set("filter", nextFilter);
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextPageSize !== 25) params.set("pageSize", String(nextPageSize));
    return `/admin/registration-review?${params.toString()}`;
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.replace(href({ nextSearch: searchText, nextPage: 1 }), {
      scroll: false,
    });
  }

  function clearSearch() {
    setSearchText("");
    router.replace(href({ nextSearch: "", nextPage: 1 }), { scroll: false });
  }

  function selectFilter(nextFilter: RosterFilter) {
    router.replace(href({ nextFilter, nextPage: 1 }), { scroll: false });
  }

  function selectPageSize(nextPageSize: 25 | 50 | 100) {
    router.replace(href({ nextPageSize, nextPage: 1 }), { scroll: false });
  }

  function goToPage(nextPage: number) {
    router.replace(href({ nextPage }), { scroll: false });
  }

  function refreshRoster() {
    startRefresh(() => router.refresh());
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="border-b border-white/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.08em] text-white">
            Registration Entries
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Search and refresh this tournament roster without reloading the page.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshRoster}
          disabled={refreshing}
          className={adminButtonStyles("secondary", "min-h-9 px-3")}
          aria-label="Refresh registration entries"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" aria-label="Registration filters">
            <FilterButton active={filter === "all"} onClick={() => selectFilter("all")}>
              All Registrations
            </FilterButton>
            <FilterButton
              active={filter === "needs_review"}
              onClick={() => selectFilter("needs_review")}
            >
              Needs Review
            </FilterButton>
            <FilterButton
              active={filter === "walk_ups"}
              onClick={() => selectFilter("walk_ups")}
            >
              Walk-Ups
            </FilterButton>
            <FilterButton
              active={filter === "check_ins"}
              onClick={() => selectFilter("check_ins")}
            >
              Check-Ins
            </FilterButton>
          </div>

          <label className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400">
            Page size
            <select
              value={pageSize}
              onChange={(event) => selectPageSize(Number(event.target.value) as 25 | 50 | 100)}
              className="min-h-9 border border-white/15 bg-[#111] px-3 text-sm text-white outline-none focus:border-[#D4A017]"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form
            onSubmit={applySearch}
            role="search"
            className="flex min-w-0 flex-1 gap-2 sm:max-w-md"
          >
            <label htmlFor="registration-search" className="sr-only">
              Search name or boat number
            </label>
            <div className="relative min-w-0 flex-1">
              <input
                id="registration-search"
                name="search"
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search name or boat #"
                className="min-h-9 w-full border border-white/15 bg-[#111] px-3 pr-10 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#D4A017]"
              />
              {searchText ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  title="Clear search"
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-lg text-neutral-400 hover:text-white"
                >
                  ×
                </button>
              ) : null}
            </div>
            <button className={adminButtonStyles("secondary", "min-h-9 px-3")}>
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-neutral-300">
            <span className="rounded border border-white/10 bg-black/40 px-3 py-2">
              {totalRows ? `${rangeStart}–${rangeEnd} of ${totalRows}` : "0–0 of 0"}
            </span>
            <PaginationButton
              label="Previous"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            />
            <div className="flex flex-wrap gap-1" aria-label="Registration pages">
              {pageNumbers.map((pageNumber) => (
                <PaginationButton
                  key={pageNumber}
                  label={String(pageNumber)}
                  active={pageNumber === page}
                  onClick={() => goToPage(pageNumber)}
                />
              ))}
            </div>
            <PaginationButton
              label="Next"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={adminButtonStyles(active ? "primary" : "secondary", "min-h-9 px-3")}
    >
      {children}
    </button>
  );
}

function PaginationButton({
  label,
  onClick,
  disabled = false,
  active = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      className={adminButtonStyles(active ? "primary" : "secondary", "min-h-9 px-3")}
    >
      {label}
    </button>
  );
}
