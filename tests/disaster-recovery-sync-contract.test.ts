import { describe, expect, it } from "vitest";

import { createGoogleSheetsBackup, DisasterRecoverySheetError } from "../lib/disaster-recovery/google-sheets";
import { DisasterRecoveryStageError, processOneDisasterRecoveryEvent } from "../lib/disaster-recovery/processor";

const currentHeaders = ["Registration ID", "Registration Number"];
const changeHeaders = ["Event ID", "Registration ID", "Change Type"];

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function rowData() {
  return {
    current: { "Registration ID": "reg-1", "Registration Number": 16 },
    change: { "Event ID": "event-1", "Registration ID": "reg-1", "Change Type": "registration_updated" },
  };
}

describe("disaster-recovery Google persistence contract", () => {
  it("confirms both writes before the processor marks an event synchronized", async () => {
    const calls: string[] = [];
    const sheets = createGoogleSheetsBackup({
      spreadsheetId: "sheet",
      accessToken: "token",
      fetchImpl: async (input, init) => {
        const url = String(input);
        calls.push(`${init?.method ?? "GET"} ${url}`);
        if (init?.method === "PUT" || init?.method === "POST") return response({ updates: { updatedRows: 1, updatedCells: 2 } });
        return url.includes("Current%20Registrations") ? response({ values: [currentHeaders] }) : response({ values: [changeHeaders] });
      },
    });
    const finished: Array<[boolean, string | undefined]> = [];
    const result = await processOneDisasterRecoveryEvent(
      { claim: async () => ({ id: "event-1", registration_id: "reg-1", event_type: "registration_updated", attempt_count: 1 }), finish: async (_id, ok, error) => { finished.push([ok, error]); } },
      sheets,
      async () => rowData(),
    );
    expect(result).toEqual({ processed: true, synchronized: true });
    expect(finished).toEqual([[true, undefined]]);
    expect(calls.filter((call) => call.startsWith("POST")).length).toBe(2);
  });

  it("fails closed when a tab is empty or a write is not confirmed", async () => {
    const empty = createGoogleSheetsBackup({ spreadsheetId: "sheet", accessToken: "token", fetchImpl: async () => response({ values: [] }) });
    await expect(empty.upsertCurrentRegistration(rowData().current)).rejects.toMatchObject({ code: "GOOGLE_SHEET_ACCESS_FAILED" });
    const unconfirmed = createGoogleSheetsBackup({ spreadsheetId: "sheet", accessToken: "token", fetchImpl: async (input, init) => init?.method ? response({ updates: { updatedRows: 0 } }) : response({ values: [currentHeaders] }) });
    await expect(unconfirmed.upsertCurrentRegistration(rowData().current)).rejects.toMatchObject({ code: "GOOGLE_WRITE_FAILED" });
  });

  it("classifies API, timeout, and duplicate paths without duplicating change history", async () => {
    const failed = createGoogleSheetsBackup({ spreadsheetId: "sheet", accessToken: "token", fetchImpl: async (_input, init) => init?.method ? response({}, 500) : response({ values: [currentHeaders] }) });
    await expect(failed.upsertCurrentRegistration(rowData().current)).rejects.toBeInstanceOf(DisasterRecoverySheetError);
    const timeout = createGoogleSheetsBackup({ spreadsheetId: "sheet", accessToken: "token", fetchImpl: async () => { throw new Error("timeout"); } });
    await expect(timeout.appendChangeLog(rowData().change)).rejects.toMatchObject({ code: "GOOGLE_SHEET_ACCESS_FAILED" });
    let appends = 0;
    const duplicate = createGoogleSheetsBackup({ spreadsheetId: "sheet", accessToken: "token", fetchImpl: async (input, init) => {
      if (init?.method === "POST") appends += 1;
      return response(String(input).includes("Current%20Registrations") ? { values: [currentHeaders] } : { values: [changeHeaders, ["event-1", "reg-1", "registration_updated"]] });
    } });
    await duplicate.appendChangeLog(rowData().change);
    expect(appends).toBe(0);
  });
});

describe("disaster-recovery processor failure contract", () => {
  it("finishes a failed event retryably and never reports synchronization", async () => {
    const finished: Array<[boolean, string | undefined]> = [];
    const result = await processOneDisasterRecoveryEvent(
      { claim: async () => ({ id: "event-1", registration_id: "reg-1", event_type: "registration_updated", attempt_count: 1 }), finish: async (_id, ok, error) => { finished.push([ok, error]); } },
      { upsertCurrentRegistration: async () => { throw new DisasterRecoveryStageError("GOOGLE_WRITE_FAILED"); }, appendChangeLog: async () => undefined },
      async () => rowData(),
    );
    expect(result).toEqual({ processed: true, synchronized: false, error: "GOOGLE_WRITE_FAILED" });
    expect(finished).toEqual([[false, "GOOGLE_WRITE_FAILED"]]);
  });

  it("surfaces an outbox finish failure instead of claiming success", async () => {
    await expect(processOneDisasterRecoveryEvent(
      { claim: async () => ({ id: "event-1", registration_id: "reg-1", event_type: "registration_updated", attempt_count: 1 }), finish: async () => { throw new DisasterRecoveryStageError("OUTBOX_FINISH_FAILED"); } },
      { upsertCurrentRegistration: async () => undefined, appendChangeLog: async () => undefined },
      async () => rowData(),
    )).rejects.toMatchObject({ code: "OUTBOX_FINISH_FAILED" });
  });

  it("processes a Ray-Hubbard-sized batch with one current row and history row per event", async () => {
    let remaining = 16;
    let currentWrites = 0;
    let historyWrites = 0;
    let finished = 0;
    const store = {
      claim: async () => remaining ? ({ id: `event-${remaining}`, registration_id: `reg-${remaining}`, event_type: "registration_updated", attempt_count: 1 }) : null,
      finish: async () => { remaining -= 1; finished += 1; },
    };
    const sheets = { upsertCurrentRegistration: async () => { currentWrites += 1; }, appendChangeLog: async () => { historyWrites += 1; } };
    for (let index = 0; index < 16; index += 1) {
      const result = await processOneDisasterRecoveryEvent(store, sheets, async () => rowData());
      expect(result.synchronized).toBe(true);
    }
    expect([currentWrites, historyWrites, finished]).toEqual([16, 16, 16]);
  });
});
