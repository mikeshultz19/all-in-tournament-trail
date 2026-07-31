import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HowItWorksPage from "@/app/how-it-works/page";
import RulesPage from "@/app/rules/page";

const rules = readFileSync("docs/TOURNAMENT_RULES.md", "utf8");
const howItWorks = readFileSync("app/how-it-works/page.tsx", "utf8");

describe("Practice and Off-Limits Policy", () => {
  it("publishes every approved eligibility condition in the Official Rules", async () => {
    const html = renderToStaticMarkup(await RulesPage());

    expect(html).toContain("Practice and Off-Limits Policy");
    expect(rules).toContain(
      "12:00 AM midnight on Monday of tournament week",
    );
    expect(rules).toContain("all non-member anglers registered to compete");
    expect(rules).toContain("A current All-In Tournament Trail member");
    expect(rules).toContain("registered for that specific tournament");
    expect(rules).toContain("one official practice day");
    expect(rules).toContain("either Friday or Saturday");
    expect(rules).toMatch(/may not\s+practice on both days/);
    expect(rules).toContain(
      "Membership alone does not provide the practice privilege",
    );
    expect(rules).toMatch(/applies before every\s+AITT tournament event/);
  });

  it("does not retain the superseded practice permissions", () => {
    expect(rules).not.toMatch(/only permitted practice day[^.]*Friday/i);
    expect(rules).not.toMatch(/Friday tournament-week practice/i);
    expect(rules).not.toMatch(/Friday practice partners/i);
    expect(rules).not.toMatch(/may practice on both/i);
  });

  it("publishes the same policy in the How It Works FAQ", () => {
    const html = renderToStaticMarkup(<HowItWorksPage />);

    expect(html).toContain("When can I practice before a tournament?");
    expect(html).toContain("12:00 AM on Monday of tournament week");
    expect(html).toContain("registered for that specific tournament");
    expect(html).toContain("one official practice day");
    expect(html).toContain("either Friday or Saturday");
    expect(html).toContain("Practice on both days is not permitted");
  });

  it("makes clear that membership alone is insufficient", () => {
    expect(howItWorks).toContain(
      "Membership alone does not provide the practice privilege.",
    );
    expect(howItWorks).not.toMatch(
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
