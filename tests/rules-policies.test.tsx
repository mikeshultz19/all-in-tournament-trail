import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FaqPage from "@/app/faq/page";
import RulesPage from "@/app/rules/page";

const approvedFaqQuestions = [
  "What happens if I bring a short fish to the scales?",
  "What is the penalty for a dead fish?",
  "Are dead fish eligible for Big Bass?",
  "What happens if I am late to check-in?",
  "What is the AITT Bass Stack Challenge?",
      "What is the AITT Bass Stack Challenge?",
];

describe("approved weigh-in and late check-in policies", () => {
  it("renders every approved policy on the public Rules page", async () => {
    const html = renderToStaticMarkup(await RulesPage());

    expect(html).toContain("Receives no tournament weight.");
    expect(html).toContain("Does not count toward the legal tournament limit.");
    expect(html).toContain("one (1) pound penalty will be deducted for each legal fish");
    expect(html).toContain("Only legal live fish are eligible for a Big Bass payout.");
    expect(html).toContain("The Big Bass side pot pays two (2) places.");
    expect(html).toContain('id="bass-stack"');
    expect(html).toContain("Bass Stack Competition Format");
    expect(html).toContain("replaces the general five-fish tournament limit");
    expect(html).toContain("maximum of three legal bass in the livewell");
    expect(html).toContain("weigh fish as many times as desired");
    expect(html).toContain("cumulative official tournament weight after all penalties");
    expect(html).toContain("one (1) pound penalty will be assessed for each minute");
    expect(html).toContain("up to fifteen (15) minutes");
    expect(html).toContain("more than fifteen (15) minutes");
    expect(html).toContain("forfeit that day&#x27;s catch");
    expect(html).toContain("designated official timekeeping device");
    expect(html).toContain("Safety always takes precedence over tournament competition.");
  });

  it("keeps FAQ content off the Rules page", () => {
    const source = readFileSync(
      path.join(process.cwd(), "docs", "TOURNAMENT_RULES.md"),
      "utf8",
    );

    expect(source).not.toContain("Frequently Asked Questions");
    for (const question of approvedFaqQuestions) {
      expect(source).not.toContain(`### ${question}`);
    }
    expect(source).toContain("17. [Version History](#version-history)");
    expect(source).toContain("## 17. Version History");
  });

  it("publishes the approved public FAQs and policy links", () => {
    const html = renderToStaticMarkup(<FaqPage />);

    for (const question of approvedFaqQuestions) {
      expect(html).toContain(question);
    }
    expect(html).toContain("Only legal live fish are eligible for a Big Bass payout.");
    expect(html).toContain("A fish presented dead at weigh-in is not eligible for either Big Bass payout.");
    expect(html).toContain("The optional Big Bass side pot pays two places.");
    expect(html).not.toMatch(/Big Bass[^.]*divided equally/i);
    expect(html).toContain("cumulative-weight format");
    expect(html).toMatch(/every legal bass officially weighed contributes/i);
    expect(html).toContain('href="/rules"');
    expect(html).toContain("View Official Rules");
    expect(html).toContain("AccuWeather and Weather Underground are primary human decision references");
    expect(html).not.toMatch(/weather decisions[^]*Open-Meteo/i);
    expect(html).not.toContain("Major League Fishing logo");
    expect(html).not.toContain("official association");
  });

  it("does not retain superseded pending-policy language in active public content", async () => {
    const rulesHtml = renderToStaticMarkup(await RulesPage());
    const faqHtml = renderToStaticMarkup(<FaqPage />);
    const activeContent = `${rulesHtml}${faqHtml}`;

    expect(activeContent).not.toMatch(/no numeric dead-fish weight penalty/i);
    expect(activeContent).not.toMatch(/dead-fish[^.]*pending approval/i);
    expect(activeContent).not.toMatch(/no per-minute late penalty/i);
    expect(activeContent).not.toMatch(/maximum-lateness threshold/i);
  });
});
