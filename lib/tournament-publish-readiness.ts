import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnSiteCloseout } from "@/lib/on-site-closeout";
import type { Tournament } from "@/types/tournament";

type HistoricalEligibilitySnapshot = {
  eligible: boolean;
  reason: string;
  registrationId: string;
  competitiveRecordId: string;
  recordType: "team" | "solo";
  membershipSnapshot: unknown[] | null;
  reviewedAt: string;
  reviewedByAdminId: string;
  automated: true;
  matchRule: "exact_registration_display_name";
};

export type WorkingResultRow = {
  id: string;
  place: number | null;
  team_name: string;
  registration_id: string | null;
  competitive_record_id: string | null;
  record_type: "team" | "solo" | null;
  participation_status: "participated" | "withdrew_after_start" | "no_show" | "disqualified";
  aoy_eligible: boolean | null;
  aoy_eligibility_snapshot: Record<string, unknown> | null;
  eligibility_reviewed_at: string | null;
  eligibility_reviewed_by_admin_id: string | null;
};

export type RegistrationRow = {
  id: string;
  boat_number?: number | null;
  registration_type: "team" | "solo";
  angler1_name: string;
  angler2_name: string | null;
  competitive_record_id: string | null;
  identity_review_status: string;
  membership_snapshot: Array<{ eligibleForTournament?: boolean | null }> | null;
};

export type TournamentPublishReviewRegistration = Pick<
  RegistrationRow,
  | "id"
  | "registration_type"
  | "angler1_name"
  | "angler2_name"
  | "competitive_record_id"
  | "identity_review_status"
  | "membership_snapshot"
> & {
  boat_number: number | null;
  tournament_id: string;
};

export interface TournamentPublishReadinessBlocker {
  resultId: string;
  place: number | null;
  teamName: string;
  reason: string;
}

export interface TournamentPublishReadinessSyncResult {
  autoResolvedCount: number;
  manualReviewRows: TournamentPublishReadinessBlocker[];
  promoted: boolean;
  tournament: Tournament | null;
}

function normalizeDisplayName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function displayNameForRegistration(registration: RegistrationRow): string {
  return registration.registration_type === "team"
    ? `${registration.angler1_name} / ${registration.angler2_name ?? ""}`.trim()
    : registration.angler1_name;
}

function buildHistoricalEligibilityReason(
  registration: RegistrationRow,
  eligible: boolean,
): string {
  if (eligible) {
    return `Automated historical eligibility review: ${displayNameForRegistration(registration)} is backed by current AITT member eligibility evidence.`;
  }
  return `Automated historical eligibility review: one or more anglers on ${displayNameForRegistration(registration)} are not current AITT members.`;
}

function buildHistoricalEligibilitySnapshot(
  registration: RegistrationRow,
  eligible: boolean,
  reviewedAt: string,
  reviewedByAdminId: string,
): HistoricalEligibilitySnapshot {
  return {
    eligible,
    reason: buildHistoricalEligibilityReason(registration, eligible),
    registrationId: registration.id,
    competitiveRecordId: registration.competitive_record_id ?? "",
    recordType: registration.registration_type,
    membershipSnapshot: registration.membership_snapshot as unknown[] | null,
    reviewedAt,
    reviewedByAdminId,
    automated: true,
    matchRule: "exact_registration_display_name",
  };
}

function isHistoricalSnapshotComplete(row: WorkingResultRow): boolean {
  return Boolean(
    row.registration_id &&
      row.competitive_record_id &&
      row.record_type &&
      row.aoy_eligible !== null &&
      row.aoy_eligibility_snapshot &&
      row.eligibility_reviewed_at &&
      row.eligibility_reviewed_by_admin_id,
  );
}

