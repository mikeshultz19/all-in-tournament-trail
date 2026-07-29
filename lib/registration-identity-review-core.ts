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

export function classifyRegistrationIdentity(
  submittedAnglers: readonly OnlineRegistrationAngler[],
  canonicalAnglers: readonly Angler[],
): RegistrationIdentityClassification {
  const active = canonicalAnglers.filter(
    (angler) => angler.is_active && !angler.merged_into_angler_id,
  );

  const participants = submittedAnglers.map(
    (submitted, index): ParticipantIdentityClassification => {
      const email = normalizeEmail(submitted.email);
      const phone = normalizeIdentityPhone(submitted.mobilePhone);
      const fullName = normalizeAnglerName(
        `${submitted.firstName} ${submitted.lastName}`,
      );
      const lastName = normalizeAnglerName(submitted.lastName);
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
      const nameMatches = active.filter(
        (angler) => angler.normalized_name === fullName,
      );

      if (
        emailMatches.length === 1 &&
        (phoneMatches.length === 0 ||
          phoneMatches.every((angler) => angler.id === emailMatches[0].id))
      ) {
        return {
          participantPosition: (index + 1) as 1 | 2,
          status: "verified",
          reason: null,
          suggestedAnglerIds: [emailMatches[0].id],
        };
      }

      const exactCandidates = new Set(
        [...emailMatches, ...phoneMatches, ...nameMatches].map(
          (angler) => angler.id,
        ),
      );
      if (exactCandidates.size > 0) {
        return {
          participantPosition: (index + 1) as 1 | 2,
          status: "review_required",
          reason:
            exactCandidates.size > 1
              ? "Multiple canonical Anglers match the submitted identity."
              : "Submitted contact or name information differs from an existing Angler.",
          suggestedAnglerIds: [...exactCandidates],
        };
      }

      const possibleNameCandidates = active.filter((angler) => {
        const canonicalLastName = normalizeAnglerName(angler.last_name);
        const submittedFirst = normalizeAnglerName(submitted.firstName);
        const canonicalFirst = normalizeAnglerName(angler.first_name);

        return (
          canonicalLastName === lastName &&
          (submittedFirst.startsWith(canonicalFirst) ||
            canonicalFirst.startsWith(submittedFirst) ||
            submittedFirst[0] === canonicalFirst[0])
        );
      });

      if (possibleNameCandidates.length > 0) {
        return {
          participantPosition: (index + 1) as 1 | 2,
          status: "review_required",
          reason:
            "A possible spelling or nickname difference requires review.",
          suggestedAnglerIds: possibleNameCandidates.map(
            (angler) => angler.id,
          ),
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
