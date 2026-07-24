import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Footer from "@/components/Footer";
import SiteCraftBadge from "@/components/SiteCraftBadge";

describe("SiteCraft footer credit", () => {
  const html = renderToStaticMarkup(<Footer />);

  it("renders one accessible badge linking to the Contact page", () => {
    expect(html.match(/href="\/contact"/g)).toHaveLength(2);
    expect(html).toContain("url=%2Fbrands%2Fsitecraft.png");
    expect(html).toContain('alt="SiteCraft Web Design"');
  });

  it("renders the compact navigation and avoids nested controls", () => {
    for (const href of ["/", "/schedule", "/results", "/rules", "/contact"]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain(">Facebook</a>");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Back to Top");
    expect(renderToStaticMarkup(<SiteCraftBadge />)).not.toContain("<button");
  });
});
