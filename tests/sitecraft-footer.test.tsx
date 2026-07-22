import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Footer from "@/components/Footer";
import SiteCraftBadge from "@/components/SiteCraftBadge";
import SiteCraftMark from "@/components/SiteCraftMark";

describe("SiteCraft footer credit", () => {
  const html = renderToStaticMarkup(<Footer />);

  it("renders one accessible badge linking to the Contact page", () => {
    expect(html.match(/href="\/contact"/g)).toHaveLength(1);
    expect(html).toContain("SiteCraft");
    expect(html).toContain("Web Design");
    expect(html).toContain(
      'aria-label="Designed and developed by SiteCraft. Contact us about web design."',
    );
  });

  it("renders the reusable decorative SVG emblem", () => {
    const mark = renderToStaticMarkup(<SiteCraftMark size={24} />);
    expect(mark).toContain("<svg");
    expect(mark).toContain('aria-hidden="true"');
    expect(mark).toContain('stroke="currentColor"');
    expect(mark).toContain('height="24"');
  });

  it("preserves the existing footer destinations and avoids nested controls", () => {
    for (const href of ["/", "/schedule", "/results", "/how-it-works"]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain("support@allintournamenttrail.com");
    expect(renderToStaticMarkup(<SiteCraftBadge />)).not.toContain("<button");
  });
});
