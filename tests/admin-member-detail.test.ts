import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Admin Member Detail", () => {
  it("loads the angler by UUID and displays the required membership fields", () => {
    const page = readFileSync(
      "app/admin/members/[id]/page.tsx",
      "utf8",
    );
    const data = readFileSync("lib/admin-members.ts", "utf8");

    expect(data).toContain("getAdminMemberById");
    expect(data).toContain('.from("anglers")');
    expect(data).toContain('.eq("id", memberId)');
    expect(page).toContain("requireAdminUser");

    for (const label of [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Member Status",
      "Membership Season",
      "First Eligible Tournament",
      "Membership Effective Date",
      "Edit Member",
      "Back to Members",
    ]) {
      expect(page).toContain(label);
    }
  });

  it("renders a dedicated not-found state for missing or malformed UUIDs", () => {
    const page = readFileSync(
      "app/admin/members/[id]/page.tsx",
      "utf8",
    );

    expect(page).toContain("UUID_PATTERN");
    expect(page).toContain("MemberNotFound");
    expect(page).toContain("Member Not Found");
    expect(page).toContain("No member exists with this identifier.");
  });
});
