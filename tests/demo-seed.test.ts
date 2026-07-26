import { describe, expect, it } from "vitest";

import {
  buildDemoRegistrations,
  DEMO_TOURNAMENT,
  DEMO_FINAL_STANDINGS,
  DEMO_RESULTS_SUMMARY,
} from "@/lib/demo-seed";

describe("demo seed data", () => {
  it("builds the expected featured tournament registration set", () => {
    const registrations = buildDemoRegistrations("tournament-id");

    expect(registrations).toHaveLength(38);
    expect(new Set(registrations.map((registration) => registration.registration_key)).size).toBe(38);
    expect(DEMO_TOURNAMENT.capacity).toBe(50);
    expect(DEMO_TOURNAMENT.registration_closes).toContain("21:00:00");
    expect(DEMO_TOURNAMENT.morning_registration).toBe("05:00");
  });

  it("includes the published Top 20 standings and payout totals", () => {
    expect(DEMO_FINAL_STANDINGS).toHaveLength(26);
    expect(DEMO_FINAL_STANDINGS.filter((entry) => entry.kind === "final")).toHaveLength(20);
    expect(DEMO_RESULTS_SUMMARY.total_payout).toBe(16500);
    expect(DEMO_RESULTS_SUMMARY.bronze_payout).toBe(1350);
    expect(DEMO_RESULTS_SUMMARY.silver_payout).toBe(2250);
    expect(DEMO_RESULTS_SUMMARY.gold_payout).toBe(3000);
    expect(DEMO_RESULTS_SUMMARY.insurance_pot_payout).toBe(1250);
    expect(DEMO_RESULTS_SUMMARY.big_bass_payout).toBe(650);
    expect(
      DEMO_RESULTS_SUMMARY.total_payout +
        DEMO_RESULTS_SUMMARY.bronze_payout +
        DEMO_RESULTS_SUMMARY.silver_payout +
        DEMO_RESULTS_SUMMARY.gold_payout +
        DEMO_RESULTS_SUMMARY.insurance_pot_payout +
        DEMO_RESULTS_SUMMARY.big_bass_payout,
    ).toBe(25000);
  });
});
