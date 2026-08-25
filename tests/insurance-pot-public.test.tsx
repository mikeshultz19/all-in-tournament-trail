import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import InsurancePotWinnersSection from "@/components/InsurancePotWinnersSection";
import InsurancePotPage from "@/app/insurance-pot/page";

describe("published Insurance Pot results", () => {
  const result = {
    id: "ip-1", tournament_id: "t-1", entry_count: 10, total_pot_cents: 20000,
    places_paid: 2, published: true, published_at: "2026-08-02T00:00:00Z",
    calculated_payouts: [10000, 10000],
    created_at: "2026-08-02T00:00:00Z", updated_at: "2026-08-02T00:00:00Z",
    winners: [
      { entryName: "Team One", finishingPosition: 5, amountCents: 10000 },
      { entryName: "Team Two", finishingPosition: 7, amountCents: 10000 },
    ],
  };

  it("stays hidden before publication", () => {
    const html = renderToStaticMarkup(<InsurancePotWinnersSection result={{ ...result, published: false }} />);
    expect(html).toBe("");
  });

  it("shows the published summary without a standalone winner-detail row", () => {
    const html = renderToStaticMarkup(<InsurancePotWinnersSection result={result} />);
    expect(html).toContain('id="insurance-pot-winners"');
    expect(html).toContain("Insurance Pot Entries");
    expect(html).toContain("Total Pot");
    expect(html).toContain("Places Paid");
    expect(html).toContain("Payout Per Winning Entry");
    expect(html).not.toContain("Team One");
    expect(html).not.toContain("Team Two");
  });

  it("keeps the winners section and adds row-level Insurance winner visibility", () => {
    const resultsPage = readFileSync("app/results/page.tsx", "utf8");

    expect(resultsPage).toContain("Insurance");
    expect(resultsPage).not.toContain("winner.amountCents / 100");
    expect(resultsPage).toContain("getInsurancePotWinnersForEntry");
    expect(resultsPage).toContain("<InsurancePotWinnersSection");
    expect(resultsPage.indexOf("Standings pagination")).toBeLessThan(
      resultsPage.indexOf("<InsurancePotWinnersSection"),
    );
  });

  it("loads the public explanation with examples and approved destinations", () => {
    const html = renderToStaticMarkup(<InsurancePotPage />);
    expect(html).toContain("The AITT Insurance Pot");
    expect(html).not.toContain("Why We Created the Insurance Pot");
    expect(html.indexOf("How It Works")).toBeGreaterThan(html.indexOf("More Teams Get Paid."));
    expect(html).toContain("Insurance Pot Examples");
    expect(html).toContain("4 Insurance Pot Entries");
    expect(html).toContain("20 Insurance Pot Entries");
    expect(html).toContain('href="/rules#insurance-pot"');
    expect(html).toContain('href="/how-it-works"');
    expect(html).toContain('href="/schedule"');
  });

  it("connects Rules, How AITT Works, and Winner's Circle navigation", () => {
    const rules = readFileSync("docs/TOURNAMENT_RULES.md", "utf8");
    const howItWorks = readFileSync("app/how-it-works/page.tsx", "utf8");
    const resultArchive = readFileSync("lib/result-archive.ts", "utf8");
    const winnersCircle = readFileSync("components/WinnersCircle.tsx", "utf8");
    expect(rules).toContain('<a id="insurance-pot"></a>');
    expect(howItWorks).toContain('href: "/insurance-pot"');
    expect(resultArchive).toContain("#insurance-pot-winners");
    expect(winnersCircle).toContain("View Insurance Pot Winners →");
    expect(winnersCircle).not.toContain("One Tournament. More Winners.");
  });
});
