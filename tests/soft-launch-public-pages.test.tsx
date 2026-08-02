import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import WatchPage from "@/app/watch/page";
import Header from "@/components/Header";

describe("soft-launch public pages", () => {
  it("renders Privacy and Terms with working informational paths", () => {
    const privacy = renderToStaticMarkup(<PrivacyPage />);
    const terms = renderToStaticMarkup(<TermsPage />);

    expect(privacy).toContain("Privacy Policy");
    expect(privacy).toContain("info@allintrail.com");
    expect(terms).toContain("Terms of Use");
    expect(terms).toContain('href="/rules"');
  });

  it("keeps Watch honest and format-neutral while offline", () => {
    const html = renderToStaticMarkup(<WatchPage />);

    expect(html).toContain("Coming Soon");
    expect(html).toContain("AITT Live Tournament Stream &amp; Weigh-In Coverage");
    expect(html).not.toMatch(/five[- ]fish|viewer count|Pause live stream/i);
  });

  it("marks Results and Schedule active in global navigation", () => {
    expect(renderToStaticMarkup(<Header activeItem="Results" />)).toContain('aria-current="page"');
    expect(renderToStaticMarkup(<Header activeItem="Schedule" />)).toContain('aria-current="page"');
  });
});
