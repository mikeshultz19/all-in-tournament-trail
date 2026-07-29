import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Header from "@/components/Header";
import {
  buildAoyStandings,
  buildFullAoyStandings,
} from "@/lib/aoy-standings";

describe("public AOY standings navigation and data", () => {
  it("enables the Standings header link with normal active styling", () => {
    const markup = renderToStaticMarkup(
      <Header activeItem="Standings" />,
    );

    expect(markup).toContain('href="/standings"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).not.toMatch(
      /aria-disabled="true"[^>]*>Standings/,
    );
  });

  it("keeps homepage Top 5 while the full page receives every live row", () => {
    const rows = Array.from({ length: 7 }, (_, index) => ({
      tournament_id: "published-tournament",
      anglers: [`Angler ${index + 1}`],
      points: 200 - index,
    }));

    expect(buildAoyStandings(rows)).toHaveLength(5);
    expect(buildFullAoyStandings(rows)).toHaveLength(7);
  });

  it("uses the live published AOY loader and required empty state", () => {
    const page = readFileSync("app/standings/page.tsx", "utf8");
    expect(page).toContain("getPublishedAoyStandings");
    expect(page).toContain(
      "AOY standings will appear after the first tournament results are published.",
    );
    expect(page).not.toContain("@/data/aoyStandings");
  });
});
