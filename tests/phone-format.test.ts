import { describe, expect, it } from "vitest";

import { formatPhoneInput } from "@/lib/phone-format";

describe("phone input formatting", () => {
  it("formats a standard ten-digit number for readability", () => {
    expect(formatPhoneInput("8178419120")).toBe("(817) 841-9120");
    expect(formatPhoneInput("817-841-9120")).toBe("(817) 841-9120");
  });

  it("formats partial input without changing the underlying digits", () => {
    expect(formatPhoneInput("817")).toBe("(817");
    expect(formatPhoneInput("817841")).toBe("(817) 841");
  });

  it("leaves longer international-style values untouched", () => {
    expect(formatPhoneInput("+441234567890")).toBe("+441234567890");
  });
});
