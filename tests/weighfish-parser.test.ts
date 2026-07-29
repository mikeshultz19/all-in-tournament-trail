import { describe, expect, it } from "vitest";

import { parseWeighfishCsv } from "@/lib/weighfishParser";

describe("Weighfish CSV parser", () => {
  const headers =
    "Place,Angler,# Fish,Total Weight (lbs),Big Fish (lbs),Cash Payout,Payout Breakdown,Prize Description";

  it("parses the supported WeighFish result export", () => {
    const result = parseWeighfishCsv(
      `${headers}\n1,"Thompson, Jake / Reed, Cody",5,25.84,6.10,$1000,"Main Pot: $1000",""`,
    );

    expect(result.valid).toBe(true);
    expect(result.headers).toEqual(headers.split(","));
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].entryName).toBe("Thompson, Jake / Reed, Cody");
    expect(result.rows[0].totalWeight).toBe(25.84);
    expect(result.rows[0].sourcePlacement).toBe("1");
    expect(result.rows[0].participationStatus).toBe("participated");
  });

  it.each([
    ["DQ", "disqualified"],
    ["No Show", "no_show"],
    ["Withdrawn", "withdrew_after_start"],
  ] as const)("preserves the %s participation outcome", (place, status) => {
    const result = parseWeighfishCsv(
      `${headers}\n${place},"Smith / Jones",0,0,0,$0,"",""`,
    );

    expect(result.valid).toBe(true);
    expect(result.rows[0]).toMatchObject({
      place: null,
      sourcePlacement: place,
      participationStatus: status,
    });
  });

  it("rejects unknown nonnumeric placement values", () => {
    const result = parseWeighfishCsv(
      `${headers}\nUnknown,"Smith / Jones",0,0,0,$0,"",""`,
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("unsupported placement");
  });

  it("supports configurable required columns for future mapping", () => {
    const result = parseWeighfishCsv("Place,Team\n1,Smith / Jones", {
      requiredHeaders: ["Place", "Team", "Weight"],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "The WeighFish results table could not be found.",
    );
  });

  it("returns friendly errors for malformed or empty CSV files", () => {
    expect(parseWeighfishCsv("").errors).toContain("The CSV is empty.");
    expect(parseWeighfishCsv("Place,Team\n1").errors).toContain(
      "The WeighFish results table could not be found.",
    );
    expect(parseWeighfishCsv('Place,Team\n1,"Open quote').errors).toContain(
      "The CSV contains an unclosed quoted value.",
    );
  });
});
