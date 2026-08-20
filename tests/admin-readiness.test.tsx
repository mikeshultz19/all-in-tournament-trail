import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import {
  getTournamentOperationSteps,
  getTournamentRegistrationStatus,
} from "@/lib/admin-tournament-operations";
import {
  renderAdminDashboardFixture,
  renderImportDashboardFixture,
  renderLockedImportDashboardFixture,
  renderLockedImportedDashboardFixture,
  renderImportedDashboardFixture,
  renderPayoutReadyDashboardFixture,
  renderPublishReadyDashboardFixture,
  renderStaleImportMetadataDashboardFixture,
  renderStaleOfficialLockDashboardFixture,
} from "@/tests/admin-dashboard-fixture";
import { databaseTournament } from "@/tests/tournament-db-fixture";

describe("Tournament Operations Dashboard", () => {
  const markup = renderAdminDashboardFixture();

  it("shows the operational tournament header", () => {
    expect(markup).toContain("Tournament Manager");
    expect(markup).toContain("Current Tournament");
    expect(markup).toContain("Lake Fork Open");
    expect(markup).toContain("workflow steps complete");
    expect(markup).toContain("Change Tournament");
  });

  it("shows the compact six-stage lifecycle", () => {
    expect(markup).toContain("Prepare Tournament");
    expect(markup).toContain("Import Results");
    expect(markup).toContain("Insurance Pot");
    expect(markup).toContain("Generate Checks");
    expect(markup).toContain("Publish Results");
    expect(markup).toContain("Calculate AOY");
    expect(markup.match(/aria-expanded="true"/g) ?? []).toHaveLength(1);
  });

  it("opens the first incomplete stage with tournament preparation actions", () => {
    expect(markup).toContain("Registration &amp; Check-In");
    expect(markup).toContain("Open Registration &amp; Check-In");
    expect(markup).toContain('href="/admin/registration-review?tournament=11111111-1111-4111-8111-111111111111"');
  });

  it("keeps the existing results editor in the publishing workflow", () => {
    expect(markup).not.toContain("More Options");
    expect(markup).not.toContain("Tournament Conditions");
    expect(markup).toContain("Publish Results");
  });

  it("shows every publishing workspace when prerequisites are complete", () => {
    const readyMarkup = renderPublishReadyDashboardFixture();
    for (const label of [
      "Publish Results",
      "Final Website Check",
      "Winner Photos",
      "Preview Website",
    ]) {
      expect(readyMarkup).toContain(label);
    }
    expect(readyMarkup).toContain("Everything is complete. Publish the tournament to the website.");
  });

  it("shows the real CSV chooser directly in Import Results after preparation is confirmed", () => {
    const importMarkup = renderImportDashboardFixture();
    expect(importMarkup).toContain("Import WeighFish CSV");
    expect(importMarkup).toContain("Choose WeighFish CSV");
    expect(importMarkup).toContain('accept=".csv,text/csv"');
    expect(importMarkup).not.toContain("Complete Tournament Preparation before importing results.");
  });

  it("locks Import Results until tournament preparation is complete", () => {
    const lockedMarkup = renderLockedImportDashboardFixture();
    expect(lockedMarkup).toContain("Complete Tournament Preparation before importing results.");
    expect(lockedMarkup).toContain("Registration &amp; Check-In");
    expect(lockedMarkup).toContain("Members List");
    expect(lockedMarkup).not.toContain("Choose WeighFish CSV");
  });

  it("shows an existing imported result set even when preparation later becomes incomplete", () => {
    const importedMarkup = renderLockedImportedDashboardFixture();
    expect(importedMarkup).toContain("Results Verified");
    expect(importedMarkup).toContain("Reset Import");
    expect(importedMarkup).not.toContain("Complete Tournament Preparation before importing results.");
    expect(importedMarkup).not.toContain("Choose WeighFish CSV");
  });

  it("does not render an empty review from stale import metadata", () => {
    const staleMarkup = renderStaleImportMetadataDashboardFixture();
    expect(staleMarkup).toContain("Choose WeighFish CSV");
    expect(staleMarkup).not.toContain("Review Imported Results");
    expect(staleMarkup).not.toContain("Verify Against WeighFish");
    expect(staleMarkup).not.toContain("Verify Imported Results");
    expect(staleMarkup).not.toContain("Reset Import");
  });

  it("offers an authorized start-over action for stale official state", () => {
    const staleOfficialMarkup = renderStaleOfficialLockDashboardFixture();
    expect(staleOfficialMarkup).toContain("Choose WeighFish CSV");
    expect(staleOfficialMarkup).toContain("Reset Tournament Results and Start Over");
    expect(staleOfficialMarkup).toContain("no imported result rows or publication record");
  });

  it("shows reset and verification actions after an import", () => {
    const importedMarkup = renderImportedDashboardFixture(false);
    expect(importedMarkup).toContain("Reset Import");
    expect(importedMarkup).toContain("Verify Imported Results");
    expect(importedMarkup).not.toContain("Choose WeighFish CSV");
  });

  it("keeps reset visible after imported results are verified", () => {
    const verifiedMarkup = renderImportedDashboardFixture(true);
    expect(verifiedMarkup).toContain("Results Verified");
    expect(verifiedMarkup).toContain("Reset Import");
    expect(verifiedMarkup).not.toContain("Verify Imported Results");
  });

  it("shows the generated ordered payout list after verification", () => {
    const payoutMarkup = renderPayoutReadyDashboardFixture();
    for (const label of [
      "Checks to Write",
      "Base Tournament",
      "Bronze Pot",
      "Silver Pot",
      "Gold Pot",
      "Big Bass — 1st Place",
      "Big Bass — 2nd Place",
      "Insurance Pot",
      "Complete Tournament",
    ]) {
      expect(payoutMarkup).toContain(label);
    }
    expect(payoutMarkup).not.toContain("Reconciliation");
    expect(payoutMarkup).toContain("Checks Generated");
  });

  it("keeps unrelated modules off the operations dashboard", () => {
    expect(markup).not.toContain("Latest News &amp; Announcements");
    expect(markup).not.toContain("Sponsors");
    expect(markup).not.toContain("Website Readiness");
  });
});

