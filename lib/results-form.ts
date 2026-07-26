import { tournamentDateTimeToUtc } from "@/lib/tournament-time";
import type { ResultEntry } from "@/types/results";

export const RESULT_TEAM_MAX_LENGTH = 100;
export const RESULT_MAX_ENTRIES = 100;

export interface ResultsFormValues {
  name: string;
  tournamentDate: string;
  lake: string;
  totalPayout: number;
  bronzePayout: number;
  silverPayout: number;
  goldPayout: number;
  insurancePotPayout: number;
  bigBassPayout: number;
  bigBassAngler: string;
  bigBassTeam: string;
  bigBassWeight: number;
  championImageUrl: string;
  bigBassImageUrl: string;
  entries: ResultEntry[];
}

export interface ResultsFormErrors {
  name?: string;
  tournamentDate?: string;
  lake?: string;
  totalPayout?: string;
  bronzePayout?: string;
  silverPayout?: string;
  goldPayout?: string;
  insurancePotPayout?: string;
  bigBassPayout?: string;
  bigBassAngler?: string;
  bigBassTeam?: string;
  bigBassWeight?: string;
  championImageUrl?: string;
  bigBassImageUrl?: string;
  entries?: string;
}

export interface ResultsFormState {
  status: "idle" | "success" | "error";
  message: string;
  errors: ResultsFormErrors;
}

function parseEntries(value: FormDataEntryValue | null): ResultEntry[] {
  if (typeof value !== "string") return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((entry, index) => {
      const record =
        entry && typeof entry === "object"
          ? (entry as Record<string, unknown>)
          : {};
      return {
        place: index + 1,
        team: typeof record.team === "string" ? record.team.trim() : "",
        weight: Number(record.weight),
      };
    });
  } catch {
    return [];
  }
}

export function resultsFormData(formData: FormData): ResultsFormValues {
  const totalPayout = String(formData.get("totalPayout") ?? "").trim();
  const bronzePayout = String(formData.get("bronzePayout") ?? "").trim();
  const silverPayout = String(formData.get("silverPayout") ?? "").trim();
  const goldPayout = String(formData.get("goldPayout") ?? "").trim();
  const insurancePotPayout = String(
    formData.get("insurancePotPayout") ?? "",
  ).trim();
  const bigBassPayout = String(formData.get("bigBassPayout") ?? "").trim();
  const bigBassAngler = String(formData.get("bigBassAngler") ?? "").trim();
  const bigBassTeam = String(formData.get("bigBassTeam") ?? "").trim();
  const bigBassWeight = String(formData.get("bigBassWeight") ?? "").trim();
  const championImageUrl = String(
    formData.get("championImageUrl") ?? "",
  ).trim();
  const bigBassImageUrl = String(formData.get("bigBassImageUrl") ?? "").trim();

  return {
    name: String(formData.get("name") ?? "").trim(),
    tournamentDate: String(formData.get("tournamentDate") ?? "").trim(),
    lake: String(formData.get("lake") ?? "").trim(),
    totalPayout: totalPayout ? Number(totalPayout) : Number.NaN,
    bronzePayout: bronzePayout ? Number(bronzePayout) : Number.NaN,
    silverPayout: silverPayout ? Number(silverPayout) : Number.NaN,
    goldPayout: goldPayout ? Number(goldPayout) : Number.NaN,
    insurancePotPayout: insurancePotPayout
      ? Number(insurancePotPayout)
      : Number.NaN,
    bigBassPayout: bigBassPayout ? Number(bigBassPayout) : Number.NaN,
    bigBassAngler,
    bigBassTeam,
    bigBassWeight: bigBassWeight ? Number(bigBassWeight) : Number.NaN,
    championImageUrl,
    bigBassImageUrl,
    entries: parseEntries(formData.get("entries")),
  };
}

export function validateResultsForm(
  values: ResultsFormValues,
): ResultsFormErrors {
  const errors: ResultsFormErrors = {};

  if (!values.name) errors.name = "Enter the tournament name.";
  if (!values.lake) errors.lake = "Enter the lake or location.";
  if (!Number.isFinite(values.totalPayout) || values.totalPayout < 0) {
    errors.totalPayout = "Enter a valid payout of zero or more.";
  }
  for (const [field, value, name] of [
    ["bronzePayout", values.bronzePayout, "Bronze"],
    ["silverPayout", values.silverPayout, "Silver"],
    ["goldPayout", values.goldPayout, "Gold"],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      errors[field] = `Enter a valid ${name} payout of zero or more.`;
    }
  }
  if (
    !Number.isFinite(values.insurancePotPayout) ||
    values.insurancePotPayout < 0
  ) {
    errors.insurancePotPayout =
      "Enter a valid Insurance Pot payout of zero or more.";
  }
  if (!Number.isFinite(values.bigBassPayout) || values.bigBassPayout < 0) {
    errors.bigBassPayout = "Enter a valid Big Bass payout of zero or more.";
  }
  if (!values.bigBassAngler) {
    errors.bigBassAngler = "Enter the Big Bass angler name.";
  }
  if (!values.bigBassTeam) {
    errors.bigBassTeam = "Enter the Big Bass team name.";
  }
  if (!Number.isFinite(values.bigBassWeight) || values.bigBassWeight < 0) {
    errors.bigBassWeight = "Enter a valid Big Bass weight of zero or more.";
  }

  const [date, time] = values.tournamentDate.split("T");
  try {
    tournamentDateTimeToUtc(date, time);
  } catch {
    errors.tournamentDate = "Enter a valid tournament date and time.";
  }

  if (values.entries.length === 0) {
    errors.entries = "Add at least one result.";
  } else if (values.entries.length > RESULT_MAX_ENTRIES) {
    errors.entries = `Limit results to ${RESULT_MAX_ENTRIES} entries.`;
  } else if (
    values.entries.some(
      (entry) =>
        !entry.team ||
        entry.team.length > RESULT_TEAM_MAX_LENGTH ||
        !Number.isFinite(entry.weight) ||
        entry.weight < 0,
    )
  ) {
    errors.entries = "Each result needs a team name and valid weight.";
  }

  return errors;
}

export function resultsDateToTimestamp(value: string): string {
  const [date, time] = value.split("T");
  return tournamentDateTimeToUtc(date, time).toISOString();
}
