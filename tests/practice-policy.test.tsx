import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FaqPage from "@/app/faq/page";
import RulesPage from "@/app/rules/page";

const rules = readFileSync("docs/TOURNAMENT_RULES.md", "utf8");
const faq = readFileSync("app/faq/page.tsx", "utf8");

describe("Practice and Off-Limits Policy", () => {
  it("publishes every approved eligibility condition in the Official Rules", async () => {
    const html = renderToStaticMarkup(await RulesPage());

    expect(html).toContain("Practice and Off-Limits Policy");
    expect(rules).toContain("OFF-LIMITS PERIOD AND OFFICIAL PRACTICE DAY");
    expect(rules).toContain(
      "Tournament waters are off-limits beginning at 12:00 a.m. Monday immediately",
    );
    expect(rules).toMatch(
      /Each registered tournament entry—team or solo—is\s+allowed one official practice day/,
    );
    expect(rules).toContain("For a team entry, both anglers share the same single practice-day allowance.");
    expect(rules).toMatch(
      /Registration must be completed before the entry\s+begins practice\./,
    );
    expect(rules).toMatch(
      /Changing boats, anglers, partners, or passengers does not create an additional\s+practice day\./,
    );
  });

  it("does not retain the superseded practice permissions", () => {
    expect(rules).not.toMatch(/only permitted practice day[^.]*Friday/i);
    expect(rules).not.toMatch(/Friday tournament-week practice/i);
    expect(rules).not.toMatch(/Friday practice partners/i);
    expect(rules).not.toMatch(/may practice on both/i);
    expect(rules).not.toContain("### Boats During Practice");
  });

  it("publishes the same policy in the public FAQ", () => {
    const html = renderToStaticMarkup(<FaqPage />);

    expect(html).toContain("Off-Limits Period and Registered-Angler Practice");
    expect(html).toContain("12:00 a.m. Monday immediately before each tournament");
    expect(html).toContain("Each registered tournament entry—team or solo—is allowed one official practice day");
    expect(html).toContain("either Friday or Saturday");
    expect(html).toContain("but not both.");
    expect(html).toContain("Team members may not divide the allowance by practicing on different days");
    expect(html).toContain("Registration must be completed before the entry begins practice");
    expect(html).toContain("Changing boats, anglers, partners, or passengers does not create an additional practice day");
  });

  it("preserves the remaining practice policy FAQs", () => {
    expect(faq).not.toContain("Does membership alone provide the practice privilege?");
    expect(faq).not.toContain("both a current member and registered for the applicable tournament");
    expect(faq).not.toMatch(
      /membership provides[^.]*tournament-week practice eligibility/i,
    );
  });

  it("preserves unrelated Rules sections", () => {
    for (const heading of [
      "## 8. Boat & Safety",
      "## 9. Fishing Rules",
      "## 11. Tournament Operations",
      "## 12. Protests",
      "## 13. Polygraph",
    ]) {
      expect(rules).toContain(heading);
    }
  });
});
