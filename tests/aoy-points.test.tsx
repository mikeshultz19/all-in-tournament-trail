import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AoyPointsPage from "@/app/aoy-points/page";

describe("AOY Points information page", () => {
  it("explains official-finish AOY calculation and the best five of eight", () => {
    const html = renderToStaticMarkup(<AoyPointsPage />);
    expect(html).toContain("AOY Points Race");
    expect(html).toContain("Official Finish Position Drives the Race.");
    expect(html).toContain("official finishing position");
    expect(html).toContain("best 5 of 8 point totals");
    expect(html).toContain("three lowest scores are automatically dropped");
    expect(html).not.toContain("How Points Are Calculated");
    expect(html).not.toContain("Returning active members");
    expect(html).not.toContain("eligible member");
    expect(html).toContain("AOY Points");
    expect(html).toContain(">200<");
    expect(html).toContain(">199<");
    expect(html).toContain(">198<");
    expect(html).not.toContain("Registered Angler");
    expect(html).toContain('href="/rules#angler-of-the-year"');
    expect(html).toContain('href="/schedule"');
    expect(html).toContain('href="/standings"');
    expect(html).toContain('href="/how-it-works"');
  });

  it("adds the subtle AOY Learn More destination without changing the card", () => {
    const source = readFileSync("app/how-it-works/page.tsx", "utf8");
    expect(source).toContain('title: "AOY Points"');
    expect(source).toContain('href: "/aoy-points"');
  });
});
