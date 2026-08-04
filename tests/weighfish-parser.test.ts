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

  it("accepts valid results without tournament-name metadata", () => {
    const result = parseWeighfishCsv(
      `${headers}\n1,"Smith / Jones",5,21.75,5.82,$1200,"Main Pot: $1200","1st Big Bass"`,
    );

    expect(result.valid).toBe(true);
    expect(result.rows).toHaveLength(1);
    expect(result.tournamentInfo.tournament).toBe("");
    expect(result.warnings).not.toContain(
      "The tournament name was not found in the WeighFish export.",
    );
  });

  it("parses direct Bronze, Silver, and Gold payout columns", () => {
    const result = parseWeighfishCsv(
      `${headers},Bronze Side Pot,Silver Payout,Gold Side Pot Payout\n1,Smith / Jones,5,21.75,5.82,$1200,Main Pot: $1200,,$125.50,$250,$375.25`,
    );
    expect(result.valid).toBe(true);
    expect(result.rows[0]).toMatchObject({
      bronzePayout: 125.5,
      silverPayout: 250,
      goldPayout: 375.25,
    });
  });

  it("allows missing direct side-pot columns without inventing payouts", () => {
    const result = parseWeighfishCsv(`${headers}\n1,Smith / Jones,5,21.75,5.82,$1200,,`);
    expect(result.valid).toBe(true);
    expect(result.rows[0]).toMatchObject({ bronzePayout: 0, silverPayout: 0, goldPayout: 0 });
  });

  it.each(["not money", "-$20"])("rejects malformed direct side-pot value %s", (value) => {
    const result = parseWeighfishCsv(`${headers},Bronze Payout\n1,Smith / Jones,5,21.75,5.82,$1200,,,${value}`);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("Bronze payout"))).toBe(true);
    expect(result.rows[0].validationMessages?.some((error) => error.includes("Bronze payout"))).toBe(true);
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

  it("does not warn for zero-weight teams tied at the end of the standings", () => {
    const zeroWeightRows = Array.from({ length: 22 }, (_, index) =>
      `39,Zero Team ${index + 1},0,0,0,$0,,`,
    ).join("\n");
    const result = parseWeighfishCsv(`${headers}\n1,Winner Team,5,20.5,5.2,$1000,Main Pot: $1000,\n${zeroWeightRows}`);
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it.each([
    ["non-zero first-place tie", `1,Smith / Jones,5,20,5,$0,,\n1,Brown / Davis,5,20,4,$0,,`],
    ["payout tie", `5,Smith / Jones,0,0,0,$100,Main Pot: $100,\n5,Brown / Davis,0,0,0,$0,,`],
    ["Big Bass tie", `5,Smith / Jones,0,0,6,$0,,1st Big Bass\n5,Brown / Davis,0,0,0,$0,,`],
    ["duplicate placement before later standings", `5,Smith / Jones,0,0,0,$0,,\n5,Brown / Davis,0,0,0,$0,,\n6,Taylor / Moore,0,0,0,$0,,`],
  ])("warns for a meaningful %s", (_label, rows) => {
    const result = parseWeighfishCsv(`${headers}\n${rows}`);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((warning) => warning.includes("official tie"))).toBe(true);
  });
});
