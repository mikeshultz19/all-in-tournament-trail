import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HowItWorksPage from "@/app/how-it-works/page";
import RulesPage from "@/app/rules/page";

const approvedFaqQuestions = [
  "What happens if I bring a short fish to the scales?",
  "What is the penalty for a dead fish?",
  "Are dead fish eligible for Big Bass?",
  "What happens if I am late to check-in?",
];

describe("approved weigh-in and late check-in policies", () => {
  it("renders every approved policy on the public Rules page", async () => {
    const html = renderToStaticMarkup(await RulesPage());

    expect(html).toContain("Receives no tournament weight.");
    expect(html).toContain("Does not count toward the legal tournament limit.");
    expect(html).toContain("one (1) pound penalty will be deducted for each legal fish");
    expect(html).toContain("Only legal live fish are eligible for the Big Bass award.");
    expect(html).toContain("one (1) pound penalty will be assessed for each minute");
    expect(html).toContain("up to fifteen (15) minutes");
    expect(html).toContain("more than fifteen (15) minutes");
    expect(html).toContain("forfeit that day&#x27;s catch");
    expect(html).toContain("designated official timekeeping device");
    expect(html).toContain("Safety always takes precedence over tournament competition.");
  });

  it("contains exactly the four approved questions in the Rules FAQ section", () => {
    const source = readFileSync(
      path.join(process.cwd(), "docs", "TOURNAMENT_RULES.md"),
      "utf8",
    );
    const faqSection = source.match(
      /## 17\. Frequently Asked Questions([\s\S]*?)<a id="version-history">/,
    )?.[1];

    expect(faqSection).toBeDefined();
    expect(faqSection?.match(/^### /gm)).toHaveLength(4);
    for (const question of approvedFaqQuestions) {
      expect(faqSection).toContain(`### ${question}`);
    }
  });

  it("publishes the four approved How It Works FAQs and links to Rules", () => {
    const html = renderToStaticMarkup(<HowItWorksPage />);

    for (const question of approvedFaqQuestions) {
      expect(html).toContain(question);
    }
    expect(html).toContain('href="/rules"');
    expect(html).toContain("View Official Rules");
  });

  it("does not retain superseded pending-policy language in active public content", async () => {
    const rulesHtml = renderToStaticMarkup(await RulesPage());
    const howItWorksHtml = renderToStaticMarkup(<HowItWorksPage />);
    const activeContent = `${rulesHtml}${howItWorksHtml}`;

    expect(activeContent).not.toMatch(/no numeric dead-fish weight penalty/i);
    expect(activeContent).not.toMatch(/dead-fish[^.]*pending approval/i);
    expect(activeContent).not.toMatch(/no per-minute late penalty/i);
    expect(activeContent).not.toMatch(/maximum-lateness threshold/i);
  });
});