function selectUnambiguousRegistration(
  row: WorkingResultRow,
  registrations: readonly RegistrationRow[],
): RegistrationRow | null {
  const normalizedTeamName = normalizeDisplayName(row.team_name);
  const matches = registrations.filter(
    (registration) =>
      normalizeDisplayName(displayNameForRegistration(registration)) ===
      normalizedTeamName,
  );

  if (matches.length !== 1) return null;
  const [match] = matches;
  if (!match.competitive_record_id) return null;
  if (match.identity_review_status === "review_required") return null;

  const membershipSnapshot = match.membership_snapshot;
  if (!Array.isArray(membershipSnapshot) || membershipSnapshot.length === 0) {
    return null;
  }
  if (membershipSnapshot.some((snapshot) => snapshot?.eligibleForTournament !== true)) {
    return match;
  }
  return match;
}

function deriveAoyEligibility(registration: RegistrationRow): boolean {
  const membershipSnapshot = registration.membership_snapshot;
  return Array.isArray(membershipSnapshot)
    && membershipSnapshot.length > 0
    && membershipSnapshot.every((snapshot) => snapshot?.eligibleForTournament === true);
}

export function buildTournamentPublishReadinessPlan(input: {
  resultRows: readonly WorkingResultRow[];
  registrations: readonly RegistrationRow[];
  reviewerAdminId: string | null;
}) {
  const reviewerAdminId = input.reviewerAdminId?.trim() ?? "";
  const autoResolvedRows: Array<{
    row: WorkingResultRow;
    registration: RegistrationRow;
    aoyEligible: boolean;
    snapshot: HistoricalEligibilitySnapshot;
  }> = [];
  const manualReviewRows = new Map<string, TournamentPublishReadinessBlocker>();
  const rowsByRegistration = new Map<string, WorkingResultRow[]>();
  for (const row of input.resultRows) {
    if (!row.registration_id) continue;
    rowsByRegistration.set(row.registration_id, [
      ...(rowsByRegistration.get(row.registration_id) ?? []),
      row,
    ]);
  }
  const duplicateResultIds = new Set<string>();
  for (const [registrationId, rows] of rowsByRegistration) {
    if (rows.length < 2) continue;
    const registration = input.registrations.find((item) => item.id === registrationId);
    const boat = registration?.boat_number ?? "—";
    const assignments = rows.map((row) => `Place ${row.place ?? "—"} — ${row.team_name}`).join(" and ");
    const reason = `Registration ${registrationId} (Boat #${boat}) is assigned to both ${assignments}. Choose a unique registration for each result.`;
    for (const row of rows) {
      duplicateResultIds.add(row.id);
      manualReviewRows.set(row.id, { resultId: row.id, place: row.place, teamName: row.team_name, reason });
    }
  }

  for (const row of input.resultRows) {
    if (duplicateResultIds.has(row.id)) continue;
    if (isHistoricalSnapshotComplete(row)) continue;

    const registration = selectUnambiguousRegistration(row, input.registrations);
    if (!registration) {
      manualReviewRows.set(row.id, {
        resultId: row.id,
        place: row.place,
        teamName: row.team_name,
        reason:
          `No unique active registration matches "${row.team_name}" exactly.`,
      });
      continue;
    }

    if (!reviewerAdminId) {
      manualReviewRows.set(row.id, {
        resultId: row.id,
        place: row.place,
        teamName: row.team_name,
        reason:
          `The tournament verification record is missing, so ${displayNameForRegistration(registration)} cannot be auto-reviewed.`,
      });
      continue;
    }

    const existingOwner = input.resultRows.find(
      (candidate) => candidate.id !== row.id && candidate.registration_id === registration.id,
    ) ?? autoResolvedRows.find(
      (candidate) => candidate.row.id !== row.id && candidate.registration.id === registration.id,
    )?.row;
    if (existingOwner) {
      const boat = registration.boat_number ?? "—";
      const reason = `Registration ${registration.id} (Boat #${boat}) is assigned to both Place ${existingOwner.place ?? "—"} — ${existingOwner.team_name} and Place ${row.place ?? "—"} — ${row.team_name}. Choose a unique registration for each result.`;
      manualReviewRows.set(existingOwner.id, {
        resultId: existingOwner.id,
        place: existingOwner.place,
        teamName: existingOwner.team_name,
        reason,
      });
      manualReviewRows.set(row.id, {
        resultId: row.id,
        place: row.place,
        teamName: row.team_name,
        reason,
      });
      const autoOwnerIndex = autoResolvedRows.findIndex(
        (candidate) => candidate.row.id === existingOwner.id,
      );
      if (autoOwnerIndex >= 0) autoResolvedRows.splice(autoOwnerIndex, 1);
      continue;
    }

    const aoyEligible = deriveAoyEligibility(registration);
    autoResolvedRows.push({
      row,
      registration,
      aoyEligible,
      snapshot: buildHistoricalEligibilitySnapshot(
        registration,
        aoyEligible,
        new Date().toISOString(),
        reviewerAdminId,
      ),
    });
  }

  return { autoResolvedRows, manualReviewRows: [...manualReviewRows.values()] };
}

