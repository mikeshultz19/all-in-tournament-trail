import type {
  AnnouncementInsert,
  AnnouncementUpdate,
} from "@/types/announcement";

export const ANNOUNCEMENT_TITLE_MAX_LENGTH = 100;
export const ANNOUNCEMENT_CONTENT_MAX_LENGTH = 500;

export interface AnnouncementFormValues {
  title: string;
  content: string;
  publishDate: string;
  isPublished: boolean;
  linkLabel: string;
  linkUrl: string;
  displayOrder: number;
}

export interface AnnouncementFormErrors {
  title?: string;
  content?: string;
  publishDate?: string;
  linkLabel?: string;
  linkUrl?: string;
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
    publishDate: String(formData.get("publishDate") ?? "").trim(),
    isPublished: formData.get("isPublished") === "true",
    linkLabel: String(formData.get("linkLabel") ?? "").trim(),
    linkUrl: String(formData.get("linkUrl") ?? "").trim(),
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

  if (!values.publishDate || Number.isNaN(Date.parse(values.publishDate))) {
    errors.publishDate = "Enter a valid publish date.";
  }

  if (values.linkLabel && !values.linkUrl) {
    errors.linkUrl = "Enter a link URL or remove the link label.";
  } else if (!values.linkLabel && values.linkUrl) {
    errors.linkLabel = "Enter a link label or remove the link URL.";
  }

  if (
    values.linkUrl &&
    !values.linkUrl.startsWith("/") &&
    !/^https?:\/\/\S+$/i.test(values.linkUrl)
  ) {
    errors.linkUrl = "Enter a full http(s) URL or a site path beginning with /.";
  }

  if (!Number.isInteger(values.displayOrder) || values.displayOrder < 0) {
    errors.displayOrder = "Display order must be a whole number of 0 or greater.";
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
    publish_date: new Date(values.publishDate).toISOString(),
    is_published: values.isPublished,
    link_label: values.linkLabel || null,
    link_url: values.linkUrl || null,
    display_order: values.displayOrder,
  };
}

export function announcementFormToUpdate(
  values: AnnouncementFormValues,
): AnnouncementUpdate {
  return {
    title: values.title,
    content: values.content,
    publish_date: new Date(values.publishDate).toISOString(),
    is_published: values.isPublished,
    link_label: values.linkLabel || null,
    link_url: values.linkUrl || null,
    display_order: values.displayOrder,
  };
}
