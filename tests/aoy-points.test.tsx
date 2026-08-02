import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AoyPointsPage from "@/app/aoy-points/page";

describe("AOY Points information page", () => {
  it("explains optional membership and member-only AOY calculation", () => {
    const html = renderToStaticMarkup(<AoyPointsPage />);
    expect(html).toContain("AOY Points Race");
    expect(html).toContain("Membership Rewards Consistency.");
    expect(html).toContain("AITT Membership is optional");
    expect(html).toContain("only AITT Members earn AOY points");
    expect(html).toContain("Non-members are skipped during the AOY points calculation");
    expect(html).toContain("1st AOY");
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
