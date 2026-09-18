import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ENCRYPTED_STAGING_SECRETS,
  PUBLIC_STAGING_VARIABLES,
  STAGING_PROJECT_REF,
  STAGING_WORKER_NAME,
  validateStagingConfig,
  validateStagingEnvironment,
} from "../scripts/deploy-staging.mjs";

const config = JSON.parse(readFileSync("wrangler.staging.jsonc", "utf8"));

const validEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: `https://${STAGING_PROJECT_REF}.supabase.co`,
  SUPABASE_URL: `https://${STAGING_PROJECT_REF}.supabase.co`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "staging-publishable-placeholder",
  NEXT_PUBLIC_SQUARE_APPLICATION_ID: "sandbox-app",
  NEXT_PUBLIC_SQUARE_LOCATION_ID: "sandbox-location",
  SQUARE_ENVIRONMENT: "sandbox",
  AITT_EMAIL_ENVIRONMENT: "staging",
  AITT_STAGING_APP_URL: `https://${STAGING_WORKER_NAME}.workers.dev`,
  SQUARE_WEBHOOK_NOTIFICATION_URL: `https://${STAGING_WORKER_NAME}.workers.dev/api/webhooks/square`,
  SUPABASE_SERVICE_ROLE_KEY: "staging-secret-placeholder",
  SQUARE_ACCESS_TOKEN: "sandbox-secret-placeholder",
  SQUARE_WEBHOOK_SIGNATURE_KEY: "sandbox-signature-placeholder",
  RESEND_API_KEY: "staging-email-placeholder",
  AITT_STAGING_EMAIL_ALLOWLIST: "allowlisted@example.test",
};

describe("staging application deployment safeguards", () => {
  it("targets only the staging Worker with workers.dev and no production route", () => {
    expect(config.name).toBe(STAGING_WORKER_NAME);
    expect(config.workers_dev).toBe(true);
    expect(config.routes).toBeUndefined();
    expect(config.vars.NEXT_PUBLIC_SUPABASE_URL).toBe(`https://${STAGING_PROJECT_REF}.supabase.co`);
    expect(config.vars.SQUARE_ENVIRONMENT).toBe("sandbox");
    expect(JSON.stringify(config)).not.toContain("allintrail.com");
    expect(JSON.stringify(config)).not.toContain("qrmnglzylrrdhcvashmx");
    validateStagingConfig(config);
  });

  it("requires every public and encrypted staging input", () => {
    expect(PUBLIC_STAGING_VARIABLES).toContain("AITT_STAGING_APP_URL");
    expect(ENCRYPTED_STAGING_SECRETS).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(ENCRYPTED_STAGING_SECRETS).toContain("SQUARE_ACCESS_TOKEN");
    expect(ENCRYPTED_STAGING_SECRETS).toContain("AITT_STAGING_EMAIL_ALLOWLIST");
    expect(validateStagingEnvironment(validEnvironment).appUrl).toContain("workers.dev");
  });

  it.each([
    ["production Supabase", { ...validEnvironment, SUPABASE_URL: "https://qrmnglzylrrdhcvashmx.supabase.co" }],
    ["production Square", { ...validEnvironment, SQUARE_ENVIRONMENT: "production" }],
    ["production domain", { ...validEnvironment, AITT_STAGING_APP_URL: "https://allintrail.com" }],
  ])("rejects %s", (_label, environment) => {
    expect(() => validateStagingEnvironment(environment)).toThrow();
  });
});
