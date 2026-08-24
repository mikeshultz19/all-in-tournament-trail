import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { getMatchedByLabel } from "@/components/admin/RegistrationContactReviewForm";

const form = readFileSync(
  "components/admin/RegistrationContactReviewForm.tsx",
  "utf8",
);
const page = readFileSync("app/admin/registration-review/page.tsx", "utf8");

describe("registration contact review card", () => {
  it("shows Matched by: Email for email-only matches", () => {
    expect(getMatchedByLabel("Submitted email is already associated with Joe Johnson.")).toBe("Email");
  });

  it("shows Matched by: Phone for phone-only matches", () => {
    expect(getMatchedByLabel("Submitted phone is already associated with Joe Johnson.")).toBe("Phone");
  });

  it("shows Matched by: Email and Phone when both match", () => {
    expect(getMatchedByLabel("Submitted email and phone are associated with different existing anglers.")).toBe("Email and Phone");
  });

  it("keeps the differences and review buttons unchanged with Matched by near the top", () => {
    expect(form.indexOf("Matched by:")).toBeGreaterThan(-1);
    expect(form.indexOf("Matched by:")).toBeLessThan(form.indexOf("Differences:"));
    expect(form).toContain("View differences");
    expect(form).toContain("Existing Member");
    expect(form).toContain("Registration Submission");
    expect(form).toContain("SAME PERSON — UPDATE INFO");
    expect(form).toContain("SAME PERSON — KEEP EXISTING INFO");
    expect(form).toContain("DIFFERENT PERSON — APPROVE NEW MEMBER");
    expect(page).toContain("reviewReason={review.reason}");
  });
});
