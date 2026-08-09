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
    expect(source).toContain("function toggleResults() { setResultsExpanded((expanded) => !expanded); }");
    expect(source.match(/onClick=\{toggleResults\}/g)).toHaveLength(2);
    expect(source).toContain('resultsExpanded ? "Collapse" : verified ? "Edit" : "Expand"');
  });

  it("places an equivalent collapse control above and below the long results list", () => {
    const tableIndex = source.indexOf("resultsExpanded ? <div");
    const toggleIndexes = [...source.matchAll(/onClick=\{toggleResults\}/g)].map((match) => match.index ?? -1);
    expect(toggleIndexes).toHaveLength(2);
    expect(toggleIndexes[0]).toBeLessThan(tableIndex);
    expect(toggleIndexes[1]).toBeGreaterThan(tableIndex);
  });

  it("renders the single Reset Import confirmation immediately below the module header", () => {
    const headerIndex = source.indexOf("Reset Import</button></div></div>");
    const confirmationIndex = source.indexOf("confirmingReset ? <div");
    const tableIndex = source.indexOf("resultsExpanded ? <div");
    expect(source.match(/confirmingReset \? <div/g)).toHaveLength(1);
    expect(confirmationIndex).toBeGreaterThan(headerIndex);
    expect(confirmationIndex).toBeLessThan(tableIndex);
  });

  it("keeps verification state and the imported-entry summary outside the collapsible table", () => {
    expect(source.indexOf("imported {rows.length")).toBeLessThan(source.indexOf("resultsExpanded ? <div"));
    expect(source).toContain("Verify Imported Results");
    expect(source).toContain("Results Verified");
    expect(source).toContain("{rows.length} Teams Imported");
  });
});
