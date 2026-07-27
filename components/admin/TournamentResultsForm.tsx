"use client";

import { RotateCcw } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import {
  resetResultsAction,
  saveResultsAction,
} from "@/app/admin/results/actions";
import WeighfishCsvUploader from "@/components/admin/WeighfishCsvUploader";
import type {
  WeighfishParseResult,
  WeighfishResultRow,
} from "@/lib/weighfishParser";
import type { ResultsFormState } from "@/lib/results-form";
import type { ResultEntry } from "@/types/results";
import type { Tournament } from "@/types/tournament";

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

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function initialPreviewRows(
  entries: readonly ResultEntry[],
): WeighfishResultRow[] {
  return entries.map((entry) => ({
    place: entry.place,
    entryName: entry.team,
    fishCount: 0,
    totalWeight: entry.weight,
    bigFishWeight: 0,
    basePayout: 0,
    bronzePayout: 0,
    silverPayout: 0,
    goldPayout: 0,
    bigBassPlace: null,
    bigBassPayout: 0,
    cashPayout: 0,
    payoutBreakdown: "",
    prizeDescription: "",
  }));
}

function findPrimaryBigBassRow(
  rows: readonly WeighfishResultRow[],
): WeighfishResultRow | null {
  const explicitWinner = rows.find((row) => row.bigBassPlace === 1);

  if (explicitWinner) return explicitWinner;

  const eligibleRows = rows
    .filter((row) => row.bigFishWeight > 0)
    .sort((left, right) => right.bigFishWeight - left.bigFishWeight);

  return eligibleRows[0] ?? null;
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

  const [importedResult, setImportedResult] =
    useState<WeighfishParseResult | null>(null);

  const [resultRows, setResultRows] = useState<WeighfishResultRow[]>(
    initialPreviewRows(initialEntries),
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
  const [goldPayout, setGoldPayout] = useState(
    initialGoldPayout.toFixed(2),
  );
  const [insurancePotPayout, setInsurancePotPayout] = useState(
    initialInsurancePotPayout.toFixed(2),
  );
  const [bigBassPayout, setBigBassPayout] = useState(
    initialBigBassPayout.toFixed(2),
  );
  const [bigBassAngler, setBigBassAngler] = useState(
    initialBigBassAngler ?? "",
  );
  const [bigBassTeam, setBigBassTeam] = useState(
    initialBigBassTeam ?? "",
  );
  const [bigBassWeight, setBigBassWeight] = useState(
    initialBigBassWeight === null
      ? ""
      : initialBigBassWeight.toFixed(2),
  );
  const [insuranceReviewed, setInsuranceReviewed] = useState(
    initialEntries.length > 0,
  );

  const championImageUrl =
    initialChampionImageUrl ?? "/images/results/overall-winner.jpg";
  const bigBassImageUrl =
    initialBigBassImageUrl ?? "/images/results/big-bass.jpg";

  const resetDialogRef = useRef<HTMLDialogElement>(null);

  const totalPaidOut =
    (Number(totalPayout) || 0) +
    (Number(bronzePayout) || 0) +
    (Number(silverPayout) || 0) +
    (Number(goldPayout) || 0) +
    (Number(insurancePotPayout) || 0) +
    (Number(bigBassPayout) || 0);

  const requiresInsuranceReview =
    importedResult !== null && resultRows.length > 0;

  function handleWeighfishImport(result: WeighfishParseResult) {
    setImportedResult(result);
    setResultRows(result.rows);

    setTotalPayout(result.payoutTotals.base.toFixed(2));
    setBronzePayout(result.payoutTotals.bronze.toFixed(2));
    setSilverPayout(result.payoutTotals.silver.toFixed(2));
    setGoldPayout(result.payoutTotals.gold.toFixed(2));
    setBigBassPayout(result.payoutTotals.bigBass.toFixed(2));

    const bigBassWinner = findPrimaryBigBassRow(result.rows);

    if (bigBassWinner) {
      setBigBassTeam(bigBassWinner.entryName);
      setBigBassWeight(bigBassWinner.bigFishWeight.toFixed(2));
    }

    setInsuranceReviewed(false);
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
            resultRows.map((row) => ({
              team: row.entryName,
              weight: row.totalWeight,
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
                defaultValue={timestampToInputValue(
                  tournament.tournament_date,
                )}
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

        <WeighfishCsvUploader onImport={handleWeighfishImport} />

        {importedResult && (
          <section className="border border-[#D4A017]/35 bg-[#111111] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
                  WeighFish Import
                </p>
                <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">
                  Import Ready for Review
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                  The CSV results were attached to the tournament selected in
                  the admin portal. CSV tournament metadata is not required.
                </p>
              </div>

              <div className="border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-right">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-300">
                  Import Status
                </p>
                <p className="mt-1 text-lg font-black uppercase text-white">
                  Ready to Review
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border border-white/10 bg-[#0B0B0B] p-4 sm:col-span-2">
                <dt className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-500">
                  Selected Tournament
                </dt>
                <dd className="mt-1 text-base font-black text-white">
                  {tournament.name}
                </dd>
                <dd className="mt-1 text-sm text-neutral-300">
                  {tournament.lake} ·{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    timeZone: "America/Chicago",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(tournament.tournament_date))}
                </dd>
              </div>

              <div className="border border-white/10 bg-[#0B0B0B] p-4">
                <dt className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-500">
                  Entries Imported
                </dt>
                <dd className="mt-1 text-3xl font-black tabular-nums text-white">
                  {importedResult.rows.length}
                </dd>
              </div>

              <div className="border border-white/10 bg-[#0B0B0B] p-4">
                <dt className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-500">
                  Total Weight
                </dt>
                <dd className="mt-1 text-3xl font-black tabular-nums text-white">
                  {importedResult.rows
                    .reduce((total, row) => total + row.totalWeight, 0)
                    .toFixed(2)}
                  <span className="ml-1 text-sm text-neutral-400">lbs</span>
                </dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Base", importedResult.payoutTotals.base],
                ["Bronze", importedResult.payoutTotals.bronze],
                ["Silver", importedResult.payoutTotals.silver],
                ["Gold", importedResult.payoutTotals.gold],
                ["Big Bass", importedResult.payoutTotals.bigBass],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="border border-white/10 bg-[#0B0B0B] p-3"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-500">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-black tabular-nums text-white">
                    {formatCurrency(Number(value))}
                  </p>
                </div>
              ))}
            </div>

            {importedResult.warnings.filter(
              (warning) =>
                !warning.toLowerCase().includes("tournament name") &&
                !warning.toLowerCase().includes("location") &&
                !warning.toLowerCase().includes("date"),
            ).length > 0 && (
              <div className="mt-4 border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-300">
                  Results Warnings
                </p>
                <ul className="mt-2 space-y-1 text-sm text-amber-100">
                  {importedResult.warnings
                    .filter(
                      (warning) =>
                        !warning.toLowerCase().includes("tournament name") &&
                        !warning.toLowerCase().includes("location") &&
                        !warning.toLowerCase().includes("date"),
                    )
                    .map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
          <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
            Tournament Payouts
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <section className="border border-white/10 bg-[#0B0B0B] p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                WeighFish Payouts
              </h2>

              {[
                {
                  name: "totalPayout",
                  label: "Base Tournament Payout",
                  value: totalPayout,
                  setValue: setTotalPayout,
                  error: state.errors.totalPayout,
                },
                {
                  name: "bronzePayout",
                  label: "Bronze Side Pot",
                  value: bronzePayout,
                  setValue: setBronzePayout,
                  error: state.errors.bronzePayout,
                },
                {
                  name: "silverPayout",
                  label: "Silver Side Pot",
                  value: silverPayout,
                  setValue: setSilverPayout,
                  error: state.errors.silverPayout,
                },
                {
                  name: "goldPayout",
                  label: "Gold Side Pot",
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
                      onChange={(event) =>
                        field.setValue(event.target.value)
                      }
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
                WeighFish Side Pot 1 maps to Bronze, Side Pot 2 maps to
                Silver, and Side Pot 3 maps to Gold.
              </p>
            </section>

            <section className="border border-white/10 bg-[#0B0B0B] p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                Insurance Review
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

              <p className="mt-3 text-xs leading-5 text-neutral-400">
                Confirm the final Insurance Pot distribution managed outside
                WeighFish before saving imported results.
              </p>

              <label className="mt-5 flex cursor-pointer items-start gap-3 border border-white/10 bg-[#111111] p-4">
                <input
                  type="checkbox"
                  checked={insuranceReviewed}
                  onChange={(event) =>
                    setInsuranceReviewed(event.target.checked)
                  }
                  className="mt-1 size-4 accent-red-600"
                />
                <span>
                  <span className="block text-xs font-black uppercase tracking-[0.12em] text-white">
                    Insurance Review Complete
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-400">
                    I verified the Insurance Pot amount and recipients against
                    the tournament registrations.
                  </span>
                </span>
              </label>
            </section>
          </div>

          <section className="mt-5 border border-white/10 bg-[#0B0B0B] p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
              🏆 Winner Photos
            </h2>

            <p className="mt-2 text-sm text-neutral-400">
              Upload the overall winner and Big Bass winner photos.
            </p>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="rounded border border-white/10 bg-[#111111] p-4">
                <h3 className="font-bold text-white">Overall Winner</h3>

                <div className="mt-3 flex h-40 items-center justify-center rounded border border-dashed border-white/15 bg-black/20 text-sm text-neutral-500">
                  Photo Preview
                </div>

                <input
                  name="overallWinnerPhoto"
                  type="file"
                  accept="image/*"
                  className="mt-4 block w-full text-sm text-neutral-300"
                />

                <p className="mt-3 text-xs text-neutral-400">
                  Rename photo to:
                </p>

                <p className="font-semibold text-[#D4A017]">
                  {tournament.lake} Overall Winner.jpg
                </p>
              </div>

              <div className="rounded border border-white/10 bg-[#111111] p-4">
                <h3 className="font-bold text-white">Big Bass Winner</h3>

                <div className="mt-3 flex h-40 items-center justify-center rounded border border-dashed border-white/15 bg-black/20 text-sm text-neutral-500">
                  Photo Preview
                </div>

                <input
                  name="bigBassWinnerPhoto"
                  type="file"
                  accept="image/*"
                  className="mt-4 block w-full text-sm text-neutral-300"
                />

                <p className="mt-3 text-xs text-neutral-400">
                  Rename photo to:
                </p>

                <p className="font-semibold text-[#D4A017]">
                  {tournament.lake} Big Bass Winner.jpg
                </p>
              </div>

              <label className={labelClassName}>
                Big Bass Angler
                <input
                  name="bigBassAngler"
                  required
                  value={bigBassAngler}
                  onChange={(event) =>
                    setBigBassAngler(event.target.value)
                  }
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
                  value={bigBassTeam}
                  onChange={(event) =>
                    setBigBassTeam(event.target.value)
                  }
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
                  onChange={(event) =>
                    setBigBassWeight(event.target.value)
                  }
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
                    onChange={(event) =>
                      setBigBassPayout(event.target.value)
                    }
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

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-l-4 border-red-600 bg-red-950/30 px-4 py-3">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
              Total Paid Out to Anglers
            </span>
            <output className="text-2xl font-black tabular-nums text-white">
              {formatCurrency(totalPaidOut)}
            </output>
          </div>
        </fieldset>

        <fieldset className="overflow-hidden border border-white/10 bg-[#111111]">
          <legend className="ml-5 px-2 text-lg font-black uppercase tracking-tight text-red-500 sm:ml-7">
            Results Preview
          </legend>

          {resultRows.length === 0 ? (
            <div className="p-5 text-sm text-neutral-400 sm:p-7">
              Upload a WeighFish CSV to preview tournament standings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-sm">
                <thead className="bg-[#0B0B0B] text-left">
                  <tr className="border-b border-white/10">
                    {[
                      "Place",
                      "Entry",
                      "Fish",
                      "Weight",
                      "Big Fish",
                      "Base",
                      "Bronze",
                      "Silver",
                      "Gold",
                      "Big Bass",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {resultRows.map((row, index) => (
                    <tr
                      key={`${row.place ?? "unplaced"}-${row.entryName}-${index}`}
                      className="border-b border-white/10 last:border-b-0"
                    >
                      <td className="px-4 py-3 font-black text-[#D4A017]">
                        {row.place ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {row.entryName}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-300">
                        {row.fishCount}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-white">
                        {row.totalWeight.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-300">
                        {row.bigFishWeight.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-300">
                        {formatCurrency(row.basePayout)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-300">
                        {formatCurrency(row.bronzePayout)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-300">
                        {formatCurrency(row.silverPayout)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-300">
                        {formatCurrency(row.goldPayout)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-300">
                        {formatCurrency(row.bigBassPayout)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {state.errors.entries && (
            <p className="m-5 text-sm text-red-400 sm:m-7" role="alert">
              {state.errors.entries}
            </p>
          )}
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

        {requiresInsuranceReview && !insuranceReviewed && (
          <p className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
            Complete the Insurance Review before saving the imported results.
          </p>
        )}

        <button
          type="submit"
          disabled={
            pending ||
            resultRows.length === 0 ||
            (requiresInsuranceReview && !insuranceReviewed)
          }
          className="inline-flex min-h-12 items-center justify-center bg-red-700 px-7 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving Results..." : "Save Results"}
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
            Insurance Pot results, Big Bass results, and tournament-derived
            AOY points for this tournament. Tournament information and
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
