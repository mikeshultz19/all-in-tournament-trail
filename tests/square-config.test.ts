import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { getSquareConfigurationStatus } from "@/lib/square";

describe("Square configuration boundary", () => {
  it("fails safely when configuration is missing", () => {
    expect(getSquareConfigurationStatus({ SQUARE_ENVIRONMENT: "sandbox" })).toEqual({
      status: "unavailable",
      reason: "missing_configuration",
    });
  });

  it("rejects mixed or unknown environment names", () => {
    expect(getSquareConfigurationStatus({ SQUARE_ENVIRONMENT: "live" })).toEqual({
      status: "unavailable",
      reason: "invalid_environment",
    });
  });

  it("reports only non-sensitive configuration status", () => {
    expect(getSquareConfigurationStatus({
      SQUARE_ENVIRONMENT: "production",
      NEXT_PUBLIC_SQUARE_APPLICATION_ID: "app-id",
      NEXT_PUBLIC_SQUARE_LOCATION_ID: "location-id",
      SQUARE_ACCESS_TOKEN: "secret-token",
    })).toEqual({ status: "configured", environment: "production" });
  });

  it("reports Sandbox checkout as configured when runtime bindings are present", () => {
    expect(getSquareConfigurationStatus({
      SQUARE_ENVIRONMENT: "sandbox",
      NEXT_PUBLIC_SQUARE_APPLICATION_ID: "sandbox-app",
      NEXT_PUBLIC_SQUARE_LOCATION_ID: "sandbox-location",
      SQUARE_ACCESS_TOKEN: "sandbox-secret",
    })).toEqual({ status: "configured", environment: "sandbox" });
  });

  it.each(["NEXT_PUBLIC_SQUARE_APPLICATION_ID", "NEXT_PUBLIC_SQUARE_LOCATION_ID"])("fails when the %s runtime binding is absent", (name) => {
    const environment = {
      SQUARE_ENVIRONMENT: "sandbox",
      NEXT_PUBLIC_SQUARE_APPLICATION_ID: "sandbox-app",
      NEXT_PUBLIC_SQUARE_LOCATION_ID: "sandbox-location",
      SQUARE_ACCESS_TOKEN: "sandbox-secret",
      [name]: "",
    };
    expect(getSquareConfigurationStatus(environment)).toEqual({ status: "unavailable", reason: "missing_configuration" });
  });

  it("checks configuration before creating a payment attempt", () => {
    const quoteSource = readFileSync("app/api/registrations/quote/route.ts", "utf8");
    expect(quoteSource.indexOf("const square = getSquareConfigurationStatus();")).toBeLessThan(quoteSource.indexOf("const paymentAttemptId = await createOnlinePaymentAttempt"));
  });
});
