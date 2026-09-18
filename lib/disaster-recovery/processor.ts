import type { RegistrationBackupRow, RegistrationBackupSheet } from "./google-sheets";

export type DisasterRecoveryStageCode =
  | "SUPABASE_CLAIM_FAILED"
  | "SUPABASE_REGISTRATION_LOAD_FAILED"
  | "GOOGLE_AUTH_FAILED"
  | "GOOGLE_SHEET_ACCESS_FAILED"
  | "GOOGLE_WRITE_FAILED"
  | "OUTBOX_FINISH_FAILED";

export class DisasterRecoveryStageError extends Error {
  constructor(public readonly code: DisasterRecoveryStageCode) {
    super(code);
    this.name = "DisasterRecoveryStageError";
  }
}

export type DisasterRecoveryEvent = {
  id: string;
  registration_id: string;
  event_type: string;
  attempt_count: number;
};

export type DisasterRecoveryEventStore = {
  claim(): Promise<DisasterRecoveryEvent | null>;
  finish(id: string, succeeded: boolean, error?: string): Promise<void>;
};

function stageCode(error: unknown): DisasterRecoveryStageCode {
  if (error instanceof DisasterRecoveryStageError) return error.code;
  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;
    if (code === "GOOGLE_SHEET_ACCESS_FAILED" || code === "GOOGLE_WRITE_FAILED") return code;
  }
  return "GOOGLE_WRITE_FAILED";
}

export async function processOneDisasterRecoveryEvent(
  store: DisasterRecoveryEventStore,
  sheets: RegistrationBackupSheet,
  loadRows: (registrationId: string) => Promise<{ current: RegistrationBackupRow; change: RegistrationBackupRow }>,
) {
  const event = await store.claim();
  if (!event) return { processed: false } as const;
  try {
    const rows = await loadRows(event.registration_id);
    await sheets.upsertCurrentRegistration(rows.current);
    await sheets.appendChangeLog({ ...rows.change, "Event ID": event.id, "Registration ID": event.registration_id, "Change Type": event.event_type });
    try {
      await store.finish(event.id, true);
    } catch {
      throw new DisasterRecoveryStageError("OUTBOX_FINISH_FAILED");
    }
    return { processed: true, synchronized: true } as const;
  } catch (error) {
    const code = stageCode(error);
    try {
      await store.finish(event.id, false, code);
    } catch {
      throw new DisasterRecoveryStageError("OUTBOX_FINISH_FAILED");
    }
    return { processed: true, synchronized: false, error: code } as const;
  }
}
