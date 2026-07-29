import {
  MEMBERSHIP_STATUSES,
  type MembershipStatus,
} from "@/types/aoy";

export interface AddMemberFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  seasonId: string;
  status: MembershipStatus;
  effectiveDate: string;
  firstEligibleTournamentId: string;
}

export interface AddMemberFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  seasonId?: string;
  status?: string;
  effectiveDate?: string;
  firstEligibleTournamentId?: string;
}

export interface AddMemberFormState {
  status: "idle" | "error";
  message: string;
  errors: AddMemberFormErrors;
  duplicateAnglerId?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function addMemberFormData(formData: FormData): AddMemberFormValues {
  return {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    seasonId: String(formData.get("seasonId") ?? "").trim(),
    status: String(formData.get("status") ?? "") as MembershipStatus,
    effectiveDate: String(formData.get("effectiveDate") ?? "").trim(),
    firstEligibleTournamentId: String(
      formData.get("firstEligibleTournamentId") ?? "",
    ).trim(),
  };
}

export function validateAddMemberForm(
  values: AddMemberFormValues,
): AddMemberFormErrors {
  const errors: AddMemberFormErrors = {};

  if (!values.firstName) {
    errors.firstName = "First name is required.";
  }

  if (!values.lastName) {
    errors.lastName = "Last name is required.";
  }

  if (values.email && !EMAIL_PATTERN.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.seasonId) {
    errors.seasonId = "An active membership season is required.";
  }

  if (!MEMBERSHIP_STATUSES.includes(values.status)) {
    errors.status = "Select a valid membership status.";
  }

  if (
    !DATE_PATTERN.test(values.effectiveDate) ||
    Number.isNaN(new Date(`${values.effectiveDate}T12:00:00Z`).getTime())
  ) {
    errors.effectiveDate = "Enter a valid membership effective date.";
  }

  if (!values.firstEligibleTournamentId) {
    errors.firstEligibleTournamentId =
      "Select the first tournament for which this member is eligible.";
  }

  return errors;
}
