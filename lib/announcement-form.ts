import type {
  AnnouncementInsert,
  AnnouncementUpdate,
} from "@/types/announcement";

export const ANNOUNCEMENT_TITLE_MAX_LENGTH = 100;
export const ANNOUNCEMENT_CONTENT_MAX_LENGTH = 500;

export interface AnnouncementFormValues {
  title: string;
  content: string;
  isPublished: boolean;
  displayOrder: number;
}

export interface AnnouncementFormErrors {
  title?: string;
  content?: string;
  displayOrder?: string;
}

export interface AnnouncementFormState {
  status: "idle" | "error";
  message: string;
  errors: AnnouncementFormErrors;
}

export function announcementFormData(
  formData: FormData,
): AnnouncementFormValues {
  return {
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    isPublished: formData.get("isPublished") === "true",
    displayOrder: Number(formData.get("displayOrder") ?? 0),
  };
}

export function validateAnnouncementForm(
  values: AnnouncementFormValues,
): AnnouncementFormErrors {
  const errors: AnnouncementFormErrors = {};

  if (!values.title) {
    errors.title = "Enter an announcement title.";
  } else if (values.title.length > ANNOUNCEMENT_TITLE_MAX_LENGTH) {
    errors.title = `Keep the title to ${ANNOUNCEMENT_TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (!values.content) {
    errors.content = "Enter the announcement.";
  } else if (values.content.length > ANNOUNCEMENT_CONTENT_MAX_LENGTH) {
    errors.content = `Keep the announcement to ${ANNOUNCEMENT_CONTENT_MAX_LENGTH} characters or fewer.`;
  }

  if (values.displayOrder !== 0 && values.displayOrder !== 1) {
    errors.displayOrder = "Choose Top Announcement or Second Announcement.";
  }

  return errors;
}

export function announcementTitleToSlug(
  title: string,
  uniqueSuffix = crypto.randomUUID().slice(0, 8),
): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

  return `${base || "announcement"}-${uniqueSuffix}`;
}

export function announcementFormToInsert(
  values: AnnouncementFormValues,
  uniqueSuffix?: string,
): AnnouncementInsert {
  return {
    title: values.title,
    slug: announcementTitleToSlug(values.title, uniqueSuffix),
    content: values.content,
    publish_date: new Date().toISOString(),
    is_published: values.isPublished,
    display_order: values.displayOrder,
  };
}

export function announcementFormToUpdate(
  values: AnnouncementFormValues,
): AnnouncementUpdate {
  return {
    title: values.title,
    content: values.content,
    is_published: values.isPublished,
    display_order: values.displayOrder,
  };
}
