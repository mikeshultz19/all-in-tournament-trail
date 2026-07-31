import { describe, expect, it } from "vitest";

import {
  announcementFormToInsert,
  announcementFormToUpdate,
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
    isPublished: true,
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

  it("accepts only the two launch announcement positions", () => {
    expect(
      validateAnnouncementForm(validValues({ displayOrder: -1 })).displayOrder,
    ).toBeDefined();
    expect(
      validateAnnouncementForm(validValues({ displayOrder: 2 })).displayOrder,
    ).toBeDefined();
    expect(
      validateAnnouncementForm(validValues({ displayOrder: 1 })).displayOrder,
    ).toBeUndefined();
  });

  it("stores position and publication controls", () => {
    const insert = announcementFormToInsert(
      validValues({
        displayOrder: 1,
        isPublished: false,
      }),
      "abc12345",
    );
    expect(insert.display_order).toBe(1);
    expect(insert.is_published).toBe(false);
    expect(insert.publish_date).toBeDefined();
    expect(insert).not.toHaveProperty("link_label");
    expect(insert).not.toHaveProperty("link_url");
  });

  it("preserves removed metadata when updating an announcement", () => {
    const update = announcementFormToUpdate(
      validValues({ displayOrder: 1 }),
    );

    expect(update).not.toHaveProperty("publish_date");
    expect(update).not.toHaveProperty("link_label");
    expect(update).not.toHaveProperty("link_url");
  });
});
