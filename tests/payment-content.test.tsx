import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HowItWorksPage from "@/app/how-it-works/page";
import HomePage from "@/app/page";
import RegistrationForm from "@/components/RegistrationForm";
import { tournaments } from "@/data/tournaments";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

describe("approved payment content", () => {
  it("publishes aligned online and tournament-morning payment FAQs", () => {
    const html = renderToStaticMarkup(<HowItWorksPage />);
    expect(html).toContain("How do Early Online Registration payments work?");
    expect(html).toContain("requires immediate payment through Square");
    expect(html).toContain("Apple Pay is available on supported devices and browsers");
    expect(html).toContain("3% Card Processing Fee");
    expect(html).toContain("Cash is accepted only during tournament-morning registration and has no processing fee");
    expect(html).toContain("completed with a Tournament Director");
    expect(html).toContain("records the registration and payment method in WeighFish");
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
  });

  it("keeps the compact payment update secondary to tournament status", async () => {
    const html = renderToStaticMarkup(await HomePage());
    expect(html).toContain("Latest News &amp; Announcements");
    expect(html).toContain(tournaments[0].statusMessage);
    expect(html).toContain("Card and Apple Pay Now Available");
    expect(html).toContain("Apple Pay is available on supported devices and browsers");
    expect(html).toContain("processed securely through Square");
    expect(html).toContain("3% Card Processing Fee");
    expect(html).toContain("Cash is accepted during tournament-morning registration with no processing fee");
    expect(html).toContain("Supported contactless wallets can be used through the Square reader");
    expect(html).toContain('href="/how-it-works#frequently-asked-questions"');
    expect(html.indexOf(tournaments[0].statusMessage)).toBeLessThan(html.indexOf("Card and Apple Pay Now Available"));
    expect(html).not.toMatch(/Venmo|Stripe/i);
    const announcementSource = readFileSync("components/PaymentAnnouncement.tsx", "utf8");
    expect(announcementSource).not.toMatch(/https?:\/\/.*(?:apple|logo)/i);
    expect(html).not.toContain("apple-pay-mark");
    expect(html).toContain("Apple Pay");
    const pageSource = readFileSync("app/page.tsx", "utf8");
    const newsSource = readFileSync("components/LatestTournamentNews.tsx", "utf8");
    expect(newsSource).toContain("<PaymentAnnouncement />");
    expect(pageSource.indexOf("<Hero />")).toBeLessThan(pageSource.indexOf("<LatestTournamentNews"));
    expect(pageSource.indexOf("<LatestTournamentNews")).toBeLessThan(pageSource.indexOf("{/* Tournament operations"));
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
    const html = renderToStaticMarkup(<RegistrationForm operationsBySlug={operationsBySlug} policyVersions={{ rulesVersion: "1.0", waiverVersion: "1.0" }} />);
    expect(html).toContain("Card Processing Fee (3%)");
    expect(html).toContain("Subtotal");
    expect(html).toContain("Final Total");
    expect(html).toContain("Continue to Payment");
    expect(html).toContain("Secure payment through Square");
    expect(html).not.toMatch(/Cash|Apple Pay|Visa|Mastercard|Discover/i);
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
