import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("payment recovery visibility", () => {
  it("has a private service-role query for reconciliation-required attempts", () => {
    const source = fs.readFileSync("lib/admin-payment-recovery.ts", "utf8");
    expect(source).toContain('from("online_registration_payment_attempts")');
    expect(source).toContain('.eq("state", "reconciliation_required")');
  });

  it("exposes the recovery queue in Admin navigation and warns against recharging", () => {
    const sidebar = fs.readFileSync("components/admin/AdminSidebar.tsx", "utf8");
    const page = fs.readFileSync("app/admin/payment-recovery/page.tsx", "utf8");
    expect(sidebar).toContain('href: "/admin/payment-recovery"');
    expect(page).toContain("never ask the customer to pay again");
    expect(page).toContain("Manual review required");
  });
});
