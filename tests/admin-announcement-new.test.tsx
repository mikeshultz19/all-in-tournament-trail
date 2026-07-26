import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AnnouncementForm from "@/components/admin/AnnouncementForm";

describe("New Announcement editor", () => {
  it("renders the scoped announcement editor", () => {
    const markup = renderToStaticMarkup(
      <AnnouncementForm
        events={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            name: "Lake Fork Open",
          },
        ]}
      />,
    );

    expect(markup).toContain("<form");
    expect(markup).toContain("Announcement Details");
    expect(markup).toContain(">Event");
    expect(markup).toContain("Any Event");
    expect(markup).toContain("Lake Fork Open");
    expect(markup).toContain("Message");
    expect(markup).toContain("Save Announcement");
    expect(markup).not.toContain("Draft");
    expect(markup).not.toContain("Published");
    expect(markup).not.toContain("Pinned");
    expect(markup).toContain('maxLength="100"');
    expect(markup).toContain('maxLength="500"');
    expect(markup).not.toContain("Topic");
  });
});
