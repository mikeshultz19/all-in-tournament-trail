import { describe, expect, it } from "vitest";

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
});
