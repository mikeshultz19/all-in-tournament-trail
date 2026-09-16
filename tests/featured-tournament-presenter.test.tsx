import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FeaturedTournament from "@/components/FeaturedTournament";
import MobileFeaturedTournament from "@/components/MobileFeaturedTournament";
import { tournaments } from "@/data/tournaments";

describe("Featured Tournament presenter", () => {
  it.each([
    ["desktop", FeaturedTournament],
    ["mobile", MobileFeaturedTournament],
  ])("shows a tournament-specific presenter on %s", (_surface, Component) => {
    const html = renderToStaticMarkup(
      <Component
        tournament={{ ...tournaments[0], presentedBy: "Texas Boat Works" }}
      />,
    );

    expect(html).toContain("Texas Boat Works Presents");
  });

  it.each([
    ["desktop", FeaturedTournament],
    ["mobile", MobileFeaturedTournament],
  ])("falls back to AITT for a blank presenter on %s", (_surface, Component) => {
    const html = renderToStaticMarkup(
      <Component tournament={{ ...tournaments[0], presentedBy: "   " }} />,
    );

    expect(html).toContain("AITT Presents");
  });
});
