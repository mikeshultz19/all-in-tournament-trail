import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Footer from "@/components/Footer";
import SiteCraftBadge from "@/components/SiteCraftBadge";

describe("SiteCraft footer credit", () => {
  const html = renderToStaticMarkup(<Footer />);

  it("renders one accessible badge linking to the Contact page", () => {
    expect(html.match(/href="\/contact"/g)).toHaveLength(1);
    expect(html).toContain("url=%2Fbrands%2Fsitecraft.png");
    expect(html).toContain('alt="SiteCraft Web Design"');
    expect(html).not.toContain("<svg");
  });

  it("preserves the existing footer destinations and avoids nested controls", () => {
    for (const href of ["/", "/schedule", "/results", "/how-it-works"]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain("support@allintournamenttrail.com");
    expect(renderToStaticMarkup(<SiteCraftBadge />)).not.toContain("<button");
  });
});
