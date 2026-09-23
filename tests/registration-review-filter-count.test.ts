import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  formatCheckInsFilterLabel,
  formatNeedsReviewFilterLabel,
} from "@/components/admin/RegistrationRosterToolbar";

const page = readFileSync("app/admin/registration-review/page.tsx", "utf8");
const roster = readFileSync("lib/tournament-registration-roster.ts", "utf8");

describe("Registration Entries review filter count", () => {
  it.each([0, 1, 3])("formats %s outstanding reviews", (count) => {
    expect(formatNeedsReviewFilterLabel(count)).toBe(`Needs Review (${count})`);
  });

  it.each([0, 1, 3])("formats %s pending check-ins", (count) => {
    expect(formatCheckInsFilterLabel(count)).toBe(`CHECK-INS (${count})`);
  });

  it("counts the same active, non-checked-in rows as the Check-Ins filter", () => {
    expect(page).toContain("const checkInCount = allRows.filter((row) => row.checkedInAt == null).length");
    expect(page).toContain("checkInCount={checkInCount}");
    expect(roster).toContain('filter === "check_ins"');
    expect(roster).toContain("rows.filter((row) => row.checkedInAt == null)");
    expect(roster).toContain('.eq("registration_status", "active")');
  });
});
