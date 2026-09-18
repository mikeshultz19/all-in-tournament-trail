const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

export type DisasterRecoverySheetConfig = {
  spreadsheetId: string;
  accessToken: string;
  fetchImpl?: typeof fetch;
};

export type RegistrationBackupRow = Record<string, string | number | null>;

export interface RegistrationBackupSheet {
  upsertCurrentRegistration(row: RegistrationBackupRow): Promise<void>;
  appendChangeLog(row: RegistrationBackupRow): Promise<void>;
}

export type DisasterRecoveryStageCode = "GOOGLE_SHEET_ACCESS_FAILED" | "GOOGLE_WRITE_FAILED";

export class DisasterRecoverySheetError extends Error {
  constructor(public readonly code: DisasterRecoveryStageCode) {
    super(code);
    this.name = "DisasterRecoverySheetError";
  }
}

type SheetsResponse = { values?: unknown[][]; updates?: { updatedRows?: number; updatedCells?: number } };

async function sheetsRequest(config: DisasterRecoverySheetConfig, path: string, stage: DisasterRecoveryStageCode, init?: RequestInit) {
  let response: Response;
  try {
    response = await (config.fetchImpl ?? fetch)(`${SHEETS_API}/${config.spreadsheetId}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${config.accessToken}`, "content-type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new DisasterRecoverySheetError(stage);
  }
  if (!response.ok) throw new DisasterRecoverySheetError(stage);
  try {
    return await response.json() as SheetsResponse;
  } catch {
    throw new DisasterRecoverySheetError(stage);
  }
}

function requireHeaders(values: unknown[][] | undefined, identifier: string) {
  const headers = (values?.[0] ?? []).map(String);
  if (!headers.includes(identifier)) throw new DisasterRecoverySheetError("GOOGLE_SHEET_ACCESS_FAILED");
  return headers;
}

function requireWriteConfirmation(response: SheetsResponse) {
  if ((response.updates?.updatedRows ?? 0) < 1) throw new DisasterRecoverySheetError("GOOGLE_WRITE_FAILED");
}

export function createGoogleSheetsBackup(config: DisasterRecoverySheetConfig): RegistrationBackupSheet {
  return {
    async upsertCurrentRegistration(row) {
      const registrationId = String(row["Registration ID"] ?? "");
      if (!registrationId) throw new DisasterRecoverySheetError("GOOGLE_WRITE_FAILED");
      const existing = await sheetsRequest(config, "/values/Current%20Registrations!A:AZ", "GOOGLE_SHEET_ACCESS_FAILED");
      const values = existing.values ?? [];
      const headers = requireHeaders(values, "Registration ID");
      const idColumn = headers.indexOf("Registration ID");
      const rowIndex = values.findIndex((value, index) => index > 0 && String(value[idColumn] ?? "") === registrationId);
      const ordered = headers.map((header) => row[header] ?? "");
      if (rowIndex > 0) {
        const response = await sheetsRequest(config, `/values/Current%20Registrations!A${rowIndex + 1}:AZ${rowIndex + 1}?valueInputOption=RAW`, "GOOGLE_WRITE_FAILED", { method: "PUT", body: JSON.stringify({ values: [ordered] }) });
        requireWriteConfirmation(response);
      } else {
        const response = await sheetsRequest(config, "/values/Current%20Registrations!A:AZ:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS", "GOOGLE_WRITE_FAILED", { method: "POST", body: JSON.stringify({ values: [ordered] }) });
        requireWriteConfirmation(response);
      }
    },
    async appendChangeLog(row) {
      const eventId = String(row["Event ID"] ?? "");
      if (!eventId) throw new DisasterRecoverySheetError("GOOGLE_WRITE_FAILED");
      const existing = await sheetsRequest(config, "/values/Registration%20Change%20Log!A:AZ", "GOOGLE_SHEET_ACCESS_FAILED");
      const headers = requireHeaders(existing.values, "Event ID");
      const eventColumn = headers.indexOf("Event ID");
      if ((existing.values ?? []).some((value, index) => index > 0 && String(value[eventColumn] ?? "") === eventId)) return;
      const ordered = headers.map((header) => row[header] ?? "");
      const response = await sheetsRequest(config, "/values/Registration%20Change%20Log!A:AZ:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS", "GOOGLE_WRITE_FAILED", { method: "POST", body: JSON.stringify({ values: [ordered] }) });
      requireWriteConfirmation(response);
    },
  };
}
