import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("WeighFish import diagnostics", () => {
  const action = readFileSync("app/admin/tournament-manager/import/actions.ts", "utf8");
  const uploader = readFileSync("components/admin/WeighfishCsvUploader.tsx", "utf8");

  it("logs actionable Supabase diagnostics on the server", () => {
    for (const field of ["operation", "table", "code", "message", "details", "hint"]) {
      expect(action).toContain(field);
    }
    expect(action).toContain("RPC import_working_results");
    expect(action).toContain("UPDATE results_verified_at/results_verified_by");
  });

  it("returns a reason without exposing a stack trace", () => {
    expect(action).toContain("Import failed\\n\\nReason:");
    expect(action).toContain("Nothing was imported.");
    expect(action).not.toMatch(/message:.*stack/);
    expect(uploader).toContain("whitespace-pre-line");
  });

  it("reports the separate verification-state update as a partial import", () => {
    expect(action).toContain("Imported rows were saved, but verification state could not be reset.");
    expect(action).toContain("Use Reset Import before attempting another import.");
  });
});
