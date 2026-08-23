import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/tournaments", async () => {
  const { databaseTournament } = await import(
    "@/tests/tournament-db-fixture"
  );
  return {
    getFeaturedTournament: vi.fn(async () => databaseTournament),
  };
});

import FaqPage from "@/app/faq/page";
import RegistrationForm from "@/components/RegistrationForm";
import { tournaments } from "@/data/tournaments";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

describe("approved payment content", () => {
  it("publishes aligned online and tournament-morning payment FAQs", () => {
    const html = renderToStaticMarkup(<FaqPage />);
    expect(html).toContain("What payment methods are accepted?");
    expect(html).toContain("processed through Square");
    expect(html).toContain("3% Card Processing Fee");
    expect(html).toContain("Tournament-morning payments may be made by cash or through the Square reader");
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
  });

  it("keeps homepage announcements database-driven", () => {
    const pageSource = readFileSync("components/DesktopHomePage.tsx", "utf8");
    const newsSource = readFileSync("components/LatestTournamentNews.tsx", "utf8");
    expect(pageSource).toContain(
      "<LatestTournamentNews announcements={announcements} />",
    );
    expect(newsSource).not.toContain("<PaymentAnnouncement />");
    expect((pageSource.match(/<LatestTournamentNews/g) ?? [])).toHaveLength(1);
    expect(readFileSync("components/Header.tsx", "utf8")).not.toMatch(/LatestTournamentNews|newsTicker/);
  });

  it("documents an official local Apple Pay asset path while retaining text fallback", () => {
    const brandInstructions = readFileSync("public/brands/README.md", "utf8");
    expect(brandInstructions).toContain("Apple's current Apple Pay Marketing Guidelines");
    expect(brandInstructions).toContain("public/brands/apple-pay-mark.svg");
    expect(brandInstructions).toContain("unmodified");
    expect(brandInstructions).toContain("text fallback");
    expect(brandInstructions).not.toMatch(/https?:\/\/(?!www\.apple\.com)/i);
  });

  it("keeps pre-payment content minimal while itemizing integer-cent pricing", () => {
    const operationsBySlug = Object.fromEntries(
      tournaments.map((tournament) => [
        tournament.slug,
        getTournamentOperationsViewModel(tournament, new Date("2026-07-21T12:00:00Z")),
      ]),
    );
    const html = renderToStaticMarkup(<RegistrationForm tournaments={tournaments} operationsBySlug={operationsBySlug} policyVersions={{ rulesVersion: "1.0", waiverVersion: "1.0" }} />);
    expect(html).toContain("Card Processing Fee (3%)");
    expect(html).toContain("Subtotal");
    expect(html).toContain("Final Total");
    expect(html).toContain("Continue to Payment");
    expect(html).toContain("Secure payment through Square");
    expect(html).toContain("Square and Apple Pay accepted at the ramp");
    expect(html).not.toMatch(/Cash|Visa|Mastercard|Discover/i);
  });

  it("keeps the server credential out of client-facing source", () => {
    const clientSources = [
      "components/PaymentOptions.tsx",
      "components/RegistrationForm.tsx",
      "app/register/page.tsx",
    ].map((path) => readFileSync(path, "utf8")).join("\n");
    expect(clientSources).not.toContain("SQUARE_ACCESS_TOKEN");
  });
});