describe("Tournament operations status", () => {
  it("closes registration automatically at the configured deadline", () => {
    expect(
      getTournamentRegistrationStatus(
        databaseTournament,
        new Date("2026-11-01T00:00:00-05:00"),
      ),
    ).toBe("Closed");
  });

  it("advances to registration finalization after registration closes", () => {
    const steps = getTournamentOperationSteps(
      {
        ...databaseTournament,
        status: "Registration Closed",
        weighfish_imported: false,
      },
      new Date("2026-10-31T22:00:00-05:00"),
    );

    expect(steps.map((step) => step.state)).toEqual([
      "completed",
      "current",
      "upcoming",
    ]);
  });

  it("advances to closeout after a WeighFish import", () => {
    const steps = getTournamentOperationSteps(
      {
        ...databaseTournament,
        status: "Tournament Day",
        weighfish_imported: true,
        weighfish_imported_at: "2026-11-01T18:00:00Z",
      },
      new Date("2026-11-01T18:00:00Z"),
    );

    expect(steps.map((step) => step.state)).toEqual([
      "completed",
      "completed",
      "current",
    ]);
  });

  it("does not invent completion for unimplemented AOY operations", () => {
    const closeout = getTournamentOperationSteps(
      {
        ...databaseTournament,
        status: "Results Published",
        weighfish_imported: true,
      },
      new Date("2026-11-02T12:00:00Z"),
    )[2];

    expect(
      closeout.items.find((item) => item.label === "Publish AOY")?.status,
    ).toBe("not_available");
    expect(
      closeout.items.find(
        (item) => item.label === "Update Membership Standings",
      )?.status,
    ).toBe("not_available");
  });
});
