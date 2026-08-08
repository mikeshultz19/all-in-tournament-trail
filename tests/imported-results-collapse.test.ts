import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("imported-results collapse control", () => {
  const source = readFileSync("components/admin/ImportedResultsReview.tsx", "utf8");

  it("defaults unverified results to expanded and verified results to collapsed", () => {
    expect(source).toContain("useState(() => !verified)");
    expect(source).toContain("resultsExpanded ? <div");
    expect(source).toContain("aria-expanded={resultsExpanded}");
  });

  it("toggles the table without invoking import, reset, or navigation", () => {
    expect(source).toContain("setResultsExpanded((expanded) => !expanded)");
    expect(source).toContain('resultsExpanded ? "Collapse" : verified ? "Edit" : "Expand"');
  });

  it("keeps verification state and the imported-entry summary outside the collapsible table", () => {
    expect(source.indexOf("imported {rows.length")).toBeLessThan(source.indexOf("resultsExpanded ? <div"));
    expect(source).toContain("Verify Imported Results");
    expect(source).toContain("Results Verified");
    expect(source).toContain("{rows.length} Teams Imported");
  });
});
