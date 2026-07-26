"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import { resetResultsAction, saveResultsAction } from "@/app/admin/results/actions";
import WeighfishCsvUploader from "@/components/admin/WeighfishCsvUploader";
import {
  RESULT_TEAM_MAX_LENGTH,
  type ResultsFormState,
} from "@/lib/results-form";
import type { ResultEntry } from "@/types/results";
import type { Tournament } from "@/types/tournament";

interface EditorEntry {
  key: number;
  team: string;
  weight: string;
}

interface ResetResultsState {
  status: "idle" | "success" | "error";
  message: string;
}

const initialState: ResultsFormState = {
  status: "idle",
  message: "",
  errors: {},
};

const initialResetState: ResetResultsState = {
  status: "idle",
  message: "",
};

const inputClassName =
  "mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#D4A017] focus-visible:ring-2 focus-visible:ring-[#D4A017]/40";
const labelClassName =
  "text-xs font-black uppercase tracking-[0.12em] text-neutral-300";

function timestampToInputValue(timestamp: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function createEntryRow(
  key: number,
  team = "",
  weight = "",
): EditorEntry {
  return { key, team, weight };
}

function resultRowsFromEntries(entries: EditorEntry[]): ResultEntry[] {
  return entries.map((entry, index) => ({
    place: index + 1,
    team: entry.team,
    weight: Number(entry.weight),
  }));
}

export default function TournamentResultsForm({
  tournament,
  initialEntries,
  initialTotalPayout,
  initialBronzePayout,
  initialSilverPayout,
  initialGoldPayout,
  initialInsurancePotPayout,
  initialBigBassPayout,
  initialBigBassAngler,
  initialBigBassTeam,
  initialBigBassWeight,
  initialChampionImageUrl,
  initialBigBassImageUrl,
}: {
  tournament: Tournament;
  initialEntries: readonly ResultEntry[];
  initialTotalPayout: number;
  initialBronzePayout: number;
  initialSilverPayout: number;
  initialGoldPayout: number;
  initialInsurancePotPayout: number;
  initialBigBassPayout: number;
  initialBigBassAngler: string | null;
  initialBigBassTeam: string | null;
  initialBigBassWeight: number | null;
  initialChampionImageUrl: string | null;
  initialBigBassImageUrl: string | null;
}) {
  const action = saveResultsAction.bind(null, tournament.id);
  const resetAction = resetResultsAction.bind(null, tournament.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [resetState, resetFormAction, resetPending] = useActionState(
    resetAction,
    initialResetState,
  );
  const [entries, setEntries] = useState<EditorEntry[]>(
    initialEntries.length > 0
      ? initialEntries.map((entry, index) =>
          createEntryRow(index, entry.team, String(entry.weight)),
        )
      : [createEntryRow(0)],
  );
  const [totalPayout, setTotalPayout] = useState(
    initialTotalPayout.toFixed(2),
  );
  const [bronzePayout, setBronzePayout] = useState(
    initialBronzePayout.toFixed(2),
  );
  const [silverPayout, setSilverPayout] = useState(
    initialSilverPayout.toFixed(2),
  );
  const [goldPayout, setGoldPayout] = useState(initialGoldPayout.toFixed(2));
  const [insurancePotPayout, setInsurancePotPayout] = useState(
    initialInsurancePotPayout.toFixed(2),
  );
  const [bigBassPayout, setBigBassPayout] = useState(
    initialBigBassPayout.toFixed(2),
  );
  const bigBassAngler = initialBigBassAngler ?? "";
  const bigBassTeam = initialBigBassTeam ?? "";
  const [bigBassWeight, setBigBassWeight] = useState(
    initialBigBassWeight === null ? "" : initialBigBassWeight.toFixed(2),
  );
  const championImageUrl =
    initialChampionImageUrl ?? "/images/results/overall-winner.jpg";
  const bigBassImageUrl =
    initialBigBassImageUrl ?? "/images/results/big-bass.jpg";
  const nextKey = useRef(entries.length);
  const resetDialogRef = useRef<HTMLDialogElement>(null);

  const weighfishPayout = Number(totalPayout);
  const bronze = Number(bronzePayout);
  const silver = Number(silverPayout);
  const gold = Number(goldPayout);
  const insurancePayout = Number(insurancePotPayout);
  const bigBass = Number(bigBassPayout);
  const totalPaidOut =
    (Number.isFinite(weighfishPayout) ? weighfishPayout : 0) +
    (Number.isFinite(bronze) ? bronze : 0) +
    (Number.isFinite(silver) ? silver : 0) +
    (Number.isFinite(gold) ? gold : 0) +
    (Number.isFinite(insurancePayout) ? insurancePayout : 0) +
    (Number.isFinite(bigBass) ? bigBass : 0);

  function addEntry() {
    setEntries((current) => [
      ...current,
      createEntryRow(nextKey.current++, "", ""),
    ]);
  }

  function replaceEntries(rows: Array<{ team: string; weight: string }>) {
    const nextEntries =
      rows.length > 0
        ? rows.map((row, index) =>
            createEntryRow(index, row.team.trim(), row.weight.trim()),
          )
        : [createEntryRow(0)];

    nextKey.current = nextEntries.length;
    setEntries(nextEntries);
  }

  function updateEntry(
    key: number,
    field: "team" | "weight",
    value: string,
  ) {
    setEntries((current) =>
      current.map((entry) =>
        entry.key === key ? { ...entry, [field]: value } : entry,
      ),
    );
  }

  function openResetDialog() {
    resetDialogRef.current?.showModal();
  }

  function closeResetDialog() {
    resetDialogRef.current?.close();
  }

  return (
    <>
      <form action={formAction} className="mt-6 space-y-6">
        <input
          type="hidden"
          name="entries"
          value={JSON.stringify(
            resultRowsFromEntries(entries).map(({ team, weight }) => ({
              team,
              weight,
            })),
          )}
        />

        <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
          <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
            Tournament
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={`${labelClassName} sm:col-span-2`}>
              Tournament Name
              <input
                name="name"
                required
                defaultValue={tournament.name}
                className={inputClassName}
              />
              {state.errors.name && (
                <span className="mt-2 block text-sm text-red-400" role="alert">
                  {state.errors.name}
                </span>
              )}
            </label>
            <label className={labelClassName}>
              Tournament Date
              <input
                name="tournamentDate"
                type="datetime-local"
                required
                defaultValue={timestampToInputValue(tournament.tournament_date)}
                className={inputClassName}
              />
              {state.errors.tournamentDate && (
                <span className="mt-2 block text-sm text-red-400" role="alert">
                  {state.errors.tournamentDate}
                </span>
              )}
            </label>
            <label className={labelClassName}>
              Lake or Location
              <input
                name="lake"
                required
                defaultValue={tournament.lake}
                className={inputClassName}
              />
              {state.errors.lake && (
                <span className="mt-2 block text-sm text-red-400" role="alert">
                  {state.errors.lake}
                </span>
              )}
            </label>
          </div>
        </fieldset>

        <WeighfishCsvUploader
          onImport={(rows) => replaceEntries(rows)}
        />

        <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
          <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
            Tournament Payouts
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <section className="border border-white/10 bg-[#0B0B0B] p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                Weighfish Payouts
              </h2>
              <label className={`${labelClassName} mt-4 block`}>
                Standard Tournament Payout Paid Out
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-neutral-400">
                    $
                  </span>
                  <input
                    name="totalPayout"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={totalPayout}
                    onChange={(event) => setTotalPayout(event.target.value)}
                    className={`${inputClassName} pl-7`}
                  />
                </div>
              </label>
              {state.errors.totalPayout && (
                <span className="mt-2 block text-sm text-red-400" role="alert">
                  {state.errors.totalPayout}
                </span>
              )}
              {[
                {
                  name: "bronzePayout",
                  label: "Bronze Side Pot Paid Out",
                  value: bronzePayout,
                  setValue: setBronzePayout,
                  error: state.errors.bronzePayout,
                },
                {
                  name: "silverPayout",
                  label: "Silver Side Pot Paid Out",
                  value: silverPayout,
                  setValue: setSilverPayout,
                  error: state.errors.silverPayout,
                },
                {
                  name: "goldPayout",
                  label: "Gold Side Pot Paid Out",
                  value: goldPayout,
                  setValue: setGoldPayout,
                  error: state.errors.goldPayout,
                },
              ].map((field) => (
                <label
                  key={field.name}
                  className={`${labelClassName} mt-4 block`}
                >
                  {field.label}
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-neutral-400">
                      $
                    </span>
                    <input
                      name={field.name}
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={field.value}
                      onChange={(event) => field.setValue(event.target.value)}
                      className={`${inputClassName} pl-7`}
                    />
                  </div>
                  {field.error && (
                    <span
                      className="mt-2 block text-sm text-red-400"
                      role="alert"
                    >
                      {field.error}
                    </span>
                  )}
                </label>
              ))}
              <p className="mt-3 text-xs leading-5 text-neutral-400">
                Weighfish Side Pot 1 is Bronze, Side Pot 2 is Silver, and Side
                Pot 3 is Gold.
              </p>
            </section>

            <section className="border border-white/10 bg-[#0B0B0B] p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                Manual Insurance Pot
              </h2>
              <label className={`${labelClassName} mt-4 block`}>
                Insurance Pot Paid Out
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-neutral-400">
                    $
                  </span>
                  <input
                    name="insurancePotPayout"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={insurancePotPayout}
                    onChange={(event) =>
                      setInsurancePotPayout(event.target.value)
                    }
                    className={`${inputClassName} pl-7`}
                  />
                </div>
              </label>
              {state.errors.insurancePotPayout && (
                <span className="mt-2 block text-sm text-red-400" role="alert">
                  {state.errors.insurancePotPayout}
                </span>
              )}
              <p className="mt-2 text-xs leading-5 text-neutral-400">
                Enter the final cash payout managed outside Weighfish.
              </p>
            </section>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <section className="border border-white/10 bg-[#0B0B0B] p-4 sm:col-span-2">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                Winner Photos and Big Bass
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <label className={labelClassName}>
                  Champion Photo URL
                  <input
                    name="championImageUrl"
                    type="text"
                    inputMode="url"
                    defaultValue={championImageUrl}
                    className={inputClassName}
                  />
                </label>
                <label className={labelClassName}>
                  Big Bass Photo URL
                  <input
                    name="bigBassImageUrl"
                    type="text"
                    inputMode="url"
                    defaultValue={bigBassImageUrl}
                    className={inputClassName}
                  />
                </label>
                <label className={labelClassName}>
                  Big Bass Angler
                  <input
                    name="bigBassAngler"
                    required
                    defaultValue={bigBassAngler}
                    className={inputClassName}
                  />
                  {state.errors.bigBassAngler && (
                    <span
                      className="mt-2 block text-sm text-red-400"
                      role="alert"
                    >
                      {state.errors.bigBassAngler}
                    </span>
                  )}
                </label>
                <label className={labelClassName}>
                  Big Bass Team
                  <input
                    name="bigBassTeam"
                    required
                    defaultValue={bigBassTeam}
                    className={inputClassName}
                  />
                  {state.errors.bigBassTeam && (
                    <span
                      className="mt-2 block text-sm text-red-400"
                      role="alert"
                    >
                      {state.errors.bigBassTeam}
                    </span>
                  )}
                </label>
                <label className={labelClassName}>
                  Big Bass Weight
                  <input
                    name="bigBassWeight"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={bigBassWeight}
                    onChange={(event) => setBigBassWeight(event.target.value)}
                    className={inputClassName}
                  />
                  {state.errors.bigBassWeight && (
                    <span
                      className="mt-2 block text-sm text-red-400"
                      role="alert"
                    >
                      {state.errors.bigBassWeight}
                    </span>
                  )}
                </label>
                <label className={labelClassName}>
                  Big Bass Payout
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-neutral-400">
                      $
                    </span>
                    <input
                      name="bigBassPayout"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={bigBassPayout}
                      onChange={(event) => setBigBassPayout(event.target.value)}
                      className={`${inputClassName} pl-7`}
                    />
                  </div>
                  {state.errors.bigBassPayout && (
                    <span
                      className="mt-2 block text-sm text-red-400"
                      role="alert"
                    >
                      {state.errors.bigBassPayout}
                    </span>
                  )}
                </label>
              </div>
            </section>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-l-4 border-red-600 bg-red-950/30 px-4 py-3">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
              Total Paid Out to Anglers
            </span>
            <output className="text-2xl font-black tabular-nums text-white">
              {formatCurrency(totalPaidOut)}
            </output>
          </div>
        </fieldset>

        <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
          <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
            Results Entries
          </legend>
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div
                key={entry.key}
                className="grid items-end gap-3 border border-white/10 bg-[#0B0B0B] p-3 sm:grid-cols-[3rem_1fr_10rem_auto]"
              >
                <span className="pb-3 text-center text-sm font-black text-[#D4A017]">
                  {index + 1}
                </span>
                <label className={labelClassName}>
                  Team
                  <input
                    required
                    maxLength={RESULT_TEAM_MAX_LENGTH}
                    value={entry.team}
                    onChange={(event) =>
                      updateEntry(entry.key, "team", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>
                <label className={labelClassName}>
                  Weight (lbs)
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={entry.weight}
                    onChange={(event) =>
                      updateEntry(entry.key, "weight", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>
                <button
                  type="button"
                  disabled={entries.length === 1}
                  onClick={() =>
                    setEntries((current) =>
                      current.filter((item) => item.key !== entry.key),
                    )
                  }
                  aria-label={`Remove result ${index + 1}`}
                  className="inline-flex min-h-11 items-center justify-center border border-red-500/30 px-3 text-red-400 disabled:opacity-30"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </div>
            ))}
          </div>
          {state.errors.entries && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {state.errors.entries}
            </p>
          )}
          <button
            type="button"
            onClick={addEntry}
            className="mt-4 inline-flex min-h-11 items-center gap-2 border border-[#D4A017] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add Result
          </button>
        </fieldset>

        {state.message && (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`border px-4 py-3 text-sm font-semibold ${
              state.status === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center bg-red-700 px-7 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>

      <section className="mt-6 border border-white/10 bg-[#111111] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c9aa4a]">
              Tournament Maintenance
            </p>
            <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">
              Reset Tournament Results
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              Clear standings, winners, payouts, side-pot results, Insurance
              Pot results, Big Bass results, and tournament-derived AOY points
              for the selected tournament.
            </p>
          </div>
          <button
            type="button"
            onClick={openResetDialog}
            className="inline-flex min-h-11 items-center gap-2 border border-red-500/40 bg-red-950/30 px-5 text-xs font-black uppercase tracking-[0.12em] text-red-300 transition hover:bg-red-950/50"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset Tournament Results
          </button>
        </div>

        {resetState.message && (
          <p
            role={resetState.status === "error" ? "alert" : "status"}
            className={`mt-4 border px-4 py-3 text-sm font-semibold ${
              resetState.status === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {resetState.message}
          </p>
        )}
      </section>

      <dialog
        ref={resetDialogRef}
        className="w-[min(100vw-32px,560px)] border border-white/10 bg-[#111111] p-0 text-white backdrop:bg-black/80"
      >
        <form action={resetFormAction} className="p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
            Reset Tournament Results?
          </p>
          <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
            Confirm results reset
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            This will remove standings, winners, payouts, side-pot results,
            Insurance Pot results, Big Bass results, and tournament-derived AOY
            points for this tournament. Tournament information and
            registrations will not be affected.
          </p>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeResetDialog}
              className="inline-flex min-h-11 items-center justify-center border border-white/15 px-5 text-xs font-black uppercase tracking-[0.12em] text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetPending}
              className="inline-flex min-h-11 items-center gap-2 bg-red-700 px-5 text-xs font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {resetPending ? "Resetting..." : "Reset Results"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
