"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import {
  importWeighfishResultsAction,
  type WeighfishImportState,
} from "@/app/admin/tournament-manager/import/actions";
import {
  parseWeighfishCsv,
  type WeighfishParseResult,
} from "@/lib/weighfishParser";

interface WeighfishCsvUploaderProps {
  tournamentId: string;
  onImport?: (result: WeighfishParseResult) => void;
  returnToDashboard?: boolean;
}

const initialImportState: WeighfishImportState = {
  status: "idle",
  message: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function WeighfishCsvUploader({
  tournamentId,
  onImport,
  returnToDashboard = false,
}: WeighfishCsvUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [result, setResult] =
    useState<WeighfishParseResult | null>(null);
  const [reading, setReading] = useState(false);
  const [importState, setImportState] =
    useState<WeighfishImportState>(initialImportState);
  const [importing, startImport] = useTransition();

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setReading(true);
    setFileName(file.name);
    setResult(null);
    setImportState(initialImportState);

    try {
      const csv = await file.text();
      const parsedResult = parseWeighfishCsv(csv);

      setResult(parsedResult);
    } catch (error) {
      console.error("Could not read WeighFish CSV.", error);

      setResult(null);
      setImportState({
        status: "error",
        message: "The CSV file could not be read.",
      });
    } finally {
      setReading(false);
    }
  }

  function handleImport() {
    if (!result?.valid || result.rows.length === 0) {
      setImportState({
        status: "error",
        message: "Choose a valid WeighFish CSV before importing.",
      });

      return;
    }

    startImport(async () => {
      try {
        const response = await importWeighfishResultsAction(
          tournamentId,
          result.rows,
        );

        setImportState(response);

        if (response.status === "success") {
          onImport?.(result);
          if (returnToDashboard) {
            router.push(
              `/admin?tournament=${encodeURIComponent(tournamentId)}`,
            );
            router.refresh();
          }
        }
      } catch (error) {
        console.error("WeighFish import failed.", error);

        setImportState({
          status: "error",
          message: "The results could not be imported.",
        });
      }
    });
  }

  function resetUploader() {
    setFileName("");
    setResult(null);
    setImportState(initialImportState);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <section className="border border-white/10 bg-[#111111] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
            WeighFish Import
          </p>

          <h2 className="mt-2 text-xl font-black uppercase text-white">
            Upload Tournament CSV
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Choose the official WeighFish CSV, review the summary,
            and import the results.
          </p>
        </div>

        <FileUp
          aria-hidden="true"
          className="size-8 shrink-0 text-[#D4A017]"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
        }}
      />

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={reading || importing}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-12 items-center gap-2 bg-red-700 px-6 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reading ? (
            <Loader2
              aria-hidden="true"
              className="size-5 animate-spin"
            />
          ) : (
            <UploadCloud
              aria-hidden="true"
              className="size-5"
            />
          )}

          {reading
            ? "Reading CSV…"
            : result
              ? "Choose Different CSV"
              : "Choose WeighFish CSV"}
        </button>

        {result && (
          <button
            type="button"
            disabled={reading || importing}
            onClick={resetUploader}
            className="inline-flex min-h-12 items-center border border-white/15 px-5 text-sm font-black uppercase tracking-[0.12em] text-neutral-300 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      </div>

      {fileName && (
        <p className="mt-3 text-sm text-neutral-300">
          Selected: <strong>{fileName}</strong>
        </p>
      )}

      {result?.errors.length ? (
        <div className="mt-5 border border-red-500/40 bg-red-500/10 p-4">
          <p className="font-black uppercase text-red-300">
            CSV Errors
          </p>

          <ul className="mt-2 space-y-1 text-sm text-red-200">
            {result.errors.map((error, index) => (
              <li key={`${error}-${index}`}>
                • {error}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result?.warnings.length ? (
        <div className="mt-5 border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="flex items-center gap-2 font-black uppercase text-amber-300">
            <AlertTriangle
              aria-hidden="true"
              className="size-4"
            />
            Warnings
          </p>

          <ul className="mt-2 space-y-1 text-sm text-amber-200">
            {result.warnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result?.valid && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Entries"
              value={String(result.rows.length)}
            />

            <SummaryCard
              label="Champion"
              value={
                result.rows.find((row) => row.place === 1)
                  ?.entryName ?? "Not listed"
              }
            />

            <SummaryCard
              label="All Listed Cash Payouts"
              value={formatCurrency(
                result.payoutTotals.total,
              )}
            />
          </div>

          <button
            type="button"
            disabled={importing}
            onClick={handleImport}
            className="inline-flex min-h-12 items-center gap-2 bg-[#D4A017] px-6 text-sm font-black uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importing ? (
              <>
                <Loader2
                  aria-hidden="true"
                  className="size-5 animate-spin"
                />
                Importing…
              </>
            ) : (
              <>
                <CheckCircle2
                  aria-hidden="true"
                  className="size-5"
                />
                Import Results
              </>
            )}
          </button>
        </div>
      )}

      {importState.message && (
        <p
          role={importState.status === "error" ? "alert" : "status"}
          className={`mt-5 border px-4 py-3 text-sm font-semibold ${
            importState.status === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {importState.message}
        </p>
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-white">
        {value}
      </p>
    </div>
  );
}
