import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const STAGING_PROJECT_REF = "vcjhufuklqwvnqmarpqi";
export const PRODUCTION_PROJECT_REF = "qrmnglzylrrdhcvashmx";

const REQUIRED_VARIABLES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

function parseEnvFile(contents) {
  const values = {};

  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/u.exec(line);
    if (!match) continue;

    let value = match[2];
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    values[match[1]] = value;
  }

  return values;
}

export function loadProductionEnvironment(envFilePath) {
  const parsed = parseEnvFile(readFileSync(envFilePath, "utf8"));
  return Object.fromEntries(
    REQUIRED_VARIABLES.map((name) => [name, parsed[name] ?? ""]),
  );
}

export function constructChildEnvironment(inheritedEnvironment, productionValues) {
  return {
    ...inheritedEnvironment,
    ...productionValues,
  };
}

export function validateProductionEnvironment(environment) {
  const missing = REQUIRED_VARIABLES.filter(
    (name) => !environment[name]?.trim(),
  );
  if (missing.length > 0) {
    throw new Error(
      `Production Supabase configuration is incomplete. Missing: ${missing.join(", ")}`,
    );
  }

  const urls = [
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_URL,
  ];

  if (urls.some((url) => url.includes(STAGING_PROJECT_REF))) {
    throw new Error(
      "REFUSING PRODUCTION DEPLOYMENT: staging Supabase configuration detected.",
    );
  }

  if (urls.some((url) => !url.includes(PRODUCTION_PROJECT_REF))) {
    throw new Error(
      `REFUSING PRODUCTION DEPLOYMENT: expected Supabase project ${PRODUCTION_PROJECT_REF}.`,
    );
  }
}

function openNextCli(projectRoot) {
  return path.join(
    projectRoot,
    "node_modules",
    "@opennextjs",
    "cloudflare",
    "dist",
    "cli",
    "index.js",
  );
}

function runOpenNext(command, environment, projectRoot) {
  const result = spawnSync(process.execPath, [openNextCli(projectRoot), command], {
    cwd: projectRoot,
    env: environment,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

export function executeProductionDeployment({
  environment,
  projectRoot,
  checkOnly = false,
  buildOnly = false,
  runner = runOpenNext,
}) {
  // Validate the exact environment passed to each child immediately before it runs.
  validateProductionEnvironment(environment);

  if (checkOnly) return;

  runner("build", environment, projectRoot);
  if (buildOnly) return;

  validateProductionEnvironment(environment);
  runner("deploy", environment, projectRoot);
}

function describeProject(url) {
  if (url?.includes(STAGING_PROJECT_REF)) return "AITT-Staging";
  if (url?.includes(PRODUCTION_PROJECT_REF)) return "AITT Production";
  return "Unknown";
}

function readOptionalProjectRef(projectRoot) {
  try {
    return readFileSync(
      path.join(projectRoot, "supabase", ".temp", "project-ref"),
      "utf8",
    ).trim();
  } catch {
    return "";
  }
}

function main() {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDirectory, "..");
  const productionValues = loadProductionEnvironment(
    path.join(projectRoot, ".env.production.local"),
  );
  const childEnvironment = constructChildEnvironment(
    process.env,
    productionValues,
  );

  if (process.argv.includes("--test-staging-guard")) {
    executeProductionDeployment({
      environment: {
        ...childEnvironment,
        NEXT_PUBLIC_SUPABASE_URL: `https://${STAGING_PROJECT_REF}.supabase.co`,
        SUPABASE_URL: `https://${STAGING_PROJECT_REF}.supabase.co`,
      },
      projectRoot,
    });
    return;
  }

  if (process.argv.includes("--status")) {
    const localValues = parseEnvFile(
      readFileSync(path.join(projectRoot, ".env.local"), "utf8"),
    );
    validateProductionEnvironment(childEnvironment);
    console.log(
      `Local development Supabase: ${describeProject(localValues.NEXT_PUBLIC_SUPABASE_URL)}`,
    );
    console.log(
      `Production deployment Supabase: ${describeProject(childEnvironment.NEXT_PUBLIC_SUPABASE_URL)}`,
    );
    const linkedRef = readOptionalProjectRef(projectRoot);
    if (linkedRef) {
      console.log(`Supabase CLI linked project: ${describeProject(linkedRef)}`);
    }
    return;
  }

  const checkOnly = process.argv.includes("--check");
  const buildOnly = process.argv.includes("--build-only");
  executeProductionDeployment({
    environment: childEnvironment,
    projectRoot,
    checkOnly,
    buildOnly,
  });

  if (checkOnly) {
    console.log(`Production Supabase project: ${PRODUCTION_PROJECT_REF}`);
    console.log("Required public configuration present: yes");
    console.log("Required server configuration present: yes");
    console.log("Staging configuration detected: no");
    console.log("Production deployment preflight: PASS");
  }
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
