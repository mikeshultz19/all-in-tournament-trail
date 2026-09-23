import { describe, expect, it } from "vitest";
import { formatNeedsReviewFilterLabel } from "@/components/admin/RegistrationRosterToolbar";

describe("Registration Entries review filter count", () => {
  it.each([0, 1, 3])("formats %s outstanding reviews", (count) => {
    expect(formatNeedsReviewFilterLabel(count)).toBe(`Needs Review (${count})`);
  });
});
