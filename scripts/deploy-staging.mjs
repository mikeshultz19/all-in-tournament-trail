import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STAGING_PROJECT_REF = "vcjhufuklqwvnqmarpqi";
export const STAGING_WORKER_NAME = "all-in-tournament-trail-staging";
export const PRODUCTION_PROJECT_REF = "qrmnglzylrrdhcvashmx";
export const PRODUCTION_DOMAIN = "allintrail.com";

export const PUBLIC_STAGING_VARIABLES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
  "NEXT_PUBLIC_SQUARE_LOCATION_ID",
  "SQUARE_ENVIRONMENT",
  "AITT_EMAIL_ENVIRONMENT",
  "AITT_STAGING_APP_URL",
];

export const REQUIRED_STAGING_CONFIG_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
  "NEXT_PUBLIC_SQUARE_LOCATION_ID",
  "SQUARE_ENVIRONMENT",
  "AITT_EMAIL_ENVIRONMENT",
];

export const REQUIRED_STAGING_RUNTIME_BINDINGS = [
  ...REQUIRED_STAGING_CONFIG_VARS,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SQUARE_ACCESS_TOKEN",
];

export const ENCRYPTED_STAGING_SECRETS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SQUARE_ACCESS_TOKEN",
  "SQUARE_WEBHOOK_SIGNATURE_KEY",
  "SQUARE_WEBHOOK_NOTIFICATION_URL",
  "RESEND_API_KEY",
  "AITT_STAGING_EMAIL_ALLOWLIST",
];

export const REQUIRED_HOSTED_STAGING_SECRET_BINDINGS = [
  "SQUARE_WEBHOOK_SIGNATURE_KEY",
];

function required(environment, name) {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`Missing required staging configuration: ${name}`);
  return value;
}

export function validateHostedSecretBindings(secretNames, workerName = STAGING_WORKER_NAME, requiredNames = REQUIRED_HOSTED_STAGING_SECRET_BINDINGS) {
  if (workerName !== STAGING_WORKER_NAME) {
    throw new Error("Refusing staging deployment: unexpected Worker target.");
  }
  const available = new Set(secretNames);
  const missing = requiredNames.filter((name) => !available.has(name));
  if (missing.length) {
    throw new Error(`Missing required hosted staging secret binding: ${missing.join(", ")}`);
  }
}

export function inspectHostedSecretBindings(workerName = STAGING_WORKER_NAME, runner = spawnSync) {
  if (workerName !== STAGING_WORKER_NAME) {
    throw new Error("Refusing staging deployment: unexpected Worker target.");
  }
  const wranglerCli = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../node_modules/wrangler/bin/wrangler.js");
  const result = runner(process.execPath, [wranglerCli, "secret", "list", "--name", workerName], { encoding: "utf8", shell: false });
  if (result.error || result.status !== 0) {
    throw new Error("Hosted staging secret binding inspection failed.");
  }
  let bindings;
  try {
    bindings = JSON.parse(result.stdout);
  } catch {
    throw new Error("Hosted staging secret binding inspection returned invalid data.");
  }
  if (!Array.isArray(bindings) || bindings.some((binding) => typeof binding?.name !== "string")) {
    throw new Error("Hosted staging secret binding inspection returned invalid data.");
  }
  return bindings.map((binding) => binding.name);
}

export function validateStagingEnvironment(environment, options = {}) {
  const publicUrl = required(environment, "NEXT_PUBLIC_SUPABASE_URL");
  const serverUrl = required(environment, "SUPABASE_URL");
  if (!publicUrl.includes(STAGING_PROJECT_REF) || !serverUrl.includes(STAGING_PROJECT_REF)) {
    throw new Error("Refusing staging deployment: Supabase URLs must target the staging project.");
  }
  if (publicUrl.includes(PRODUCTION_PROJECT_REF) || serverUrl.includes(PRODUCTION_PROJECT_REF)) {
    throw new Error("Refusing staging deployment: production Supabase project detected.");
  }

  if (required(environment, "SQUARE_ENVIRONMENT").toLowerCase() !== "sandbox") {
    throw new Error("Refusing staging deployment: Square Sandbox is required.");
  }
  const appUrl = required(environment, "AITT_STAGING_APP_URL");
  const parsedAppUrl = new URL(appUrl);
  if (parsedAppUrl.protocol !== "https:" || !parsedAppUrl.hostname.endsWith("workers.dev") || parsedAppUrl.hostname.includes(PRODUCTION_DOMAIN)) {
    throw new Error("Refusing staging deployment: app URL must be an HTTPS workers.dev URL.");
  }
  const notificationUrl = required(environment, "SQUARE_WEBHOOK_NOTIFICATION_URL");
  if (!notificationUrl.startsWith(`${appUrl.replace(/\/$/u, "")}/api/`) || notificationUrl.includes(PRODUCTION_DOMAIN)) {
    throw new Error("Refusing staging deployment: Square callback must target the staging app URL.");
  }

  for (const name of REQUIRED_STAGING_RUNTIME_BINDINGS) required(environment, name);
  for (const name of PUBLIC_STAGING_VARIABLES) required(environment, name);
  const missingLocalSecrets = ENCRYPTED_STAGING_SECRETS.filter((name) => !environment[name]?.trim());
  if (missingLocalSecrets.length) {
    if (!options.hostedSecretNames) {
      throw new Error(`Missing required staging configuration: ${missingLocalSecrets.join(", ")}`);
    }
    validateHostedSecretBindings(options.hostedSecretNames, options.workerName ?? STAGING_WORKER_NAME, missingLocalSecrets);
  }
  if (options.hostedSecretNames) {
    validateHostedSecretBindings(options.hostedSecretNames, options.workerName ?? STAGING_WORKER_NAME);
  }
  return { appUrl };
}

export function validateStagingConfig(config) {
  if (config.name !== STAGING_WORKER_NAME || config.workers_dev !== true) {
    throw new Error("Staging Wrangler config has an unexpected Worker target.");
  }
  if (config.routes || config.domains || config.send_metrics === false) {
    throw new Error("Staging Wrangler config must not define production routes or domains.");
  }
  for (const name of REQUIRED_STAGING_CONFIG_VARS) required(config.vars ?? {}, name);
  const configuredUrl = config.vars.NEXT_PUBLIC_SUPABASE_URL;
  if (configuredUrl !== `https://${STAGING_PROJECT_REF}.supabase.co`) {
    throw new Error("Staging Wrangler config must require the staging Supabase project.");
  }
  if (config.vars.SQUARE_ENVIRONMENT !== "sandbox") {
    throw new Error("Staging Wrangler config must require Square Sandbox.");
  }
}

function run(command, args, environment, projectRoot) {
  const result = spawnSync(command, args, { cwd: projectRoot, env: environment, stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function main() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const configPath = path.join(projectRoot, "wrangler.staging.jsonc");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  validateStagingConfig(config);
  const hostedSecretNames = inspectHostedSecretBindings();
  const { appUrl } = validateStagingEnvironment(process.env, { hostedSecretNames });
  if (process.argv.includes("--check")) {
    console.log(`Staging deployment preflight: PASS (${STAGING_WORKER_NAME}, ${appUrl})`);
    return;
  }
  run(process.execPath, [path.join(projectRoot, "node_modules", "@opennextjs", "cloudflare", "dist", "cli", "index.js"), "build"], process.env, projectRoot);
  run("npx", ["wrangler", "deploy", "--config", "wrangler.staging.jsonc"], process.env, projectRoot);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  try { main(); } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
