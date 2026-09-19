import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const actions = readFileSync("app/admin/registration-review/actions.ts", "utf8");
const controls = readFileSync("components/admin/RegistrationOperationsControls.tsx", "utf8");
const reviewPage = readFileSync("app/admin/registration-review/page.tsx", "utf8");
const history = readFileSync("lib/admin-registration-history.ts", "utf8");

describe("manual registration cancellation", () => {
  it("is an admin-only, note-required status transition with no payment or email side effect", () => {
    const action = actions.slice(actions.indexOf("export async function cancelRegistrationAction"));
    expect(action).toContain("requireAdminUser()");
    expect(action).toContain('text(formData, "cancellationNote")');
    expect(action).toContain('registration_status: "cancelled"');
    expect(action).toContain("cancelled_at");
    expect(action).toContain("cancelled_by_admin_id: admin.id");
    expect(action).toContain("admin_notes: adminNotes");
    expect(action).not.toContain("square");
    expect(action).not.toContain("deliverRegistrationConfirmationEmails");
  });

  it("shows the required compact confirmation details in Registration Review", () => {
    expect(controls).toContain("Cancel Registration");
    expect(controls).toContain("Registration Number");
    expect(controls).toContain("Participants");
    expect(controls).toContain("Recorded Amount");
    expect(controls).toContain("AITT does not issue the refund. Handle any refund separately before confirming cancellation.");
    expect(controls).toContain('name="cancellationNote"');
    expect(controls).toContain("minLength={3}");
    expect(reviewPage).toContain("<CancelRegistrationControl");
  });

  it("keeps cancelled records historical while active consumers use the active filter", () => {
    expect(history).toContain("registration_status");
    expect(history).toContain("cancelled_at");
    expect(history).toContain("admin_notes");
    expect(readFileSync("lib/tournament-registration-roster.ts", "utf8")).toContain('.eq("registration_status", "active")');
    expect(readFileSync("lib/tournament-collection-summary.ts", "utf8")).toContain('.eq("registration_status", "active")');
    expect(readFileSync("app/admin/registration-review/export/route.ts", "utf8")).toContain("getTournamentRegistrationRoster");
    expect(readFileSync("app/admin/registration-review/print/page.tsx", "utf8")).toContain("getTournamentRegistrationRoster");
  });

  it("uses an active-row guard so duplicate submission has no second effect", () => {
    const action = actions.slice(actions.indexOf("export async function cancelRegistrationAction"));
    expect(action).toContain('.eq("registration_status", "active")');
    expect(action).toContain("if (result.error || !result.data)");
  });
});
