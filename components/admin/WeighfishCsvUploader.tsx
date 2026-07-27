"use client";

import { FileUp, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import {
  parseWeighfishCsv,
  type WeighfishParseResult,
} from "@/lib/weighfishParser";

interface WeighfishCsvUploaderProps {
  onImport?: (result: WeighfishParseResult) => void;
}

export default function WeighfishCsvUploader({
  onImport,
}: WeighfishCsvUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<WeighfishParseResult | null>(null);
  const [reading, setReading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setReading(true);
    setFileName(file.name);

    try {
      const csv = await file.text();
      const parsed = parseWeighfishCsv(csv);

      setResult(parsed);

      if (parsed.valid) {
        onImport?.(parsed);
      }
    } catch {
      setResult({
        valid: false,
        headers: [],
        rows: [],
        errors: ["The CSV file could not be read."],
        warnings: [],
        tournamentInfo: {
          tournament: "",
          location: "",
          date: "",
          format: "",
          days: "",
        },
        statistics: {},
        payoutTotals: {
          base: 0,
          bronze: 0,
          silver: 0,
          gold: 0,
          bigBass: 0,
          total: 0,
        },
      });
    } finally {
      setReading(false);
    }
  }

  return (
    <section className="border border-white/10 bg-[#111111] p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
            WeighFish Import
          </p>
          <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">
            Upload Tournament CSV
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
            Upload the complete WeighFish CSV export. Standings, weights, Big Bass,
            and payout totals will be imported automatically for the tournament
            already selected above.
          </p>
        </div>

        <FileUp aria-hidden="true" className="size-8 text-[#D4A017]" />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={reading}
        onClick={() => inputRef.current?.click()}
        className="mt-5 inline-flex min-h-12 items-center gap-2 bg-red-700 px-6 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UploadCloud aria-hidden="true" className="size-5" />
        {reading ? "Reading CSV..." : "Choose WeighFish CSV"}
      </button>

      {fileName && (
        <p className="mt-3 text-sm text-neutral-300">
          Selected file: <strong className="text-white">{fileName}</strong>
        </p>
      )}

      {result?.errors.length ? (
        <div
          className="mt-4 border border-red-500/40 bg-red-500/10 p-4"
          role="alert"
        >
          <p className="text-xs font-black uppercase tracking-[0.12em] text-red-300">
            Import Failed
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-200">
            {result.errors.map((error) => (
              <li key={error}>• {error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result?.valid ? (
        <div
          className="mt-4 border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-200"
          role="status"
        >
          Imported {result.rows.length} tournament result
          {result.rows.length === 1 ? "" : "s"} successfully.
        </div>
      ) : null}
    </section>
  );
}
