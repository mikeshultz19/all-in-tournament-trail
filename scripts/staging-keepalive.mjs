import path from "node:path";
import { fileURLToPath } from "node:url";

const STAGING_PROJECT_REF = "vcjhufuklqwvnqmarpqi";
const PRODUCTION_PROJECT_REF = "qrmnglzylrrdhcvashmx";
const EXPECTED_STAGING_ORIGIN = `https://${STAGING_PROJECT_REF}.supabase.co`;

export function validateStagingUrl(value) {
  if (!value?.trim()) {
    throw new Error("STAGING_SUPABASE_URL is required.");
  }

  const url = new URL(value);

  if (url.hostname.includes(PRODUCTION_PROJECT_REF)) {
    throw new Error("Refusing keepalive: production Supabase project detected.");
  }

  if (url.origin !== EXPECTED_STAGING_ORIGIN) {
    throw new Error(
      `Refusing keepalive: expected staging project ${STAGING_PROJECT_REF}.`,
    );
  }

  return url.origin;
}

export async function runStagingKeepalive({
  supabaseUrl = process.env.STAGING_SUPABASE_URL,
  publishableKey = process.env.STAGING_SUPABASE_PUBLISHABLE_KEY,
  fetchImplementation = fetch,
} = {}) {
  const origin = validateStagingUrl(supabaseUrl);

  if (!publishableKey?.trim()) {
    throw new Error("STAGING_SUPABASE_PUBLISHABLE_KEY is required.");
  }

  const response = await fetchImplementation(
    `${origin}/rest/v1/tournaments?select=id&limit=1`,
    {
      method: "GET",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Staging keepalive read failed with HTTP ${response.status}.`);
  }

  await response.json();
  console.log("Staging keepalive: PASS (read completed).");
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runStagingKeepalive().catch((error) => {
    console.error(
      `Staging keepalive: FAIL (${error instanceof Error ? error.message : "unknown error"})`,
    );
    process.exitCode = 1;
  });
}
