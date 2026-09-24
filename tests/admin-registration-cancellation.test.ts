import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const actions = readFileSync("app/admin/registration-review/actions.ts", "utf8");
const controls = readFileSync("components/admin/RegistrationOperationsControls.tsx", "utf8");
const reviewPage = readFileSync("app/admin/registration-review/page.tsx", "utf8");
const history = readFileSync("lib/admin-registration-history.ts", "utf8");
const historyList = readFileSync("components/admin/RegistrationHistoryList.tsx", "utf8");

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
    expect(controls).toContain("Recorded Payment");
    expect(controls).toContain("Original Itemized Charges");
    expect(controls).toContain("Full Recorded Amount Paid");
    expect(controls).toContain("full recorded amount");
    expect(controls).toContain("manually through Chase outside AITT");
    expect(controls).toContain('name="manualRefundStatus"');
    expect(controls).toContain("Active Boat / Registration");
    expect(controls).toContain('name="cancellationNote"');
    expect(controls).toContain("minLength={3}");
    expect(reviewPage).toContain("<CancelRegistrationControl");
    expect(reviewPage).toContain("registrations={allRows.map");
    expect(reviewPage).not.toContain("<CancelRegistrationControl tournamentId={tournamentId}");
  });

  it("keeps cancelled records historical while active consumers use the active filter", () => {
    expect(history).toContain("registration_status");
    expect(history).toContain("cancelled_at");
    expect(history).toContain("admin_notes");
    expect(history).toContain("cancelled_by_admin_id");
    expect(history).toContain("membershipsRevoked");
    expect(readFileSync("lib/tournament-registration-roster.ts", "utf8")).toContain('.eq("registration_status", "active")');
    expect(readFileSync("lib/tournament-collection-summary.ts", "utf8")).toContain('.eq("registration_status", "active")');
    expect(readFileSync("app/admin/registration-review/export/route.ts", "utf8")).toContain("getTournamentRegistrationRoster");
    expect(readFileSync("app/admin/registration-review/print/page.tsx", "utf8")).toContain("getTournamentRegistrationRoster");
  });

  it("closes and resets cancellation only after success, while preserving failures and preventing duplicates", () => {
    expect(controls).toContain("const resetCancellationForm = useCallback(() =>");
    expect(controls).toContain("setOpen(false);");
    expect(controls).toContain('setSelectedId("");');
    expect(controls).toContain("formRef.current?.reset();");
    expect(controls).toContain("if (state.status === \"success\")");
    expect(controls).toContain("resetCancellationForm();");
    expect(controls).toContain("router.refresh();");
    expect(controls).toContain('onClick={resetCancellationForm}');
    expect(controls).toContain("disabled={pending || !selected}");
    expect(controls).toContain("disabled={pending}");
    expect(controls).not.toContain("setOpen(false);\n        setSelectedId(\"\");\n      }");
  });

  it("uses an active-row guard so duplicate submission has no second effect", () => {
    const action = actions.slice(actions.indexOf("export async function cancelRegistrationAction"));
    expect(action).toContain('.eq("registration_status", "active")');
    expect(action).toContain("if (result.error || !result.data)");
  });

  it("does not present canceled history as actively checked in", () => {
    expect(historyList).toContain('row.status === "active" && row.checkedInAt');
    expect(historyList).toContain("historical check-in recorded");
  });
});
