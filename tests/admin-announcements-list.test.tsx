import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminAnnouncementList from "@/components/admin/AdminAnnouncementList";
import type { Announcement } from "@/types/announcement";

const announcements: Announcement[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    tournament_id: null,
    title: "Lake Fork Registration Opens",
    slug: "lake-fork-registration-opens",
    summary: "Registration is now open.",
    content: "Registration details.",
    featured_image_url: null,
    is_pinned: true,
    created_at: "2026-07-23T15:00:00Z",
    updated_at: "2026-07-24T16:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    tournament_id: null,
    title: "Weather Update",
    slug: "weather-update",
    summary: null,
    content: "Weather update details.",
    featured_image_url: null,
    is_pinned: false,
    created_at: "2026-07-24T17:00:00Z",
    updated_at: "2026-07-24T17:00:00Z",
  },
];

describe("Admin Announcements list", () => {
  it("renders announcement cards and last-updated times", () => {
    const markup = renderToStaticMarkup(
      <AdminAnnouncementList announcements={announcements} />,
    );

    expect(markup).toContain('data-announcements-state="loaded"');
    expect(markup).toContain("Existing Homepage Content");
    expect(markup).toContain("Lake Fork Registration Opens");
    expect(markup).toContain("Weather Update");
    expect(markup).toContain("Pinned");
    expect(markup).toContain("Jul 24, 2026");
    expect(markup).toContain("11:00 AM");
    expect(markup).toContain("Edit Announcement");
    expect(markup).toContain(">Delete</button>");
  });

  it("links New Announcement to the approved child route", () => {
    const markup = renderToStaticMarkup(
      <AdminAnnouncementList announcements={announcements} />,
    );

    expect(markup).toContain("New Announcement");
    expect(markup).toContain('href="/admin/announcements/new"');
  });

  it("renders the empty state", () => {
    const markup = renderToStaticMarkup(
      <AdminAnnouncementList announcements={[]} />,
    );

    expect(markup).toContain('data-announcements-state="empty"');
    expect(markup).toContain("No Announcements");
  });

  it("renders the load error state without showing an empty list", () => {
    const markup = renderToStaticMarkup(
      <AdminAnnouncementList announcements={[]} loadFailed />,
    );

    expect(markup).toContain('data-announcements-state="error"');
    expect(markup).toContain("Announcements Unavailable");
    expect(markup).not.toContain('data-announcements-state="empty"');
  });

  it("renders the post-save confirmation", () => {
    const markup = renderToStaticMarkup(
      <AdminAnnouncementList
        announcements={announcements}
        successMessage="Changes saved successfully."
      />,
    );

    expect(markup).toContain("Changes saved successfully.");
    expect(markup).toContain('role="status"');
  });
});
