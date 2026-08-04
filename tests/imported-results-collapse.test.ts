import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("imported-results collapse control", () => {
  const source = readFileSync("components/admin/ImportedResultsReview.tsx", "utf8");

  it("defaults the imported results table to expanded", () => {
    expect(source).toContain("useState(true)");
    expect(source).toContain("resultsExpanded ? <div");
    expect(source).toContain("aria-expanded={resultsExpanded}");
  });

  it("toggles the table without invoking import, reset, or navigation", () => {
    expect(source).toContain("setResultsExpanded((expanded) => !expanded)");
    expect(source).toContain('resultsExpanded ? "Collapse Results" : "Expand Results"');
  });

  it("keeps verification state and the imported-entry summary outside the collapsible table", () => {
    expect(source.indexOf("imported {rows.length")).toBeLessThan(source.indexOf("resultsExpanded ? <div"));
    expect(source).toContain("Verify Imported Results");
    expect(source).toContain("Results Verified");
    expect(source).toContain("Continue to Insurance Pot");
  });
});
