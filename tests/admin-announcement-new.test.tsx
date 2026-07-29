import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AnnouncementForm from "@/components/admin/AnnouncementForm";

describe("New Announcement editor", () => {
  it("renders the scoped announcement editor", () => {
    const markup = renderToStaticMarkup(
      <AnnouncementForm />,
    );

    expect(markup).toContain("<form");
    expect(markup).toContain("Announcement Details");
    expect(markup).toContain("Message");
    expect(markup).toContain("Publish Announcement");
    expect(markup).not.toContain("Draft");
    expect(markup).not.toContain("Published");
    expect(markup).toContain("Pin Announcement");
    expect(markup).toContain('maxLength="100"');
    expect(markup).toContain('maxLength="500"');
    expect(markup).not.toContain("Topic");
  });
});
