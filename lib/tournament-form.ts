import { tournamentDateTimeToUtc } from "@/lib/tournament-time";
import {
  TOURNAMENT_STATUSES,
  type Tournament,
  type TournamentFormValues,
  type TournamentStatus,
  type TournamentUpdate,
} from "@/types/tournament";

export interface TournamentFormErrors {
  name?: string;
  lake?: string;
  tournamentDate?: string;
  registrationCloses?: string;
  status?: string;
  heroImageUrl?: string;
}

export interface TournamentFormState {
  status: "idle" | "success" | "error";
  message: string;
  errors: TournamentFormErrors;
}

function timestampToInputValue(timestamp: string | null): string {
  if (!timestamp) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function inputValueToTimestamp(value: string): string | null {
  if (!value) {
    return null;
  }

  const [date, time] = value.split("T");

  try {
    return tournamentDateTimeToUtc(date, time).toISOString();
  } catch {
    return null;
  }
}

export function tournamentToFormValues(
  tournament: Tournament,
): TournamentFormValues {
  return {
    name: tournament.name,
    lake: tournament.lake,
    tournamentDate: timestampToInputValue(tournament.tournament_date),
    description: tournament.description ?? "",
    ramp: tournament.ramp ?? "",
    launchType: tournament.launch_type ?? "",
    morningRegistration: tournament.morning_registration ?? "",
    registrationOpens: timestampToInputValue(tournament.registration_opens),
    registrationCloses: timestampToInputValue(tournament.registration_closes),
    status: tournament.status,
    heroImageUrl: tournament.hero_image_url ?? "",
    isFeatured: tournament.is_featured,
    showOnHomepage: tournament.show_on_homepage,
  };
}

export function tournamentFormData(formData: FormData): TournamentFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    lake: String(formData.get("lake") ?? "").trim(),
    tournamentDate: String(formData.get("tournamentDate") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    ramp: String(formData.get("ramp") ?? "").trim(),
    launchType: String(formData.get("launchType") ?? "").trim(),
    morningRegistration: String(
      formData.get("morningRegistration") ?? "",
    ).trim(),
    registrationOpens: String(
      formData.get("registrationOpens") ?? "",
    ).trim(),
    registrationCloses: String(
      formData.get("registrationCloses") ?? "",
    ).trim(),
    status: String(formData.get("status") ?? "") as TournamentStatus,
    heroImageUrl: String(formData.get("heroImageUrl") ?? "").trim(),
    isFeatured: formData.get("isFeatured") === "on",
    showOnHomepage: formData.get("showOnHomepage") === "on",
  };
}

export function validateTournamentForm(
  values: TournamentFormValues,
): TournamentFormErrors {
  const errors: TournamentFormErrors = {};
  const tournamentDate = inputValueToTimestamp(values.tournamentDate);
  const registrationOpens = inputValueToTimestamp(values.registrationOpens);
  const registrationCloses = inputValueToTimestamp(values.registrationCloses);

  if (!values.name) {
    errors.name = "Enter the tournament name.";
  }

  if (!values.lake) {
    errors.lake = "Enter the lake.";
  }

  if (!tournamentDate) {
    errors.tournamentDate = "Enter a valid tournament date and time.";
  }

  if (
    values.registrationOpens &&
    values.registrationCloses &&
    registrationOpens &&
    registrationCloses &&
    new Date(registrationCloses) < new Date(registrationOpens)
  ) {
    errors.registrationCloses =
      "Registration closing time must be after registration opens.";
  }

  if (
    !TOURNAMENT_STATUSES.includes(values.status as TournamentStatus)
  ) {
    errors.status = "Choose a valid tournament status.";
  }

  if (values.heroImageUrl) {
    try {
      new URL(values.heroImageUrl, "https://aitt.local");
    } catch {
      errors.heroImageUrl = "Enter a valid hero image URL.";
    }
  }

  return errors;
}

export function tournamentFormToUpdate(
  values: TournamentFormValues,
): TournamentUpdate {
  return {
    name: values.name,
    lake: values.lake,
    tournament_date: inputValueToTimestamp(values.tournamentDate) ?? "",
    description: values.description || null,
    ramp: values.ramp || null,
    launch_type: values.launchType || null,
    morning_registration: values.morningRegistration || null,
    registration_opens: inputValueToTimestamp(values.registrationOpens),
    registration_closes: inputValueToTimestamp(values.registrationCloses),
    status: values.status,
    hero_image_url: values.heroImageUrl || null,
    is_featured: values.isFeatured,
    show_on_homepage: values.showOnHomepage,
    updated_by: "AITT Staff",
  };
}
