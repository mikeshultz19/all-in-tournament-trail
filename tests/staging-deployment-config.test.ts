import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ENCRYPTED_STAGING_SECRETS,
  PUBLIC_STAGING_VARIABLES,
  REQUIRED_STAGING_CONFIG_VARS,
  REQUIRED_STAGING_RUNTIME_BINDINGS,
  REQUIRED_HOSTED_STAGING_SECRET_BINDINGS,
  inspectHostedSecretBindings,
  validateHostedSecretBindings,
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
    expect(config.vars.NEXT_PUBLIC_SQUARE_APPLICATION_ID).toBeTruthy();
    expect(config.vars.NEXT_PUBLIC_SQUARE_LOCATION_ID).toBeTruthy();
    expect(config.vars.SQUARE_ENVIRONMENT).toBe("sandbox");
    expect(JSON.stringify(config)).not.toContain("allintrail.com");
    expect(JSON.stringify(config)).not.toContain("qrmnglzylrrdhcvashmx");
    validateStagingConfig(config);
  });

  it("requires every public and encrypted staging input", () => {
    expect(REQUIRED_STAGING_CONFIG_VARS).toEqual(expect.arrayContaining([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
      "NEXT_PUBLIC_SQUARE_LOCATION_ID",
      "SQUARE_ENVIRONMENT",
      "AITT_EMAIL_ENVIRONMENT",
    ]));
    expect(PUBLIC_STAGING_VARIABLES).toContain("AITT_STAGING_APP_URL");
    expect(ENCRYPTED_STAGING_SECRETS).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(ENCRYPTED_STAGING_SECRETS).toContain("SQUARE_ACCESS_TOKEN");
    expect(ENCRYPTED_STAGING_SECRETS).toContain("AITT_STAGING_EMAIL_ALLOWLIST");
    expect(REQUIRED_STAGING_RUNTIME_BINDINGS).toEqual(expect.arrayContaining([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
      "NEXT_PUBLIC_SQUARE_LOCATION_ID",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SQUARE_ACCESS_TOKEN",
    ]));
    expect(validateStagingEnvironment(validEnvironment).appUrl).toContain("workers.dev");
  });

  it.each(["NEXT_PUBLIC_SQUARE_APPLICATION_ID", "NEXT_PUBLIC_SQUARE_LOCATION_ID"])("rejects a missing %s runtime binding", (name) => {
    expect(() => validateStagingConfig({ ...config, vars: { ...config.vars, [name]: "" } })).toThrow(`Missing required staging configuration: ${name}`);
  });

  it.each([
    ["production Supabase", { ...validEnvironment, SUPABASE_URL: "https://qrmnglzylrrdhcvashmx.supabase.co" }],
    ["production Square", { ...validEnvironment, SQUARE_ENVIRONMENT: "production" }],
    ["production domain", { ...validEnvironment, AITT_STAGING_APP_URL: "https://allintrail.com" }],
  ])("rejects %s", (_label, environment) => {
    expect(() => validateStagingEnvironment(environment)).toThrow();
  });

  it("accepts a missing local secret when the exact hosted binding is present", () => {
    const environment = { ...validEnvironment, SQUARE_WEBHOOK_SIGNATURE_KEY: "" };
    expect(validateStagingEnvironment(environment, {
      hostedSecretNames: [...REQUIRED_HOSTED_STAGING_SECRET_BINDINGS],
    }).appUrl).toContain("workers.dev");
  });

  it("rejects a missing hosted secret binding", () => {
    expect(() => validateStagingEnvironment(
      { ...validEnvironment, SQUARE_WEBHOOK_SIGNATURE_KEY: "" },
      { hostedSecretNames: [] },
    )).toThrow("Missing required hosted staging secret binding");
  });

  it("rejects an unexpected Worker target", () => {
    expect(() => validateHostedSecretBindings(REQUIRED_HOSTED_STAGING_SECRET_BINDINGS, "all-in-tournament-trail")).toThrow("unexpected Worker target");
  });

  it("fails safely when hosted secret inspection fails", () => {
    const failedRunner = (() => ({ error: new Error("network"), status: 1, stdout: "", stderr: "" })) as unknown as Parameters<typeof inspectHostedSecretBindings>[1];
    expect(() => inspectHostedSecretBindings(undefined, failedRunner)).toThrow("inspection failed");
  });

  it("does not include secret values in binding-validation errors", () => {
    const secretValue = "do-not-print-this-secret";
    try {
      validateHostedSecretBindings([], "all-in-tournament-trail-staging", ["SQUARE_WEBHOOK_SIGNATURE_KEY"]);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain(secretValue);
    }
  });
});
