import { describe, expect, it } from "vitest";
import { reconcileWeighfishResults, type WeighfishRosterEntry } from "@/lib/weighfish-reconciliation";

const team = (id: string, boatNumber: number, angler1Name: string, angler2Name: string): WeighfishRosterEntry => ({ id, boatNumber, registrationType: "team", angler1Name, angler2Name });
const solo = (id: string, boatNumber: number, angler1Name: string): WeighfishRosterEntry => ({ id, boatNumber, registrationType: "solo", angler1Name, angler2Name: null });
const result = (id: string, teamName: string, registrationId: string | null = null) => ({ id, place: Number(id.replace(/\D/g, "")) || 1, teamName, registrationId });

describe("WeighFish roster reconciliation", () => {
  it.each([
    [team("r1", 1, "Bob Johnson", "Eli Crawford"), "Bob Johnson / Eli Crawford"],
    [team("r2", 2, "Sarah Shultz", "Sarah Sucka"), "sarah shultz/sarah sucka"],
    [team("r3", 3, "Mike Schultz", "John Smith"), "Mike Shultz / John Smith"],
    [team("r4", 4, "Garrett Stone", "Hunter Dean"), "Garret Stone / Hunter Deen"],
    [solo("r5", 5, "Alex Mercer"), "Alex Mercr"],
  ])("auto-matches exact formatting and uniquely strong typos", (roster, imported) => {
    const plan = reconcileWeighfishResults({ roster: [roster], results: [result("i1", imported)] });
    expect(plan.rows[0].outcome).toBe("auto");
    expect(plan.ready).toBe(true);
  });

  it("requires review when one team member differs materially", () => {
    const plan = reconcileWeighfishResults({ roster: [team("r1", 14, "Justin Moore", "Ryan Clark")], results: [result("i1", "Justin Moore / Brian Clark")] });
    expect(plan.rows[0].outcome).toBe("manual");
    expect(plan.ready).toBe(false);
  });

  it("never auto-matches two similarly plausible candidates", () => {
    const roster = [team("r1", 1, "Sam Turner", "John Smith"), team("r2", 2, "Sam Turner", "Jon Smith")];
    expect(reconcileWeighfishResults({ roster, results: [result("i1", "Sam Turner / Jonn Smith")] }).rows[0].outcome).toBe("manual");
  });

  it("does not silently match an incomplete team name", () => {
    const plan = reconcileWeighfishResults({ roster: [team("r1", 7, "Caleb Turner", "Dylan Hayes")], results: [result("i1", "Caleb Turner")] });
    expect(["manual", "unmatched"]).toContain(plan.rows[0].outcome);
  });

  it("blocks a completely unknown extra import", () => {
    const plan = reconcileWeighfishResults({ roster: [team("r1", 1, "Known One", "Known Two")], results: [result("i1", "Robert Random / Steve Unknown")] });
    expect(plan.unmatchedImports).toHaveLength(1);
    expect(plan.ready).toBe(false);
  });

  it("identifies the exact missing active boat without creating a result", () => {
    const roster = Array.from({ length: 28 }, (_, index) => solo(`r${index + 1}`, index + 1, `Angler ${index + 1}`));
    const results = roster.slice(0, 27).map((entry, index) => result(`i${index + 1}`, entry.angler1Name));
    const plan = reconcileWeighfishResults({ roster, results });
    expect(plan.missingResults.map((entry) => entry.boatNumber)).toEqual([28]);
    expect(plan.importedResultCount).toBe(27);
  });

  it("identifies an extra unmatched import", () => {
    const roster = [solo("r1", 1, "Alex Mercer")];
    const plan = reconcileWeighfishResults({ roster, results: [result("i1", "Alex Mercer"), result("i2", "Unknown Person")] });
    expect(plan.unmatchedImports.map((row) => row.resultId)).toEqual(["i2"]);
  });

  it("blocks duplicate imported ownership", () => {
    const plan = reconcileWeighfishResults({ roster: [solo("r1", 1, "Alex Mercer")], results: [result("i1", "Alex Mercer"), result("i2", "Alex Mercer")] });
    expect(plan.duplicateRows).toHaveLength(2);
    expect(plan.ready).toBe(false);
  });

  it("keeps a persisted manual roster assignment authoritative", () => {
    const plan = reconcileWeighfishResults({ roster: [solo("r1", 1, "Alex Mercer")], results: [result("i1", "Different CSV Label", "r1")] });
    expect(plan.manuallyMatchedCount).toBe(1);
    expect(plan.rows[0].registrationId).toBe("r1");
    expect(plan.ready).toBe(true);
  });
});
