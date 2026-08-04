import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { parseWeighfishCsv } from "@/lib/weighfishParser";

const headers = "Place,Angler,# Fish,Total Weight (lbs),Big Fish (lbs),Cash Payout,Payout Breakdown,Prize Description";
const uploader = readFileSync("components/admin/WeighfishCsvUploader.tsx", "utf8");

describe("WeighFish pre-import preview", () => {
  it("previews every parsed result before confirmation", () => {
    const result = parseWeighfishCsv(`${headers}\n1,Smith / Jones,5,22.40,6.10,$1200,Main Pot: $1200,1st Big Bass\n2,Brown / Davis,4,18.75,4.80,$600,Main Pot: $600,`);
    expect(result.valid).toBe(true);
    expect(result.rows.map((row) => row.entryName)).toEqual(["Smith / Jones", "Brown / Davis"]);
    expect(uploader).toContain("Preview Parsed Results");
    expect(uploader).toContain("result.rows.map");
    for (const label of ["Final Place", "Team or Solo Entry", "Official Weight", "Big Bass Weight", "Participation / Status", "Bronze Payout", "Silver Payout", "Gold Payout", "Listed Cash Payout", "Validation"]) expect(uploader).toContain(label);
  });

  it("does not persist merely by selecting or cancelling a file", () => {
    const handleFile = uploader.slice(uploader.indexOf("async function handleFile"), uploader.indexOf("function handleImport"));
    const resetUploader = uploader.slice(uploader.indexOf("function resetUploader"), uploader.indexOf("return ("));
    expect(handleFile).not.toContain("importWeighfishResultsAction(");
    expect(resetUploader).toContain("setResult(null)");
    expect(resetUploader).toContain("setImportState(initialImportState)");
  });

  it("clears the preview before choosing another CSV", () => {
    expect(uploader).toContain("function chooseDifferentCsv()");
    expect(uploader).toMatch(/function chooseDifferentCsv\(\) \{\s*resetUploader\(\);/);
  });

  it("disables confirmation for blocking errors while allowing warnings", () => {
    const tied = parseWeighfishCsv(`${headers}\n1,Smith / Jones,5,22.40,6.10,$1200,,\n1,Brown / Davis,5,22.40,5.90,$600,,`);
    expect(tied.valid).toBe(true);
    expect(tied.warnings.some((warning) => warning.includes("official tie"))).toBe(true);
    expect(uploader).toContain("disabled={importing || !result.valid}");
    expect(uploader).toContain("Confirm and Import Results");
  });

  it("confirms the exact rows currently shown in the preview", () => {
    expect(uploader).toMatch(/importWeighfishResultsAction\(\s*tournamentId,\s*result\.rows,/);
  });

  it("preserves and displays separate side-pot values after import", () => {
    const review = readFileSync("components/admin/ImportedResultsReview.tsx", "utf8");
    const loader = readFileSync("lib/tournament-import-evidence.ts", "utf8");
    for (const field of ["bronze_payout", "silver_payout", "gold_payout"]) {
      expect(loader).toContain(field);
      expect(review).toContain(field);
    }
    for (const label of ["Bronze Payout", "Silver Payout", "Gold Payout"]) expect(review).toContain(label);
  });
});
