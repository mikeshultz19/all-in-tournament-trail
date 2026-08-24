import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("compact Tournament Manager workflow", () => {
  const source = readFileSync("components/admin/AdminTournamentDashboard.tsx", "utf8");

  it("keeps every existing operational tool reachable", () => {
    for (const component of [
      "WeighfishCsvUploader",
      "ImportedResultsReview",
      "OnSiteCloseoutCalculator",
      "PublishTournamentForm",
    ]) expect(source).toContain(component);
    expect(readFileSync("app/admin/tournament-manager/photos/page.tsx", "utf8")).toContain("WinnerPhotosForm");
  });

  it("mounts publishing tools once and labels missing tools honestly", () => {
    expect(source).toContain("Ready to Publish");
    expect(source).toContain("Final Website Check");
    expect(source).toContain("Edit Results");
    expect(source).toContain("Preview Website");
    expect(source).toContain("Winner Photos");
  });

  it("separates the calculator from the post-event publisher", () => {
    expect(readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8")).toContain("APPROVE PAYOUTS");
    expect(readFileSync("lib/tournament-workflow-state.ts", "utf8")).toContain("Review every tournament payout before approving the closeout.");
  });

  it("shows one continuous payout report without payout tabs", () => {
    expect(readFileSync("components/admin/OnSiteCloseoutCalculator.tsx", "utf8")).toContain("Verified Results");
    expect(source).not.toContain('aria-label="Payout tools"');
    expect(source).not.toContain('["Base", "Bronze", "Silver", "Gold", "Big Bass"]');
  });

  it("uses operator-focused payout report terminology", () => {
    const report = readFileSync("components/admin/TournamentPayoutReport.tsx", "utf8");
    expect(report).toContain("Tournament Payout Summary");
    expect(report).toContain("Checks To Write");
    expect(report).toContain("Total Checks");
    expect(report).toContain('return "Tournament"');
  });

  it("uses five lifecycle stages without the old card stack", () => {
    const resolver = readFileSync("lib/tournament-workflow-state.ts", "utf8");
    for (const stage of ["Prepare Tournament", "Import Results", "Payout Summary", "Publish Results", "Calculate AOY"]) expect(resolver).toContain(stage);
    expect(source).not.toContain("TournamentOperationCard");
    expect(source).not.toContain("TournamentProgress");
    expect(source).not.toContain("CurrentTournamentCard");
  });

  it("persists the prepare reminder on the tournaments table", () => {
    const migration = readFileSync("supabase/migrations/202608030001_add_tournament_prepare_membership_reminder.sql", "utf8");
    expect(migration).toContain("paper_membership_reminder_checked");
    expect(migration).toContain("not null default false");
    const confirmationMigration = readFileSync("supabase/migrations/202608030002_add_tournament_prepare_confirmation.sql", "utf8");
    expect(confirmationMigration).toContain("prepare_registration_review_complete");
    expect(confirmationMigration).toContain("not null default false");
  });

  it("keeps the requested workflow step open after navigation", () => {
    const page = readFileSync("app/admin/tournament-manager/page.tsx", "utf8");
    expect(page).toContain("initialExpandedStage={requestedStep}");
    for (const route of [
      "app/admin/tournament-manager/import/page.tsx",
      "app/admin/tournament-manager/closeout/page.tsx",
      "app/admin/tournament-manager/insurance/page.tsx",
      "app/admin/tournament-manager/photos/page.tsx",
      "app/admin/tournament-manager/publish/page.tsx",
    ]) expect(readFileSync(route, "utf8")).toContain("/admin/tournament-manager?tournament=");
  });

  it("persists the exact selected tournament ID for reset reloads", () => {
    const dashboard = readFileSync("components/admin/AdminTournamentDashboard.tsx", "utf8");
    const page = readFileSync("app/admin/tournament-manager/page.tsx", "utf8");
    expect(dashboard).toContain('url.searchParams.set("tournament", tournament.id)');
    expect(dashboard).toContain('window.history.replaceState(window.history.state, "", url)');
    expect(page).toContain("key={currentTournament?.id}");
  });

  it("loads current AOY evidence through service-readable tables", () => {
    const evidence = readFileSync("lib/tournament-workflow-evidence.ts", "utf8");
    expect(evidence).toContain('from("aoy_current_projections")');
    expect(evidence).not.toContain('from("current_aoy_performances")');
    expect(evidence).toContain("Tournament workflow evidence query failed.");
  });

  it("uses one honest AOY unavailable notice", () => {
    expect(source).toContain("AOY management tools are not implemented yet.");
    expect(source).not.toContain("AOY management tools are not available yet.");
  });
});
