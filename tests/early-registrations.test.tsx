import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import EarlyRegistrationsPage from "@/app/registrations/page";
import EarlyEntriesTable from "@/components/EarlyEntriesTable";
import FeaturedTournament from "@/components/FeaturedTournament";
import TournamentEntrySummary from "@/components/TournamentEntrySummary";
import EarlyRegistrationStats from "@/components/EarlyRegistrationStats";
import { earlyRegistrationRecords, getPublicEarlyEntries } from "@/data/early-registrations";
import { tournaments } from "@/data/tournaments";
import { getTournamentEntrySummary, toPublicEarlyEntry } from "@/lib/public-early-entry";
import { formatPublicRegistrationTimestamp } from "@/lib/tournament-time";

const entries = getPublicEarlyEntries("eagle-mountain-2026");

describe("Tournament Entries", () => {
  it("renders the compact registration dashboard from the shared summary", () => {
    const html = renderToStaticMarkup(<EarlyRegistrationStats {...getTournamentEntrySummary(entries)} />);
    expect(html).toContain("Early Registration Status");
    expect(html).toContain("Total Entries");
    expect(html).toContain("Insurance Pot");
    expect(html).toContain("Solo Entries");
    expect(html).toContain("Team Entries");
  });

  it("keeps the dashboard visible when empty and distinguishes data errors", () => {
    const summary = getTournamentEntrySummary([]);
    expect(renderToStaticMarkup(<EarlyRegistrationStats {...summary} />)).toContain("Be the first to register online.");
    const unavailable = renderToStaticMarkup(<EarlyRegistrationStats {...summary} unavailable />);
    expect(unavailable).toContain("temporarily unavailable");
    expect(unavailable).not.toContain("Total Entries");
  });

  it("renders the public page and a semantic spreadsheet-style table", () => {
    const html = renderToStaticMarkup(<EarlyRegistrationsPage />);
    expect(html).toContain("Tournament Entries");
    expect(html).toContain("<table");
    expect(html).toContain("<thead");
    expect(html).toContain("<tbody");
    expect(html).toContain("<th scope=\"col\"");
    expect(html).toContain("<caption");
  });

  it("links to the page from the Home featured tournament", () => {
    const html = renderToStaticMarkup(<FeaturedTournament tournament={tournaments[0]} />);
    expect(html).toContain('href="/registrations"');
    expect(html).toContain("View Tournament Entries");
  });

  it("shows dynamically derived entry and optional-pot counts", () => {
    const summary = getTournamentEntrySummary(entries);
    expect(summary).toEqual({
      totalEntries: 4,
      teamEntries: 3,
      soloEntries: 1,
      bigBassEntries: 2,
      bronzeEntries: 1,
      silverEntries: 1,
      goldEntries: 1,
      insurancePotEntries: 2,
    });
    const html = renderToStaticMarkup(<EarlyRegistrationsPage />);
    expect(html).toContain("4 Tournament Entries");
    expect(html).toContain("3 Team Entries");
    expect(html).toContain("1 Solo Entry");
  });

  it("returns and renders zero for every empty-summary metric", () => {
    const summary = getTournamentEntrySummary([]);
    expect(Object.values(summary)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    const html = renderToStaticMarkup(<TournamentEntrySummary summary={summary} />);
    expect(html).toContain("0 Tournament Entries");
    expect(html).toContain("0 Team Entries");
    expect(html).toContain("0 Solo Entries");
    expect((html.match(/>0</g) ?? []).length).toBe(5);
  });

  it("formats exact timestamps deterministically in America/Chicago", () => {
    expect(formatPublicRegistrationTimestamp("2026-07-10T23:34:00.000Z")).toBe("July 10, 2026 at 6:34 PM");
    const html = renderToStaticMarkup(<EarlyEntriesTable entries={entries} registrationHref="/register" registrationOpen />);
    expect(html).toContain("July 10, 2026 at 6:34 PM");
  });

  it("sorts entries oldest to newest", () => {
    expect(entries.map((entry) => entry.angler1DisplayName)).toEqual([
      "Caleb Brooks",
      "Avery Collins",
      "Noah Bennett",
      "Marcus Reed",
    ]);
  });

  it("renders team and solo entries with their public names", () => {
    const html = renderToStaticMarkup(<EarlyEntriesTable entries={entries} registrationHref="/register" registrationOpen />);
    expect(html).toContain("Caleb Brooks");
    expect(html).toContain("Drew Carter");
    expect(html).toContain("Avery Collins");
    expect(html).toContain("Solo");
  });

  it("renders optional pot selections and restrained unselected values", () => {
    const html = renderToStaticMarkup(<EarlyEntriesTable entries={entries} registrationHref="/register" registrationOpen />);
    expect(html).toContain("Big Bass");
    expect(html).toContain("Insurance Pot");
    expect(html).toContain("Bronze");
    expect(html).toContain("Silver");
    expect(html).toContain("Gold");
    expect(html).toContain("—");
    expect(html).toContain(">Yes<");
  });

  it("omits the redundant Tournament Entry column", () => {
    const html = renderToStaticMarkup(<EarlyEntriesTable entries={entries} registrationHref="/register" registrationOpen />);
    expect(html).not.toContain("Tournament Entry");
  });

  it("projects only approved public fields and excludes private values", () => {
    const publicEntry = toPublicEarlyEntry(earlyRegistrationRecords[0]);
    expect(Object.keys(publicEntry).sort()).toEqual([
      "angler1DisplayName",
      "angler2DisplayName",
      "bigBassSelected",
      "bonusPot",
      "entryMode",
      "insurancePotSelected",
      "registeredAt",
    ]);
    const html = renderToStaticMarkup(<EarlyEntriesTable entries={entries} registrationHref="/register" registrationOpen />);
    expect(html).not.toContain("private4@example.com");
    expect(html).not.toContain("555-0104");
    expect(html).not.toContain("private-payment-004");
    expect(html).not.toContain("Private fixture note");
  });

  it("renders an explanatory empty state and registration link when open", () => {
    const html = renderToStaticMarkup(<EarlyEntriesTable entries={[]} registrationHref="/register?tournament=test" registrationOpen />);
    expect(html).toContain("No tournament entries have been posted yet.");
    expect(html).toContain('href="/register?tournament=test"');
    expect(html).not.toContain("<table");
  });
});
