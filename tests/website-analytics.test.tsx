import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import RegistrationInterest from "@/components/RegistrationInterest";

describe("website analytics and registration interest", () => {
  it("renders the homepage interest prompt and accessible modal form", () => {
    const html = renderToStaticMarkup(<RegistrationInterest />);
    expect(html).toContain(
      "Get notified the moment tournament registration opens.",
    );
    expect(html).toContain("Notify Me");
    expect(html).toContain('type="email"');
    expect(html).toContain("First Name");
    expect(html).toContain("Be the First to Know");
    expect(html).toContain(
      "Join our notification list and we&#x27;ll email you as soon as registration opens for the inaugural AITT season.",
    );
    expect(html).toContain("fixed inset-0 m-auto");
    expect(html).toContain("backdrop:bg-black/75");
    expect(html).toContain('autofocus=""');
  });

  it("places registration interest immediately after the featured tournament", () => {
    const source = readFileSync("app/page.tsx", "utf8");
    expect(source.indexOf("<FeaturedTournament")).toBeLessThan(
      source.indexOf("<RegistrationInterest"),
    );
    expect(source.indexOf("<RegistrationInterest")).toBeLessThan(
      source.indexOf("<LatestTournamentNews"),
    );
    expect(source.match(/<RegistrationInterest/g)).toHaveLength(1);
  });

  it("defines the ten requested analytics categories", async () => {
    const { TRACKED_PAGE_NAMES } = await import("@/lib/website-analytics");
    expect(TRACKED_PAGE_NAMES).toEqual([
      "Homepage", "Schedule", "Registration", "Rules", "FAQ", "Sponsors",
      "Winner Circle", "AOY Standings", "Tournament Results", "Contact",
    ]);
  });
});
