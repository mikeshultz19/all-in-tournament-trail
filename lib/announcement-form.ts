import type { AnnouncementInsert } from "@/types/announcement";

export const ANNOUNCEMENT_TITLE_MAX_LENGTH = 100;
export const ANNOUNCEMENT_CONTENT_MAX_LENGTH = 500;

export interface AnnouncementFormValues {
  tournamentId: string | null;
  title: string;
  content: string;
}

export interface AnnouncementFormErrors {
  tournamentId?: string;
  title?: string;
  content?: string;
}

export interface AnnouncementFormState {
  status: "idle" | "error";
  message: string;
  errors: AnnouncementFormErrors;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function announcementFormData(
  formData: FormData,
): AnnouncementFormValues {
  const tournamentId = String(formData.get("tournamentId") ?? "").trim();

  return {
    tournamentId: tournamentId || null,
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
  };
}

export function validateAnnouncementForm(
  values: AnnouncementFormValues,
): AnnouncementFormErrors {
  const errors: AnnouncementFormErrors = {};

  if (values.tournamentId && !UUID_PATTERN.test(values.tournamentId)) {
    errors.tournamentId = "Choose a valid event scope.";
  }

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
    ...(values.tournamentId
      ? { tournament_id: values.tournamentId }
      : {}),
    title: values.title,
    slug: announcementTitleToSlug(values.title, uniqueSuffix),
    content: values.content,
    is_pinned: false,
  };
}
