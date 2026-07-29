import { createHash } from "node:crypto";

import {
  createCanonicalCompetitiveRecordKey,
  normalizeAnglerName,
} from "@/lib/identity-normalization";
import type {
  Angler,
  CompetitiveRecordType,
  TeamWithMembers,
  TournamentRegistration,
} from "@/types/aoy";
import type {
  IdentityCandidate,
  IdentityMatchResult,
  SourceAnglerIdentity,
} from "@/types/identity-reconciliation";

export interface ImportedParticipant {
  sourceIdentityKey?: string | null;
  displayName: string;
  email?: string | null;
  metadata?: Record<string, unknown>;
}

export interface PreparedImportedParticipant {
  sourceIdentityKey: string;
  displayName: string;
  normalizedName: string;
  metadata: Record<string, unknown>;
}

function normalizeEmail(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
}

export function createDeterministicSourceIdentityKey(
  sourceSystem: string,
  displayName: string,
  trustedEmail?: string | null,
): string {
  const source = sourceSystem.trim().toLowerCase();
  const normalizedName = normalizeAnglerName(displayName);
  const normalizedEmail = normalizeEmail(trustedEmail);
  const identityMaterial = [
    source,
    normalizedEmail ? `email:${normalizedEmail}` : `name:${normalizedName}`,
  ].join("|");

  return `derived:${createHash("sha256")
    .update(identityMaterial)
    .digest("hex")}`;
}

export function prepareImportedParticipant(
  sourceSystem: string,
  participant: ImportedParticipant,
): PreparedImportedParticipant {
  const displayName = participant.displayName.trim();
  const normalizedName = normalizeAnglerName(displayName);
  const email = normalizeEmail(participant.email);

  if (!sourceSystem.trim() || !displayName || !normalizedName) {
    throw new Error("A source system and imported display name are required.");
  }

  return {
    sourceIdentityKey:
      participant.sourceIdentityKey?.trim() ||
      createDeterministicSourceIdentityKey(
        sourceSystem,
        displayName,
        email,
      ),
    displayName,
    normalizedName,
    metadata: {
      ...(participant.metadata ?? {}),
      ...(email ? { email } : {}),
    },
  };
}

function candidate(
  angler: Angler,
  method: IdentityCandidate["method"],
): IdentityCandidate {
  return { angler, method };
}

export function matchSourceAnglerIdentity(
  sourceIdentity: Pick<
    SourceAnglerIdentity,
    "angler_id" | "reconciliation_status" | "normalized_name" | "source_metadata"
  >,
  anglers: readonly Angler[],
): IdentityMatchResult {
  if (
    sourceIdentity.reconciliation_status === "confirmed" &&
    sourceIdentity.angler_id
  ) {
    return {
      status: "confirmed",
      anglerId: sourceIdentity.angler_id,
      method: "confirmed_alias",
      candidates: [],
    };
  }

  const trustedEmail =
    typeof sourceIdentity.source_metadata.email === "string"
      ? normalizeEmail(sourceIdentity.source_metadata.email)
      : null;
  const activeAnglers = anglers.filter(
    (angler) => angler.is_active && !angler.merged_into_angler_id,
  );

  if (trustedEmail) {
    const emailMatches = activeAnglers.filter(
      (angler) => normalizeEmail(angler.email) === trustedEmail,
    );

    if (emailMatches.length === 1) {
      return {
        status: "confirmed",
        anglerId: emailMatches[0].id,
        method: "trusted_email",
        candidates: [candidate(emailMatches[0], "trusted_email")],
      };
    }

    if (emailMatches.length > 1) {
      return {
        status: "review_required",
        anglerId: null,
        method: "ambiguous_exact_match",
        candidates: emailMatches.map((angler) =>
          candidate(angler, "trusted_email"),
        ),
        code: "AITT_IDENTITY_REVIEW_REQUIRED",
      };
    }
  }

  const exactMatches = activeAnglers.filter(
    (angler) => angler.normalized_name === sourceIdentity.normalized_name,
  );

  if (exactMatches.length === 1) {
    return {
      status: "confirmed",
      anglerId: exactMatches[0].id,
      method: "exact_normalized_name",
      candidates: [
        candidate(exactMatches[0], "exact_normalized_name"),
      ],
    };
  }

  if (exactMatches.length > 1) {
    return {
      status: "review_required",
      anglerId: null,
      method: "ambiguous_exact_match",
      candidates: exactMatches.map((angler) =>
        candidate(angler, "exact_normalized_name"),
      ),
      code: "AITT_IDENTITY_REVIEW_REQUIRED",
    };
  }

  const tokens = sourceIdentity.normalized_name.split(" ").filter(Boolean);
  const partialMatches =
    tokens.length === 0
      ? []
      : activeAnglers.filter((angler) =>
          tokens.every((token) => angler.normalized_name.includes(token)),
        );

  if (partialMatches.length > 0) {
    return {
      status: "suggested",
      anglerId: null,
      method: "partial_name",
      candidates: partialMatches.map((angler) =>
        candidate(angler, "partial_name"),
      ),
    };
  }

  return {
    status: "unresolved",
    anglerId: null,
    method: "no_match",
    candidates: [],
  };
}

export function findCompetitiveRecordByMembers(
  recordType: CompetitiveRecordType,
  anglerIds: readonly string[],
  records: readonly TeamWithMembers[],
): TeamWithMembers | null {
  const canonicalKey = createCanonicalCompetitiveRecordKey(
    recordType,
    anglerIds,
  );

  return (
    records.find(
      (record) =>
        record.record_type === recordType &&
        record.canonical_member_key === canonicalKey,
    ) ?? null
  );
}

export function findRegistrationEvidence(
  tournamentId: string,
  recordType: CompetitiveRecordType,
  canonicalAnglerIds: readonly string[],
  registrations: readonly TournamentRegistration[],
): TournamentRegistration | null {
  const expectedKey = createCanonicalCompetitiveRecordKey(
    recordType,
    canonicalAnglerIds,
  );

  const matches = registrations.filter((registration) => {
    if (
      registration.tournament_id !== tournamentId ||
      registration.registration_type !== recordType ||
      !registration.competitive_record_id
    ) {
      return false;
    }

    const registeredIds = [
      registration.angler1_id,
      registration.angler2_id,
    ].filter((id): id is string => Boolean(id));

    return (
      registeredIds.length === canonicalAnglerIds.length &&
      createCanonicalCompetitiveRecordKey(recordType, registeredIds) ===
        expectedKey
    );
  });

  return matches.length === 1 ? matches[0] : null;
}
