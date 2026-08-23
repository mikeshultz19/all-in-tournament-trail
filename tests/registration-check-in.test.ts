import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Early Entries check-in", () => {
  it("uses additive persisted registration fields that can be cleared", () => {
    const migration = readFileSync("supabase/migrations/202608090003_add_registration_check_in.sql", "utf8");
    expect(migration).toContain("add column if not exists checked_in_at timestamptz");
    expect(migration).toContain("add column if not exists checked_in_by_admin_id uuid");
    expect(migration).toContain("(checked_in_at is null) = (checked_in_by_admin_id is null)");
    expect(migration).not.toMatch(/delete from|drop table|drop column/i);
  });

  it("updates only the exact persisted registration check-in fields", () => {
    const action = readFileSync("app/admin/tournament-manager/prepare/check-in-actions.ts", "utf8");
    expect(action).toContain("await requireAdminUser()");
    expect(action).toContain("checked_in_at: checkedIn ? new Date().toISOString() : null");
    expect(action).toContain("checked_in_by_admin_id: checkedIn ? admin.id : null");
    expect(action).toContain('.eq("id", registrationId)');
    expect(action).toContain('.eq("tournament_id", tournamentId)');
    expect(action).not.toContain("payment_reference");
    expect(action).toContain('.neq("identity_review_status", "review_required")');
    expect(action).not.toMatch(/identity_review_status:\s*/);
  });

  it("shows persisted check-in and undo controls on the unified operational roster", () => {
    const control = readFileSync("components/admin/RegistrationCheckInControl.tsx", "utf8");
    const page = readFileSync("app/admin/registration-review/page.tsx", "utf8");
    const legacyRoute = readFileSync("app/admin/tournament-manager/prepare/page.tsx", "utf8");
    expect(control).toContain("✓ Checked In");
    expect(control).toContain("Edit / Reopen");
    expect(control).toContain("Check In");
    expect(control).toContain("router.refresh()");
    expect(control).toContain("window.confirm");
    expect(page).toContain("Registration &amp; Check-In");
    expect(page).toContain("Member Status");
    expect(page).toContain("Member Pots");
    expect(page).toContain("Insurance");
    expect(page).toContain("Big Bass");
    expect(page).toContain("Check-In / Review");
    expect(page).not.toContain("Entry Options");
    expect(page).toContain('data-testid="mobile-registration-roster"');
    expect(legacyRoute).toContain("redirect(`/admin/registration-review${query}`)");
  });

  it("points print and CSV actions at the authoritative Registration Review exports", () => {
    const page = readFileSync("app/admin/registration-review/page.tsx", "utf8");
    const dashboard = readFileSync("components/admin/AdminTournamentDashboard.tsx", "utf8");
    expect(page).toContain("/admin/registration-review/print?${queryBase}");
    expect(page).toContain("/admin/registration-review/export?${queryBase}");
    expect(page).toContain("Download CSV");
    expect(page).not.toContain("Export for WeighFish");
    expect(dashboard).not.toContain("Export for WeighFish");
  });
});
