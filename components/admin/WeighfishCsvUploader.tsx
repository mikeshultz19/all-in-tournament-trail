"use client";

import { CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  useRef,
  useState,
} from "react";

import {
  parseWeighfishCsv,
  type WeighfishParseResult,
} from "@/lib/weighfishParser";

type UploadStatus = "idle" | "ready" | "success" | "error";

export default function WeighfishCsvUploader({
  onImport,
}: {
  onImport?: (rows: Array<{ team: string; weight: string }>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<WeighfishParseResult | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  async function loadFile(selectedFile: File) {
    setFile(selectedFile);

    if (!selectedFile.name.toLocaleLowerCase().endsWith(".csv")) {
      setResult({
        valid: false,
        headers: [],
        rows: [],
        errors: ["Choose a CSV file ending in .csv."],
      });
      setStatus("error");
      return;
    }

    try {
      const parsed = parseWeighfishCsv(await selectedFile.text());
      setResult(parsed);
      setStatus(parsed.valid ? "ready" : "error");
    } catch {
      setResult({
        valid: false,
        headers: [],
        rows: [],
        errors: ["We could not read that CSV. Choose another file."],
      });
      setStatus("error");
    }
  }

  function removeFile() {
    setFile(null);
    setResult(null);
    setStatus("idle");
    setDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) void loadFile(selectedFile);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const selectedFile = event.dataTransfer.files[0];
    if (selectedFile) void loadFile(selectedFile);
  }

  async function importResults() {
    if (!file) return;
    const parsed = parseWeighfishCsv(await file.text());
    setResult(parsed);

    if (parsed.valid) {
      onImport?.(
        parsed.rows.map((row) => ({
          team: row.Team ?? row.team ?? "",
          weight: row.Weight ?? row.weight ?? "",
        })),
      );
      console.info("Parsed Weighfish CSV:", parsed);
      setStatus("success");
    } else {
      setStatus("error");
    }
  }

  return (
    <section
      aria-labelledby="weighfish-import-heading"
      className="mt-6 border border-white/10 bg-[#111111] p-5 sm:p-7"
    >
      <div className="border-b border-white/10 pb-4">
        <h2
          id="weighfish-import-heading"
          className="text-xl font-black uppercase tracking-tight text-white"
        >
          Import Weighfish Results
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
          Upload the official Weighfish tournament CSV. The imported standings
          will populate the Winners Circle and Complete Results.
        </p>
      </div>

      {!file ? (
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragging(false);
            }
          }}
          onDrop={handleDrop}
          className={`mt-5 flex min-h-56 flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-red-500 bg-red-950/30"
              : "border-white/20 bg-[#0B0B0B]"
          }`}
        >
          <Upload
            aria-hidden="true"
            className={`size-10 ${dragging ? "text-red-400" : "text-neutral-400"}`}
          />
          <p className="mt-4 text-lg font-black uppercase tracking-tight text-white">
            Drag &amp; Drop CSV Here
          </p>
          <p className="my-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
            or
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-11 items-center justify-center border border-red-600 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-700"
          >
            Browse for CSV
          </button>
          <p className="mt-3 text-xs text-neutral-500">Accepted file type: .csv</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileInput}
            className="sr-only"
            aria-label="Choose Weighfish CSV"
          />
        </div>
      ) : (
        <div className="mt-5 border border-white/10 bg-[#0B0B0B] p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            {result?.valid ? (
              <CheckCircle2
                aria-hidden="true"
                className="size-6 shrink-0 text-emerald-400"
              />
            ) : (
              <FileSpreadsheet
                aria-hidden="true"
                className="size-6 shrink-0 text-red-400"
              />
            )}
            <p className="min-w-0 truncate font-bold text-white">
              {result?.valid ? "✓ " : ""}
              {file.name}
            </p>
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="border border-white/10 px-4 py-3">
              <dt className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-500">
                Rows Detected
              </dt>
              <dd className="mt-1 text-xl font-black text-white">
                {result?.rows.length ?? 0}
              </dd>
            </div>
            <div className="border border-white/10 px-4 py-3">
              <dt className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-500">
                Teams Detected
              </dt>
              <dd className="mt-1 text-xl font-black text-white">
                {result?.rows.length ?? 0}
              </dd>
            </div>
          </dl>

          {result && result.errors.length > 0 && (
            <div
              role="alert"
              className="mt-4 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <p className="font-bold">Review this CSV before importing:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {status === "success" && (
            <p
              role="status"
              className="mt-4 border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300"
            >
              Import Successful
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!result?.valid}
              onClick={() => void importResults()}
              className="inline-flex min-h-11 items-center justify-center bg-red-700 px-5 text-xs font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Import Results
            </button>
            <button
              type="button"
              onClick={removeFile}
              className="inline-flex min-h-11 items-center justify-center border border-white/20 px-5 text-xs font-black uppercase tracking-[0.12em] text-neutral-300 transition hover:border-white/40 hover:text-white"
            >
              Remove File
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
