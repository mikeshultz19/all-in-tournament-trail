import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import NoForwardFacingSonarPage from "@/app/no-forward-facing-sonar/page";
import Hero from "@/components/Hero";

describe("No forward-facing sonar public page", () => {
  it("uses the public-page heading hierarchy and respectful approved copy", () => {
    const html = renderToStaticMarkup(<NoForwardFacingSonarPage />);

    expect(html).toContain("All In Tournament Trail");
    expect(html).toContain("Why We Chose No Forward-Facing Sonar");
    expect(html).toContain("A Traditional Competition Option");
    expect(html).toContain("Practice Is Different from Competition");
    expect(html).toContain("AITT respects tournament organizations that allow forward-facing sonar");
    expect(html).toContain('href="/rules#forward-facing-sonar"');
    expect(html).toContain('href="/how-it-works"');
    expect(html).toContain('href="/schedule"');
  });

  it("links the existing hero badge without changing the hero image", () => {
    const html = renderToStaticMarkup(<Hero />);

    expect(html).toContain("url=%2Fimages%2Fhero%2Fhero-locked-v10.png");
    expect(html).toContain('href="/no-forward-facing-sonar"');
    expect(html).toContain('aria-label="Learn why AITT prohibits forward-facing sonar during tournament competition"');
  });

  it("adds one policy explanation link beneath the controlling rule", () => {
    const rules = readFileSync("docs/TOURNAMENT_RULES.md", "utf8");

    expect(rules).toContain("Forward-facing sonar\\Perspective view");
    expect(rules).toContain("is prohibited during official tournament competition.");
    expect(rules).toContain('<a id="forward-facing-sonar"></a>');
    expect(rules).toContain("[Why did AITT adopt this policy?](/no-forward-facing-sonar)");
  });
});
