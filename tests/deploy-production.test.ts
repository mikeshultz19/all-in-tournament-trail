import { describe, expect, it, vi } from "vitest";

import {
  constructChildEnvironment,
  executeProductionDeployment,
  PRODUCTION_PROJECT_REF,
  STAGING_PROJECT_REF,
} from "../scripts/deploy-production.mjs";

const productionValues = {
  NEXT_PUBLIC_SUPABASE_URL: `https://${PRODUCTION_PROJECT_REF}.supabase.co`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "production-public-key-present",
  SUPABASE_URL: `https://${PRODUCTION_PROJECT_REF}.supabase.co`,
  SUPABASE_SERVICE_ROLE_KEY: "production-service-key-present",
  NEXT_PUBLIC_SQUARE_APPLICATION_ID: "production-square-application-id",
  NEXT_PUBLIC_SQUARE_LOCATION_ID: "production-square-location-id",
  SQUARE_ENVIRONMENT: "production",
  SQUARE_ACCESS_TOKEN: "production-square-token",
  SQUARE_WEBHOOK_SIGNATURE_KEY: "production-square-webhook-key",
  SQUARE_WEBHOOK_NOTIFICATION_URL: "https://allintrail.com/api/webhooks/square",
  RESEND_API_KEY: "production-resend-key",
  AITT_EMAIL_ENVIRONMENT: "production",
};

describe("production deployment safety", () => {
  it("overrides inherited staging Supabase configuration", () => {
    const environment = constructChildEnvironment(
      {
        NEXT_PUBLIC_SUPABASE_URL: `https://${STAGING_PROJECT_REF}.supabase.co`,
        SUPABASE_URL: `https://${STAGING_PROJECT_REF}.supabase.co`,
      },
      productionValues,
    );

    expect(environment.NEXT_PUBLIC_SUPABASE_URL).toContain(PRODUCTION_PROJECT_REF);
    expect(environment.SUPABASE_URL).toContain(PRODUCTION_PROJECT_REF);
  });

  it("refuses staging before OpenNext can start", () => {
    const runner = vi.fn();
    const stagingEnvironment = {
      ...productionValues,
      NEXT_PUBLIC_SUPABASE_URL: `https://${STAGING_PROJECT_REF}.supabase.co`,
      SUPABASE_URL: `https://${STAGING_PROJECT_REF}.supabase.co`,
    };

    expect(() =>
      executeProductionDeployment({
        environment: stagingEnvironment,
        projectRoot: process.cwd(),
        runner,
      }),
    ).toThrowError(
      "REFUSING PRODUCTION DEPLOYMENT: staging Supabase configuration detected.",
    );
    expect(runner).not.toHaveBeenCalled();
  });

  it("runs build before deploy only after production validation", () => {
    const runner = vi.fn();

    executeProductionDeployment({
      environment: productionValues,
      projectRoot: process.cwd(),
      runner,
    });

    expect(runner.mock.calls.map(([command]) => command)).toEqual([
      "build",
      "deploy",
    ]);
  });

  it("supports a validated build-only verification without deploying", () => {
    const runner = vi.fn();

    executeProductionDeployment({
      environment: productionValues,
      projectRoot: process.cwd(),
      buildOnly: true,
      runner,
    });

    expect(runner).toHaveBeenCalledOnce();
    expect(runner).toHaveBeenCalledWith(
      "build",
      productionValues,
      process.cwd(),
    );
  });

  it("rejects sandbox Square or email settings before a build", () => {
    const runner = vi.fn();

    expect(() => executeProductionDeployment({
      environment: { ...productionValues, SQUARE_ENVIRONMENT: "sandbox" },
      projectRoot: process.cwd(),
      runner,
    })).toThrowError("Square production environment is required.");
    expect(runner).not.toHaveBeenCalled();
  });

  it("rejects sandbox Square application IDs before a build", () => {
    const runner = vi.fn();

    expect(() => executeProductionDeployment({
      environment: { ...productionValues, NEXT_PUBLIC_SQUARE_APPLICATION_ID: "sandbox-sq0idb-example" },
      projectRoot: process.cwd(),
      runner,
    })).toThrowError("sandbox Square application ID detected.");
    expect(runner).not.toHaveBeenCalled();
  });

  it("rejects a non-production webhook before a build", () => {
    const runner = vi.fn();

    expect(() => executeProductionDeployment({
      environment: { ...productionValues, SQUARE_WEBHOOK_NOTIFICATION_URL: "https://staging.example.com/api/webhooks/square" },
      projectRoot: process.cwd(),
      runner,
    })).toThrowError("Square webhook must target the production app.");
    expect(runner).not.toHaveBeenCalled();
  });
});
