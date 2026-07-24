import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Header from "@/components/Header";

describe("Header Login controls", () => {
  it("links both desktop and mobile Login controls to the Admin Center", () => {
    const markup = renderToStaticMarkup(<Header />);
    const adminLinks = markup.match(/href="\/admin"/g) ?? [];

    expect(adminLinks).toHaveLength(2);
    expect(markup).not.toContain('aria-disabled="true">Login');
    expect(markup).not.toMatch(/cursor-not-allowed[^"]*"[^>]*>Login/);
  });

  it("keeps Login in both responsive action groups with keyboard focus styles", () => {
    const markup = renderToStaticMarkup(<Header />);
    const loginLinks =
      markup.match(/<a[^>]*href="\/admin"[^>]*>Login<\/a>/g) ?? [];

    expect(loginLinks).toHaveLength(2);
    expect(loginLinks.every((link) => link.includes("focus-visible:outline-2"))).toBe(
      true,
    );
    expect(loginLinks.some((link) => link.includes("text-sm"))).toBe(true);
    expect(loginLinks.some((link) => link.includes("text-xs"))).toBe(true);
  });
});
