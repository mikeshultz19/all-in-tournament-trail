"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import {
  formatAdminTournamentDate,
  groupAdminTournaments,
} from "@/lib/admin-tournaments";
import { getTournamentRegistrationStatus } from "@/lib/admin-tournament-operations";
import type { Tournament } from "@/types/tournament";

interface CurrentTournamentCardProps {
  tournament: Tournament;
  tournaments: readonly Tournament[];
  comparisonDate: string;
  onChangeTournament: (tournament: Tournament) => void;
}

function formatAuditDate(value: string | null | undefined) {
  if (!value) {
    return "No update recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No update recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function TournamentOption({
  tournament,
  selected,
  onSelect,
  buttonRef,
}: {
  tournament: Tournament;
  selected: boolean;
  onSelect: () => void;
  buttonRef: (element: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#D4A017]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-white">
          {tournament.name}
        </span>

        <span className="mt-1 block text-xs text-neutral-500">
          {formatAdminTournamentDate(tournament.tournament_date)} ·{" "}
          {tournament.status}
        </span>
      </span>

      {selected && (
        <>
          <Check
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#D4A017]"
          />
          <span className="sr-only">Selected</span>
        </>
      )}
    </button>
  );
}

export default function CurrentTournamentCard({
  tournament,
  tournaments,
  comparisonDate,
  onChangeTournament,
}: CurrentTournamentCardProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectorId = useId();

  const groups = groupAdminTournaments(
    tournaments,
    new Date(comparisonDate),
  );

  const orderedTournaments = [...groups.upcoming, ...groups.past];
  const registrationStatus = getTournamentRegistrationStatus(
    tournament,
    new Date(comparisonDate),
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function openAndFocusSelected() {
    setOpen(true);

    const selectedIndex = orderedTournaments.findIndex(
      (item) => item.id === tournament.id,
    );

    queueMicrotask(() => {
      optionRefs.current[selectedIndex]?.focus();
    });
  }

  function handleTriggerKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
  ) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openAndFocusSelected();
    }
  }

  function handleSelectorKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    const currentIndex = optionRefs.current.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    let nextIndex: number | undefined;

    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % orderedTournaments.length;
    } else if (event.key === "ArrowUp") {
      nextIndex =
        (currentIndex - 1 + orderedTournaments.length) %
        orderedTournaments.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = orderedTournaments.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      optionRefs.current[nextIndex]?.focus();
    }
  }

  function selectTournament(selectedTournament: Tournament) {
    onChangeTournament(selectedTournament);
    setOpen(false);
    triggerRef.current?.focus();
  }

  let optionIndex = 0;

  return (
    <section
      aria-labelledby="current-tournament-heading"
      className="border border-[#4A3A12] bg-[#111111]"
    >
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
            Tournament Operations
          </p>

          <h1
            id="current-tournament-heading"
            className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl"
          >
            {tournament.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
            <CalendarDays
              aria-hidden="true"
              className="size-4 shrink-0 text-[#D4A017]"
            />

            <time dateTime={tournament.tournament_date}>
              {formatAdminTournamentDate(
                tournament.tournament_date,
                true,
              )}
            </time>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="border border-white/10 bg-black px-4 py-3">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-600">
                Registration Status
              </p>
              <p className="mt-1 text-sm font-black uppercase text-[#D4A017]">
                {registrationStatus}
              </p>
            </div>
            <div className="border border-white/10 bg-black px-4 py-3">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-600">
                Result Status
              </p>
              <p className="mt-1 text-sm font-black uppercase text-[#D4A017]">
                {tournament.result_status.replaceAll("_", " ")}
              </p>
            </div>
            <div className="border border-white/10 bg-black px-4 py-3">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-600">
                Overall Tournament Status
              </p>
              <p className="mt-1 text-sm font-black uppercase text-white">
                {tournament.status}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-neutral-600">
                Last Updated
              </p>

              <p className="mt-1 font-semibold text-neutral-300">
                {formatAuditDate(tournament.updated_at)}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-neutral-600">
                Updated By
              </p>

              <p className="mt-1 font-semibold text-neutral-300">
                {tournament.updated_by ?? "AITT Staff"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-64">
          <div ref={containerRef} className="relative">
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={selectorId}
              onClick={() => setOpen((current) => !current)}
              onKeyDown={handleTriggerKeyDown}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-neutral-200 transition-colors hover:border-[#D4A017]/70 hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
            >
              Change Tournament

              <ChevronDown
                aria-hidden="true"
                className={`size-4 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              id={selectorId}
              role="listbox"
              aria-label="Choose current tournament"
              hidden={!open}
              onKeyDown={handleSelectorKeyDown}
              className="absolute right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(24rem,70vh)] w-[min(22rem,calc(100vw-2.5rem))] overflow-y-auto border border-white/10 bg-[#111111] p-1.5 shadow-2xl shadow-black/60"
            >
              {groups.upcoming.length > 0 && (
                <div role="group" aria-label="Upcoming Tournaments">
                  <p className="px-3 pb-1 pt-2 text-[0.65rem] font-black uppercase tracking-[0.16em] text-neutral-500">
                    Upcoming Tournaments
                  </p>

                  {groups.upcoming.map((item) => {
                    const currentIndex = optionIndex++;

                    return (
                      <TournamentOption
                        key={item.id}
                        tournament={item}
                        selected={item.id === tournament.id}
                        onSelect={() => selectTournament(item)}
                        buttonRef={(element) => {
                          optionRefs.current[currentIndex] = element;
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {groups.past.length > 0 && (
                <div
                  role="group"
                  aria-label="Past Tournaments"
                  className="mt-1 border-t border-white/10 pt-1"
                >
                  <p className="px-3 pb-1 pt-2 text-[0.65rem] font-black uppercase tracking-[0.16em] text-neutral-500">
                    Past Tournaments
                  </p>

                  {groups.past.map((item) => {
                    const currentIndex = optionIndex++;

                    return (
                      <TournamentOption
                        key={item.id}
                        tournament={item}
                        selected={item.id === tournament.id}
                        onSelect={() => selectTournament(item)}
                        buttonRef={(element) => {
                          optionRefs.current[currentIndex] = element;
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
