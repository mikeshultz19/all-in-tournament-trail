"use client";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleAlert,
  MapPin,
  Navigation,
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
import type { Tournament, TournamentStatus } from "@/types/tournament";

interface CurrentTournamentCardProps {
  tournament: Tournament;
  tournaments: readonly Tournament[];
  comparisonDate: string;
  onChangeTournament: (tournament: Tournament) => void;
}

const statusStyles: Record<TournamentStatus, string> = {
  Scheduled: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  "Registration Open":
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "Registration Closed":
    "border-neutral-500/40 bg-neutral-500/10 text-neutral-300",
  Postponed: "border-[#D4A017]/50 bg-[#D4A017]/10 text-[#D4A017]",
  Cancelled: "border-red-500/40 bg-red-500/10 text-red-300",
  "Tournament Day": "border-sky-500/40 bg-sky-500/10 text-sky-300",
  "Results Published":
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

function TournamentStatusIcon({ status }: { status: TournamentStatus }) {
  if (status === "Postponed" || status === "Cancelled") {
    return <CircleAlert aria-hidden="true" className="size-3.5" />;
  }

  if (status === "Registration Open" || status === "Results Published") {
    return <CheckCircle2 aria-hidden="true" className="size-3.5" />;
  }

  return <Circle aria-hidden="true" className="size-3" />;
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
          <Check aria-hidden="true" className="mt-0.5 size-4 text-[#D4A017]" />
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
  const groups = groupAdminTournaments(tournaments, new Date(comparisonDate));
  const orderedTournaments = [...groups.upcoming, ...groups.past];

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
    queueMicrotask(() => optionRefs.current[selectedIndex]?.focus());
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openAndFocusSelected();
    }
  }

  function handleSelectorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
      className="border border-[#4A3A12] bg-[#111111] px-6 py-6 sm:px-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
            Current Tournament
          </p>
          <h1
            id="current-tournament-heading"
            className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl"
          >
            {tournament.name}
          </h1>

          <div className="mt-4 flex flex-col gap-2 text-sm text-neutral-400 sm:flex-row sm:flex-wrap sm:gap-x-5">
            <span className="inline-flex items-center gap-2">
              <CalendarDays
                aria-hidden="true"
                className="size-4 text-[#D4A017]"
              />
              <time dateTime={tournament.tournament_date}>
                {formatAdminTournamentDate(tournament.tournament_date, true)}
              </time>
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4 text-[#D4A017]" />
              {tournament.lake}
            </span>
            <span className="inline-flex items-center gap-2">
              <Navigation
                aria-hidden="true"
                className="size-4 text-[#D4A017]"
              />
              {tournament.ramp ?? "Ramp To Be Announced"}
            </span>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative flex shrink-0 flex-col items-start gap-4 lg:items-end"
        >
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${statusStyles[tournament.status]}`}
          >
            <TournamentStatusIcon status={tournament.status} />
            {tournament.status}
          </span>

          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={selectorId}
            onClick={() => setOpen((current) => !current)}
            onKeyDown={handleTriggerKeyDown}
            className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-neutral-200 transition-colors hover:border-[#D4A017]/70 hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
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
    </section>
  );
}
