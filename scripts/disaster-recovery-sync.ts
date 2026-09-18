import { createClient } from "@supabase/supabase-js";

import { getGoogleAccessToken } from "../lib/disaster-recovery/google-auth";
import { createGoogleSheetsBackup } from "../lib/disaster-recovery/google-sheets";
import { loadRegistrationRows, type RegistrationLoaderClient } from "../lib/disaster-recovery/registration-loader";
import { DisasterRecoveryStageError, processOneDisasterRecoveryEvent, type DisasterRecoveryEvent, type DisasterRecoveryEventStore } from "../lib/disaster-recovery/processor";

const BATCH_SIZE = 50;

type CliClient = RegistrationLoaderClient & {
  rpc(name: string, args?: Record<string, unknown>): Promise<{ data: unknown; error: Error | null }>;
};

function required(name: string, code: DisasterRecoveryStageError["code"]) {
  const value = process.env[name]?.trim();
  if (!value) throw new DisasterRecoveryStageError(code);
  return value;
}

function storeFor(supabase: CliClient): DisasterRecoveryEventStore {
  return {
    async claim() {
      const { data, error } = await supabase.rpc("claim_registration_disaster_recovery_event");
      if (error) throw new DisasterRecoveryStageError("SUPABASE_CLAIM_FAILED");
      return data as DisasterRecoveryEvent | null;
    },
    async finish(id, succeeded, error) {
      const result = await supabase.rpc("finish_registration_disaster_recovery_event", { p_event_id: id, p_succeeded: succeeded, p_error: error ?? null });
      if (result.error) throw new DisasterRecoveryStageError("OUTBOX_FINISH_FAILED");
    },
  };
}

async function main() {
  const supabaseUrl = required("AITT_DR_STAGING_SUPABASE_URL", "SUPABASE_CLAIM_FAILED");
  const supabaseKey = required("AITT_DR_STAGING_SUPABASE_SECRET_KEY", "SUPABASE_CLAIM_FAILED");
  const serviceAccount = required("AITT_DR_STAGING_GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_AUTH_FAILED");
  const spreadsheetId = required("AITT_DR_STAGING_GOOGLE_SHEET_ID", "GOOGLE_SHEET_ACCESS_FAILED");
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } }) as unknown as CliClient;

  let accessToken: string;
  try {
    accessToken = await getGoogleAccessToken(serviceAccount);
  } catch {
    throw new DisasterRecoveryStageError("GOOGLE_AUTH_FAILED");
  }

  const store = storeFor(supabase);
  const sheets = createGoogleSheetsBackup({ spreadsheetId, accessToken });
  let processed = 0;
  let synchronized = 0;
  let failed = 0;
  let firstError: string | null = null;

  for (; processed < BATCH_SIZE; processed += 1) {
    const result = await processOneDisasterRecoveryEvent(store, sheets, (id) => loadRegistrationRows(supabase, id));
    if (!result.processed) break;
    if (result.synchronized) synchronized += 1;
    else {
      failed += 1;
      firstError ??= result.error;
    }
  }

  const summary = { processed, synchronized, failed, error: firstError };
  console.log(JSON.stringify(summary));
  if (firstError) process.exitCode = 1;
}

main().catch((error: unknown) => {
  const code = error instanceof DisasterRecoveryStageError ? error.code : "SUPABASE_CLAIM_FAILED";
  console.error(JSON.stringify({ error: code }));
  process.exitCode = 1;
});
