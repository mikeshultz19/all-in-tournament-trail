import { describe, expect, it } from "vitest";

import {
  announcementFormToInsert,
  announcementTitleToSlug,
  validateAnnouncementForm,
  type AnnouncementFormValues,
} from "@/lib/announcement-form";

function validValues(
  overrides: Partial<AnnouncementFormValues> = {},
): AnnouncementFormValues {
  return {
    title: "Lake Fork Registration Update",
    content: "Registration remains open through the published deadline.",
    publishDate: "2026-11-01T08:00",
    isPublished: true,
    linkLabel: "",
    linkUrl: "",
    displayOrder: 0,
    ...overrides,
  };
}

describe("Announcement form model", () => {
  it("requires a title and announcement body", () => {
    expect(validateAnnouncementForm(validValues({ title: "" })).title).toBe(
      "Enter an announcement title.",
    );
    expect(
      validateAnnouncementForm(validValues({ content: "" })).content,
    ).toBe("Enter the announcement.");
  });

  it("enforces every server-side character limit", () => {
    expect(
      validateAnnouncementForm(validValues({ title: "T".repeat(101) })).title,
    ).toBeDefined();
    expect(
      validateAnnouncementForm(validValues({ content: "A".repeat(501) }))
        .content,
    ).toBeDefined();
  });

  it("maps one standalone announcement to storage", () => {
    const values = validValues({
      content: "The tournament ramp has changed.",
    });
    const insert = announcementFormToInsert(values, "abc12345");

    expect(insert.content).toBe("The tournament ramp has changed.");
    expect(insert.is_published).toBe(true);
    expect(insert.display_order).toBe(0);
    expect(insert).not.toHaveProperty("tournament_id");
    expect(insert.slug).toBe("lake-fork-registration-update-abc12345");
  });

  it("creates a stable URL slug from the title", () => {
    expect(
      announcementTitleToSlug(
        "  Lake Fork: Registration Update!  ",
        "abc12345",
      ),
    ).toBe("lake-fork-registration-update-abc12345");
  });

  it("creates a different slug for announcements with the same title", () => {
    expect(announcementTitleToSlug("Ramp Changed", "first123")).not.toBe(
      announcementTitleToSlug("Ramp Changed", "second12"),
    );
  });

  it("validates paired links and nonnegative display order", () => {
    expect(
      validateAnnouncementForm(validValues({ linkLabel: "Register" })).linkUrl,
    ).toBeDefined();
    expect(
      validateAnnouncementForm(validValues({ linkUrl: "/register" })).linkLabel,
    ).toBeDefined();
    expect(
      validateAnnouncementForm(validValues({ displayOrder: -1 })).displayOrder,
    ).toBeDefined();
  });

  it("stores optional links and publication controls", () => {
    const insert = announcementFormToInsert(
      validValues({
        linkLabel: "Register Now",
        linkUrl: "/register",
        displayOrder: 2,
        isPublished: false,
      }),
      "abc12345",
    );
    expect(insert.link_label).toBe("Register Now");
    expect(insert.link_url).toBe("/register");
    expect(insert.display_order).toBe(2);
    expect(insert.is_published).toBe(false);
  });
});
