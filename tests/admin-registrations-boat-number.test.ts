import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("app/admin/registrations/page.tsx", "utf8");
const list = readFileSync("components/admin/RegistrationHistoryList.tsx", "utf8");

describe("Admin All Registrations compact list", () => {
  it("renders boat and registered fields in the collapsed row view", () => {
    expect(page).toContain("RegistrationHistoryList rows={rows}");
    expect(list).toContain("Boat #");
    expect(list).toContain("Registered");
    expect(list).toContain('row.boatNumber?.toString() ?? "—"');
    expect(list).toContain('dateOnly(row.registeredAt)');
    expect(list).toContain("ChevronDown");
  });
});
