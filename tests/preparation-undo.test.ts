import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Tournament preparation undo", () => {
  it("clears only the two saved preparation confirmations", () => {
    const action = readFileSync("app/admin/tournament-manager/prepare/actions.ts", "utf8");
    expect(action).toContain('formData.get("intent") === "undo"');
    expect(action).toContain("getPreparationUndoProtection(tournamentId)");
    expect(action).toContain("prepare_registration_review_complete: false");
    expect(action).toContain("paper_membership_reminder_checked: false");
    expect(action).toContain("if (!registrationReviewComplete || !paperMembershipsConfirmed)");
    expect(action).not.toMatch(/\.delete\(|resetImportedResults|resetInsurance|resetPayout/i);
  });

  it("fails closed when any later workflow evidence exists", () => {
    const protection = readFileSync("lib/tournament-preparation-protection.ts", "utf8");
    for (const table of [
      "tournament_result_entries",
      "tournament_insurance_pot_results",
      "on_site_tournament_closeouts",
      "official_results_publication_audit",
      "aoy_tournament_performances",
    ]) expect(protection).toContain(table);
    expect(protection).toContain("if (error)");
    expect(protection).toContain("blocked: true");
  });

  it("requires confirmation and restores editable incomplete state", () => {
    const component = readFileSync("components/admin/PrepareMembershipReminder.tsx", "utf8");
    expect(component).toContain("Uncheck &amp; Save");
    expect(component).toContain("Confirm Uncheck & Save");
    expect(component).toContain("Cannot uncheck preparation yet. Undo the later tournament steps first before changing these confirmations.");
    expect(component).toContain("setRegistrationReviewComplete(false)");
    expect(component).toContain("setPaperMembershipsConfirmed(false)");
    expect(component).toContain("disabled={pending || savedComplete}");
    expect(component).toContain('name="intent" value="confirm"');
    expect(component).toContain('name="intent" value="undo"');
  });

  it("shows downstream undo protection only after an attempted protected undo", () => {
    const component = readFileSync("components/admin/PrepareMembershipReminder.tsx", "utf8");
    expect(component).toContain("const [showingUndoProtection, setShowingUndoProtection] = useState(false)");
    expect(component).toContain("onClick={() => setShowingUndoProtection(true)}");
    expect(component).toContain("{showingUndoProtection ? (");
    expect(component).toContain("onClick={() => setShowingUndoProtection(false)}");
    expect(component).not.toContain("type=\"button\" disabled className={adminButtonStyles(\"ghost\"");
  });

  it("applies successful action state directly and resets state between tournaments", () => {
    const component = readFileSync("components/admin/PrepareMembershipReminder.tsx", "utf8");
    expect(component).toContain("await savePrepareMembershipReminderAction(");
    expect(component).toContain('nextState.status === "success"');
    expect(component).toContain("setSavedComplete(nextState.savedComplete)");
    expect(component).toContain("key={props.tournamentId}");
    expect(component).not.toContain("useEffect");
  });

  it("lists all actual downstream blockers", () => {
    const protection = readFileSync("lib/tournament-preparation-protection.ts", "utf8");
    expect(protection).toContain("const blockers = labels.filter");
    expect(protection).toContain('blockers.join(", ")');
  });
});
