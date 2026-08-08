import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import RegistrationInterest from "@/components/RegistrationInterest";

describe("website analytics and registration interest", () => {
  it("renders the homepage interest prompt and accessible modal form", () => {
    const html = renderToStaticMarkup(<RegistrationInterest />);
    expect(html).toContain("Get important AITT tournament updates by email.");
    expect(html).toContain("Join AITT");
    expect(html).toContain('type="email"');
    expect(html).toContain("First Name");
    expect(html).toContain("Be the First to Know");
    expect(html).toContain(
      "Join our mailing list. We will not spam you.",
    );
    expect(html).toContain("fixed inset-0 m-auto");
    expect(html).toContain("backdrop:bg-black/75");
    expect(html).toContain('autofocus=""');
  });

  it("places registration interest immediately after the featured tournament", () => {
    const source = readFileSync("components/DesktopHomePage.tsx", "utf8");
    expect(source.indexOf("<RegistrationInterest")).toBeLessThan(
      source.indexOf("<FeaturedTournament"),
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
