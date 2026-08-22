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
});
