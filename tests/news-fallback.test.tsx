import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import LatestTournamentNews from "@/components/LatestTournamentNews";

describe("homepage announcement fallback", () => {
  const source = readFileSync("lib/news.ts", "utf8");

  it("logs actionable Supabase fields and returns an empty list", () => {
    expect(source).toContain("message: error.message");
    expect(source).toContain("details: error.details");
    expect(source).toContain("hint: error.hint");
    expect(source).toContain("code: error.code");
    expect(source).toMatch(/if \(error\)[\s\S]*return \[\];/);
  });

  it("renders records and the empty state without crashing", () => {
    const loaded = renderToStaticMarkup(
      <LatestTournamentNews
        announcements={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            tournament_id: null,
            title: "Tournament Update",
            slug: "tournament-update",
            summary: null,
            content: "Registration details are available.",
            featured_image_url: null,
            is_pinned: true,
            created_at: "2026-07-28T12:00:00Z",
            updated_at: "2026-07-28T12:00:00Z",
          },
        ]}
      />,
    );
    const empty = renderToStaticMarkup(
      <LatestTournamentNews announcements={[]} />,
    );

    expect(loaded).toContain("Tournament Update");
    expect(loaded).toContain("Registration details are available.");
    expect(empty).toContain(
      "No current news or announcements are available.",
    );
  });
});
