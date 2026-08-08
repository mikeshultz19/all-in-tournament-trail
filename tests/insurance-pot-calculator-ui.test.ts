import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Insurance Pot calculator presentation", () => {
  const calculation = readFileSync("components/admin/InsuranceReviewForm.tsx", "utf8");
  const winners = readFileSync("components/admin/InsuranceResultsPublisher.tsx", "utf8");
  const membersPage = readFileSync("app/admin/members/page.tsx", "utf8");
  const prepareReminder = readFileSync("components/admin/PrepareMembershipReminder.tsx", "utf8");

  it("calculates from one manually entered count", () => {
    expect(calculation).toContain("Insurance Pot Entries");
    expect(calculation).toContain("expectedInsurancePotCents(entryCount)");
    expect(calculation).toContain("getInsurancePotPlaces(entryCount)");
    expect(calculation).toContain("Save Results");
    expect(calculation).toContain("Edit Insurance Pot");
    expect(calculation).toContain("Cancel Editing");
  });

  it("shows the manual eligibility instruction", () => {
    expect(calculation).toContain("Manually determine eligible Insurance Pot winners.");
    expect(calculation).toContain("tournament member list");
    expect(calculation).toContain("beginning with the first team outside the money");
    expect(calculation).toContain("Do not attempt to select Insurance Pot winners automatically.");
    expect(calculation).toContain("Members List →");
  });

  it("renders one manual winner row per calculated place", () => {
    expect(winners).toContain("Array.from({ length: insuranceResult.places_paid }");
    expect(winners).toContain(">Team<input");
    expect(winners).toContain(">Place<input");
    expect(winners).toContain(">Amount<input");
    expect(winners).toContain("Save Results");
    expect(winners).toContain("Edit Results");
    expect(winners).toContain("Cancel Editing");
  });

  it("contains no automatic recipient or participant-list workflow", () => {
    expect(calculation).not.toContain("participantEntryIds");
    expect(calculation).not.toContain("calculateAutomaticInsurancePot");
    expect(winners).not.toContain("calculateAutomaticInsurancePot");
  });

  it("adds a tournament-scoped members list return path", () => {
    expect(membersPage).toContain("Back to Insurance Pot");
    expect(membersPage).toContain("Filtered for");
    expect(membersPage).toContain("returnTo");
  });

  it("persists the Prepare Tournament membership reminder per tournament", () => {
    expect(prepareReminder).toContain("Confirm Tournament Preparation");
    expect(prepareReminder).toContain("Registration review is complete and all entries needing attention are resolved.");
    expect(prepareReminder).toContain("Tournament-morning paper memberships have been added to the AITT Members list.");
    expect(prepareReminder).toContain("Manual confirmation only. This does not create memberships automatically.");
    expect(prepareReminder).toContain("Confirm Tournament Preparation Complete");
    expect(prepareReminder).toContain("paper_membership_reminder_checked");
    expect(prepareReminder).toContain("prepare_registration_review_complete");
  });
});