export async function syncTournamentPublishReadiness(
  tournamentId: string,
): Promise<TournamentPublishReadinessSyncResult> {
  const supabase = createSupabaseServerClient();
  const [tournamentResult, closeoutResult, resultRowsResult, registrationResult] =
    await Promise.all([
      supabase
        .from("tournaments")
        .select(
          "id,season_id,name,slug,status,show_on_homepage,weighfish_imported,weighfish_imported_at,results_verified_at,results_verified_by,result_status,photos_reviewed,champion_photo_url,big_bass_photo_url,official_results_published_at,official_results_published_by,prepare_registration_review_complete,paper_membership_reminder_checked,updated_at,updated_by",
        )
        .eq("id", tournamentId)
        .maybeSingle(),
      getOnSiteCloseout(tournamentId),
      supabase
        .from("tournament_result_entries")
        .select(
          "id,place,team_name,registration_id,competitive_record_id,record_type,participation_status,aoy_eligible,aoy_eligibility_snapshot,eligibility_reviewed_at,eligibility_reviewed_by_admin_id",
        )
        .eq("tournament_id", tournamentId)
        .order("place", { ascending: true, nullsFirst: false }),
      supabase
        .from("tournament_registrations")
        .select(
          "id,boat_number,registration_type,angler1_name,angler2_name,competitive_record_id,identity_review_status,membership_snapshot",
        )
        .eq("tournament_id", tournamentId)
        .eq("registration_status", "active"),
    ]);

  if (tournamentResult.error) {
    throw new Error("The tournament could not be loaded for publish readiness.", {
      cause: tournamentResult.error,
    });
  }
  if (resultRowsResult.error) {
    throw new Error("The working results could not be loaded for publish readiness.", {
      cause: resultRowsResult.error,
    });
  }
  if (registrationResult.error) {
    throw new Error("The tournament registrations could not be loaded for publish readiness.", {
      cause: registrationResult.error,
    });
  }

  const tournament = tournamentResult.data as Tournament | null;
  if (!tournament) {
    return {
      autoResolvedCount: 0,
      manualReviewRows: [],
      promoted: false,
      tournament: null,
    };
  }

  if (
    !tournament.weighfish_imported_at ||
    !tournament.results_verified_at ||
    !tournament.results_verified_by
  ) {
    return {
      autoResolvedCount: 0,
      manualReviewRows: [],
      promoted: false,
      tournament,
    };
  }

  const resultRows = (resultRowsResult.data ?? []) as WorkingResultRow[];
  const registrations = (registrationResult.data ?? []) as RegistrationRow[];
  const reviewerAdminId = tournament.results_verified_by ?? tournament.updated_by ?? null;
  const plan = buildTournamentPublishReadinessPlan({
    resultRows,
    registrations,
    reviewerAdminId,
  });

  for (const entry of plan.autoResolvedRows) {
    const { error } = await supabase
      .from("tournament_result_entries")
      .update({
        registration_id: entry.registration.id,
        competitive_record_id: entry.registration.competitive_record_id,
        record_type: entry.registration.registration_type,
        aoy_eligible: entry.aoyEligible,
        aoy_eligibility_snapshot: entry.snapshot,
        eligibility_reviewed_at: entry.snapshot.reviewedAt,
        eligibility_reviewed_by_admin_id: entry.snapshot.reviewedByAdminId,
      })
      .eq("id", entry.row.id);
    if (error) {
      throw new Error("A working result could not be auto-reviewed.", {
        cause: error,
      });
    }
  }

  const refreshedRows = plan.autoResolvedRows.length
    ? await supabase
        .from("tournament_result_entries")
        .select(
          "id,place,team_name,registration_id,competitive_record_id,record_type,participation_status,aoy_eligible,aoy_eligibility_snapshot,eligibility_reviewed_at,eligibility_reviewed_by_admin_id",
        )
        .eq("tournament_id", tournamentId)
        .order("place", { ascending: true, nullsFirst: false })
    : resultRowsResult;

  if (refreshedRows.error) {
    throw new Error("The working results could not be rechecked for publish readiness.", {
      cause: refreshedRows.error,
    });
  }

  const refreshedRowsData = (refreshedRows.data ?? []) as WorkingResultRow[];
  const unresolvedRows = refreshedRowsData.filter((row) => !isHistoricalSnapshotComplete(row));
  const photosReady = Boolean(
    tournament.photos_reviewed &&
      tournament.champion_photo_url &&
      tournament.big_bass_photo_url,
  );
  const importReady = Boolean(
    tournament.weighfish_imported &&
      tournament.weighfish_imported_at &&
      tournament.results_verified_at &&
      tournament.results_verified_by &&
      tournament.result_status !== "pending",
  );
  const closeoutReady =
    closeoutResult?.status === "complete" &&
    closeoutResult.difference_cents === 0;
  const canPromote =
    importReady &&
    closeoutReady &&
    photosReady &&
    unresolvedRows.length === 0 &&
    plan.manualReviewRows.length === 0 &&
    tournament.result_status !== "official";

  let promoted = false;
  let updatedTournament = tournament;
  if (canPromote && tournament.result_status !== "ready_to_publish") {
    const { data, error } = await supabase
      .from("tournaments")
      .update({ result_status: "ready_to_publish" })
      .eq("id", tournamentId)
      .select(
        "id,season_id,name,slug,status,show_on_homepage,weighfish_imported,weighfish_imported_at,results_verified_at,results_verified_by,result_status,photos_reviewed,champion_photo_url,big_bass_photo_url,official_results_published_at,official_results_published_by,prepare_registration_review_complete,paper_membership_reminder_checked,updated_at,updated_by",
      )
      .single();
    if (error) {
      throw new Error("The tournament could not be promoted to publish-ready.", {
        cause: error,
      });
    }
    updatedTournament = data as Tournament;
    promoted = true;
  }

  return {
    autoResolvedCount: plan.autoResolvedRows.length,
    manualReviewRows: plan.manualReviewRows,
    promoted,
    tournament: updatedTournament,
  };
}

export async function listTournamentPublishReviewRegistrations(
  tournamentIds: readonly string[],
): Promise<Record<string, TournamentPublishReviewRegistration[]>> {
  if (!tournamentIds.length) return {};
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournament_registrations")
    .select(
      "id,tournament_id,boat_number,registration_type,angler1_name,angler2_name,competitive_record_id,identity_review_status,membership_snapshot",
    )
    .eq("registration_status", "active")
    .in("tournament_id", [...tournamentIds])
    .order("tournament_id", { ascending: true })
    .order("boat_number", { ascending: true, nullsFirst: true });

  if (error) {
    throw new Error("The tournament registrations could not be loaded for publish review.", {
      cause: error,
    });
  }

  const grouped = new Map<string, TournamentPublishReviewRegistration[]>();
  for (const row of (data ?? []) as TournamentPublishReviewRegistration[]) {
    const list = grouped.get(row.tournament_id) ?? [];
    list.push(row);
    grouped.set(row.tournament_id, list);
  }

  return Object.fromEntries(grouped);
}
