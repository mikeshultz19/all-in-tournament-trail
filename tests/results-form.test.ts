import { describe, expect, it } from "vitest";

import {
  resultsFormData,
  validateResultsForm,
  type ResultsFormValues,
} from "@/lib/results-form";

const validValues: ResultsFormValues = {
  name: "Lake Fork Championship",
  tournamentDate: "2026-07-19T06:00",
  lake: "Lake Fork",
  totalPayout: 10000,
  bronzePayout: 4000,
  silverPayout: 2500,
  goldPayout: 1750,
  insurancePotPayout: 500,
  bigBassPayout: 650,
  bigBassAngler: "Dylan Carter",
  bigBassTeam: "Carter / Reynolds",
  bigBassWeight: 8.91,
  championImageUrl: "/images/results/overall-winner.jpg",
  bigBassImageUrl: "/images/results/big-bass.jpg",
  entries: [{ place: 1, team: "Smith / Jones", weight: 21.45 }],
};

describe("results form validation", () => {
  it("requires tournament identity and result entries", () => {
    expect(validateResultsForm({ ...validValues, name: "" }).name).toBeDefined();
    expect(validateResultsForm({ ...validValues, lake: "" }).lake).toBeDefined();
    expect(
      validateResultsForm({ ...validValues, entries: [] }).entries,
    ).toBeDefined();
  });

  it("rejects invalid result rows", () => {
    expect(
      validateResultsForm({
        ...validValues,
        entries: [{ place: 1, team: "", weight: -1 }],
      }).entries,
    ).toBeDefined();
  });

  it("rejects negative or invalid payouts", () => {
    expect(
      validateResultsForm({ ...validValues, totalPayout: -1 }).totalPayout,
    ).toBeDefined();
    expect(
      validateResultsForm({ ...validValues, totalPayout: Number.NaN })
        .totalPayout,
    ).toBeDefined();
    expect(
      validateResultsForm({ ...validValues, insurancePotPayout: -1 })
        .insurancePotPayout,
    ).toBeDefined();
    expect(
      validateResultsForm({ ...validValues, bronzePayout: -1 }).bronzePayout,
    ).toBeDefined();
    expect(
      validateResultsForm({ ...validValues, bigBassPayout: -1 }).bigBassPayout,
    ).toBeDefined();
  });

  it("parses separate Weighfish and manual Insurance Pot payouts", () => {
    const formData = new FormData();
    formData.set("totalPayout", "18750.25");
    formData.set("bronzePayout", "4000.00");
    formData.set("silverPayout", "2500.00");
    formData.set("goldPayout", "1750.00");
    formData.set("insurancePotPayout", "500.50");
    formData.set("bigBassPayout", "650");
    formData.set("bigBassAngler", "Dylan Carter");
    formData.set("bigBassTeam", "Carter / Reynolds");
    formData.set("bigBassWeight", "8.91");
    formData.set("championImageUrl", "/images/results/overall-winner.jpg");
    formData.set("bigBassImageUrl", "/images/results/big-bass.jpg");

    const values = resultsFormData(formData);

    expect(values.totalPayout).toBe(18750.25);
    expect(values.bronzePayout).toBe(4000);
    expect(values.silverPayout).toBe(2500);
    expect(values.goldPayout).toBe(1750);
    expect(values.insurancePotPayout).toBe(500.5);
    expect(values.bigBassPayout).toBe(650);
    expect(values.bigBassAngler).toBe("Dylan Carter");
    expect(values.bigBassTeam).toBe("Carter / Reynolds");
    expect(values.bigBassWeight).toBe(8.91);
    expect(values.championImageUrl).toBe("/images/results/overall-winner.jpg");
    expect(values.bigBassImageUrl).toBe("/images/results/big-bass.jpg");
  });
});
