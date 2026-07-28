import { describe, expect, it } from "vitest";

import {
  getTournamentOperationSteps,
  getTournamentRegistrationStatus,
} from "@/lib/admin-tournament-operations";
import { renderAdminDashboardFixture } from "@/tests/admin-dashboard-fixture";
import { databaseTournament } from "@/tests/tournament-db-fixture";

describe("Tournament Operations Dashboard", () => {
  const markup = renderAdminDashboardFixture();

  it("shows the operational tournament header", () => {
    expect(markup).toContain("Tournament Operations");
    expect(markup).toContain("Lake Fork Open");
    expect(markup).toContain("Sunday, August 16, 2026");
    expect(markup).toContain("Registration Status");
    expect(markup).toContain("Overall Tournament Status");
    expect(markup).toContain("Registration Open");
    expect(markup).toContain("Last Updated");
    expect(markup).toContain("Updated By");
  });

  it("shows the three-step lifecycle and one recommended next step", () => {
    expect(markup).toContain("Tournament Progress");
    expect(markup).toContain("Prepare Tournament");
    expect(markup).toContain("Registration Finalization");
    expect(markup).toContain("Tournament Closeout");
    expect(markup.match(/Recommended Next/g) ?? []).toHaveLength(1);
    expect(markup).toContain('aria-current="step"');
  });

  it("shows every required operational checklist item", () => {
    for (const item of [
      "Tournament Information Complete",
      "Registration Information Complete",
      "Launch Ramp Complete",
      "Practice Information Complete",
      "Website Published",
      "Registration Closed",
      "Copy registrations to WeighFish",
      "Verify tournament morning registrations entered",
      "Verify final tournament field",
      "Import WeighFish CSV",
      "Enter Insurance Pot Amount",
      "Upload Winner Photo",
      "Upload Big Bass Photo",
      "Publish Results",
      "Update Membership Standings",
      "Publish AOY",
      "Tournament Complete",
    ]) {
      expect(markup).toContain(item);
    }
  });

  it("shows the three primary workflow actions", () => {
    expect(markup).toContain("Continue Tournament Setup");
    expect(markup).toContain("Finalize Registration");
    expect(markup).toContain("Complete Tournament");
    expect(markup).toContain(
      'href="/admin/tournament?tournament=lake-fork-open-2026"',
    );
    expect(markup).toContain(
      'href="/admin/tournament-manager?tournament=lake-fork-open-2026"',
    );
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
