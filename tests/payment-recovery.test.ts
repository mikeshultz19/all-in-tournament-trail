import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("payment recovery visibility", () => {
  it("has a private service-role query for reconciliation-required attempts", () => {
    const source = fs.readFileSync("lib/admin-payment-recovery.ts", "utf8");
    expect(source).toContain('from("online_registration_payment_attempts")');
    expect(source).toContain('.eq("state", "reconciliation_required")');
    expect(source).toContain('admin_recover_stale_online_payment_attempts');
  });

  it("exposes the recovery queue in Admin navigation and warns against recharging", () => {
    const sidebar = fs.readFileSync("components/admin/AdminSidebar.tsx", "utf8");
    const page = fs.readFileSync("app/admin/payment-recovery/page.tsx", "utf8");
    expect(sidebar).toContain('href: "/admin/payment-recovery"');
    expect(page).toContain("never ask the customer to pay again");
    expect(page).toContain("Manual review required");
  });

  it("shows pending manual collections as an informational-only list", () => {
    const page = fs.readFileSync("app/admin/payment-recovery/page.tsx", "utf8");
    const source = fs.readFileSync("lib/admin-payment-recovery.ts", "utf8");
    expect(page).toContain("Manual Membership Follow-Up");
    expect(page).toContain("running, non-interactive list records membership reviews");
    expect(page).toContain("No automatic payment action");
    expect(page).not.toContain("MARK COLLECTED");
    expect(source).toContain("MEMBERSHIP_CONFIRMATION_MARKER");
    expect(source).toContain('? "confirmed" : "needs_attention"');
  });
});
