import { normalizeAnglerName } from "@/lib/identity-normalization";
import type { OnlineRegistrationAngler } from "@/lib/online-registration";
import type { Angler } from "@/types/aoy";

export type RegistrationIdentityReviewStatus =
  | "verified"
  | "review_required"
  | "approved_new"
  | "resolved_existing";

export interface ParticipantIdentityClassification {
  participantPosition: 1 | 2;
  status: "verified" | "review_required";
  reason: string | null;
  suggestedAnglerIds: string[];
}

export interface RegistrationIdentityClassification {
  status: "verified" | "review_required";
  participants: ParticipantIdentityClassification[];
}

export interface RegistrationIdentityClassificationOptions {
  activeTournamentAnglerIds?: ReadonlySet<string>;
}

export function summarizeRegistrationReviewStatuses(
  statuses: readonly RegistrationIdentityReviewStatus[],
): { total: number; verified: number; pending: number; resolved: number } {
  return statuses.reduce(
    (summary, status) => {
      summary.total += 1;
      if (status === "verified") summary.verified += 1;
      else if (status === "review_required") summary.pending += 1;
      else summary.resolved += 1;
      return summary;
    },
    { total: 0, verified: 0, pending: 0, resolved: 0 },
  );
}

export function normalizeIdentityPhone(
  value: string | null | undefined,
): string | null {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits.length >= 7 ? digits : null;
}

function normalizeEmail(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
}

function normalizeContactText(value: string | null | undefined): string {
  return value?.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ") ?? "";
}

export function classifyRegistrationIdentity(
  submittedAnglers: readonly OnlineRegistrationAngler[],
  canonicalAnglers: readonly Angler[],
  options: RegistrationIdentityClassificationOptions = {},
): RegistrationIdentityClassification {
  const active = canonicalAnglers.filter(
    (angler) => angler.is_active && !angler.merged_into_angler_id,
  );
  const activeTournamentAnglerIds = options.activeTournamentAnglerIds ?? new Set<string>();

  const participants = submittedAnglers.map(
    (submitted, index): ParticipantIdentityClassification => {
      const email = normalizeEmail(submitted.email);
      const phone = normalizeIdentityPhone(submitted.mobilePhone);
      const fullName = normalizeAnglerName(
        `${submitted.firstName} ${submitted.lastName}`,
      );
      const emailMatches = email
        ? active.filter(
            (angler) => normalizeEmail(angler.email) === email,
          )
        : [];
      const phoneMatches = phone
        ? active.filter(
            (angler) => normalizeIdentityPhone(angler.phone) === phone,
          )
        : [];
      const emailAndPhoneMatches = email && phone
        ? emailMatches.filter((emailAngler) =>
            phoneMatches.some((phoneAngler) => phoneAngler.id === emailAngler.id),
          )
        : [];
      const strongContactCandidates = new Map(
        [...emailMatches, ...phoneMatches].map((angler) => [angler.id, angler]),
      );
      const emailAndPhoneConflict =
        emailMatches.length > 0 &&
        phoneMatches.length > 0 &&
        emailMatches.every(
          (emailAngler) =>
            phoneMatches.every((phoneAngler) => phoneAngler.id !== emailAngler.id),
        );
      const soleContactCandidate =
        strongContactCandidates.size === 1
          ? [...strongContactCandidates.values()][0]
          : null;
      const soleHighConfidenceCandidate =
        emailAndPhoneMatches.length === 1
          ? emailAndPhoneMatches[0]
          : null;
      const materiallyDifferentContact = soleContactCandidate
        ? (
          Boolean(soleContactCandidate.phone) &&
          normalizeIdentityPhone(submitted.mobilePhone) !==
            normalizeIdentityPhone(soleContactCandidate.phone)
        ) || [
            [submitted.streetAddress, soleContactCandidate.street_address],
            [submitted.city, soleContactCandidate.city],
            [submitted.state, soleContactCandidate.state],
            [submitted.zipCode, soleContactCandidate.zip_code],
          ].some(
            ([submittedValue, canonicalValue]) =>
              normalizeContactText(canonicalValue) !== "" &&
              normalizeContactText(submittedValue) !==
                normalizeContactText(canonicalValue),
          )
        : false;

      const exactCandidates = new Set(
        [...emailMatches, ...phoneMatches].map((angler) => angler.id),
      );
      if (exactCandidates.size > 0) {
        const matchingCandidates = active.filter((angler) =>
          exactCandidates.has(angler.id),
        );
        const candidateNames = matchingCandidates
          .map((angler) => angler.display_name)
          .join(" and ");
        const duplicateTournamentCandidates = matchingCandidates.filter(
          (angler) => activeTournamentAnglerIds.has(angler.id),
        );
        const duplicateTournamentNames = duplicateTournamentCandidates
          .map((angler) => angler.display_name)
          .join(" and ");
        if (duplicateTournamentCandidates.length > 0) {
          return {
            participantPosition: (index + 1) as 1 | 2,
            status: "review_required",
            reason: `Possible duplicate tournament participation: ${duplicateTournamentNames} is already entered in this tournament.`,
            suggestedAnglerIds: [...exactCandidates],
          };
        }

        if (
          soleHighConfidenceCandidate &&
          !emailAndPhoneConflict &&
          emailMatches.length === 1 &&
          phoneMatches.length === 1
        ) {
          return {
            participantPosition: (index + 1) as 1 | 2,
            status: "verified",
            reason: null,
            suggestedAnglerIds: [soleHighConfidenceCandidate.id],
          };
        }

        const candidateNameDiffers = Boolean(
          soleContactCandidate &&
            soleContactCandidate.normalized_name !== fullName,
        );
        const reason = emailAndPhoneConflict
          ? "Submitted email and phone are associated with different existing anglers."
          : candidateNameDiffers && emailMatches.length > 0
            ? `Submitted email is already associated with ${candidateNames}.`
            : candidateNameDiffers && phoneMatches.length > 0
              ? `Submitted phone is already associated with ${candidateNames}.`
              : materiallyDifferentContact
                ? `Submitted contact information differs from ${candidateNames}.`
                : emailMatches.length > 0
                  ? `Submitted email is already associated with ${candidateNames}.`
                  : phoneMatches.length > 0
                    ? `Submitted phone is already associated with ${candidateNames}.`
                    : "Submitted identity may correspond to an existing angler.";
        return {
          participantPosition: (index + 1) as 1 | 2,
          status: "review_required",
          reason,
          suggestedAnglerIds: [...exactCandidates],
        };
      }

      const nameMatches = fullName
        ? active.filter((angler) => angler.normalized_name === fullName)
        : [];
      if (nameMatches.length > 0) {
        return {
          participantPosition: (index + 1) as 1 | 2,
          status: "review_required",
          reason: "Submitted name matches an existing angler, but strong contact identifiers do not match.",
          suggestedAnglerIds: nameMatches.map((angler) => angler.id),
        };
      }

      if (submitted.membership === "current") {
        return {
          participantPosition: (index + 1) as 1 | 2,
          status: "review_required",
          reason:
            "The submitted current membership could not be linked to one canonical Angler.",
          suggestedAnglerIds: [],
        };
      }

      return {
        participantPosition: (index + 1) as 1 | 2,
        status: "verified",
        reason: null,
        suggestedAnglerIds: [],
      };
    },
  );

  return {
    status: participants.some(
      (participant) => participant.status === "review_required",
    )
      ? "review_required"
      : "verified",
    participants,
  };
}
