import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WebsiteReadiness from "@/components/admin/WebsiteReadiness";
import { renderAdminDashboardFixture } from "@/tests/admin-dashboard-fixture";

const completePreTournamentItems = [
  { label: "Tournament Information Updated", complete: true },
] as const;

const incompletePostTournamentItems = [
  {
    label: "Publish Tournament Results",
    complete: false,
    href: "/admin/results",
  },
] as const;

describe("Admin dashboard readiness", () => {
  const markup = renderAdminDashboardFixture();

  it("shows setup readiness without duplicating the lifecycle status", () => {
    expect(markup).toContain("Website Readiness");
    expect(markup).toContain("Tournament Setup Incomplete");
    expect(markup).toContain(
      'aria-label="Status: Tournament Setup Incomplete"',
    );
    expect(markup.match(/Tournament Status/g) ?? []).toHaveLength(0);
  });

  it("shows distinct before and after tournament workflows", () => {
    expect(markup).toContain("Before the Tournament");
    expect(markup).toContain(
      "Complete these items before tournament day.",
    );
    expect(markup).toContain("After the Tournament");
    expect(markup).toContain(
      "Complete these items after weigh-in before publishing the official results.",
    );
    expect(markup).toContain("Conditions Updated");
    expect(markup).toContain("Upload Tournament Winner Photo");
    expect(markup).toContain("Upload Big Bass Winner Photo");
  });

  it("calculates setup completion from pre-tournament items only", () => {
    const readyMarkup = renderToStaticMarkup(
      <WebsiteReadiness
        preTournamentItems={completePreTournamentItems}
        postTournamentItems={incompletePostTournamentItems}
      />,
    );

    expect(readyMarkup).toContain("Tournament Setup Complete");
    expect(readyMarkup).toContain(
      'aria-label="Status: Tournament Setup Complete"',
    );
    expect(readyMarkup).toContain("Upcoming");
    expect(readyMarkup).not.toContain("Tournament Setup Incomplete");
  });

  it("links incomplete workflow items to their management sections", () => {
    expect(markup).toMatch(
      /<a[^>]*aria-label="Review Conditions Updated"[^>]*href="\/admin\/conditions\?tournament=11111111-1111-4111-8111-111111111111"/,
    );
    expect(markup).toMatch(
      /<a[^>]*aria-label="Open Import WeighFish Results"[^>]*href="\/admin\/results\?tournament=11111111-1111-4111-8111-111111111111"/,
    );
  });

  it("renders exactly four management cards without Sponsors", () => {
    const cardLinks = [
      "/admin/tournament",
      "/admin/announcements",
      "/admin/conditions",
      "/admin/results",
    ];

    for (const href of cardLinks) {
      expect(markup).toContain(
        `href="${href}?tournament=11111111-1111-4111-8111-111111111111"`,
      );
    }

    expect(markup).not.toContain('href="/admin/sponsors"');
    expect(markup).not.toContain("Sponsors Loaded");
    expect(markup.match(/Last Updated/g)).toHaveLength(4);
  });

  it("shows the four management-card status summaries", () => {
    expect(markup).toContain("Lake Fork Open");
    expect(markup).toContain("August 16, 2026");
    expect(markup).toContain("Active Announcements");
    expect(markup).toContain("6:18 AM");
    expect(markup).toContain("Not Published");
    expect(markup).toContain(
      "Import WeighFish results, upload winner photos, review the standings and publish the official tournament results.",
    );
  });

  it("shows the selected tournament context above readiness", () => {
    expect(markup.indexOf("Current Tournament")).toBeLessThan(
      markup.indexOf("Website Readiness"),
    );
    expect(markup).toContain("Lake Fork Open");
    expect(markup).toContain("Sunday, August 16, 2026");
    expect(markup).toContain("Lake Fork");
    expect(markup).toContain("Pope&#x27;s Landing");
    expect(markup).toContain("Registration Open");
    expect(markup).toContain("Change Tournament");
    expect(markup).toContain('aria-haspopup="listbox"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain("Sam Rayburn Open");
  });
});
