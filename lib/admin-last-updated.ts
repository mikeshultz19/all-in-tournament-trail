export type AdminUpdateStatus = "recent" | "aging" | "old" | "never";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function isSameLocalDate(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function formatAdminLastUpdated(
  value: string | Date | null,
  now = new Date(),
  locale?: string,
): string {
  if (value === null) {
    return "Never";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never";
  }

  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (isSameLocalDate(date, now)) {
    return `Today at ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameLocalDate(date, yesterday)) {
    return `Yesterday at ${time}`;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getAdminUpdateStatus(
  value: string | Date | null,
  now = new Date(),
): AdminUpdateStatus {
  if (value === null) {
    return "never";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "never";
  }

  const ageInDays = (now.getTime() - date.getTime()) / DAY_IN_MILLISECONDS;

  if (ageInDays > 90) {
    return "old";
  }

  if (ageInDays > 30) {
    return "aging";
  }

  return "recent";
}
