import { describe, expect, it } from "vitest";

import { parseWeighfishCsv } from "@/lib/weighfishParser";

describe("Weighfish CSV parser", () => {
  it("parses headers and structured rows without assuming column names", () => {
    const result = parseWeighfishCsv(
      'Place,Team,Weight\n1,"Thompson, Jake / Reed, Cody",25.84\n2,Carter / Bennett,24.97',
    );

    expect(result.valid).toBe(true);
    expect(result.headers).toEqual(["Place", "Team", "Weight"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].Team).toBe("Thompson, Jake / Reed, Cody");
  });

  it("supports configurable required columns for future mapping", () => {
    const result = parseWeighfishCsv("Place,Team\n1,Smith / Jones", {
      requiredHeaders: ["Place", "Team", "Weight"],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing required columns: Weight.");
  });

  it("returns friendly errors for malformed or empty CSV files", () => {
    expect(parseWeighfishCsv("").errors).toContain("The CSV is empty.");
    expect(parseWeighfishCsv("Place,Team\n1").errors[0]).toContain(
      "Row 2 has 1 columns; expected 2.",
    );
    expect(parseWeighfishCsv('Place,Team\n1,"Open quote').errors).toContain(
      "The CSV contains an unclosed quoted value.",
    );
  });
});
