import "server-only";

import { createHash } from "node:crypto";

import { loadOfficialAoySource } from "@/lib/aoy-engine";
import { calculateChampionshipQualification } from "@/lib/championship-qualification-core";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AoyOfficialResultInput } from "@/types/aoy-engine";
import type {
  ChampionshipParticipationRecord,
  ChampionshipQualification,
  ChampionshipQualificationResult,
} from "@/types/championship-qualification";

function sourceFingerprint(source: readonly AoyOfficialResultInput[]) {
  return createHash("sha256")
    .update(
      JSON.stringify(
        [...source]
          .sort((a, b) =>
            a.officialResultId.localeCompare(b.officialResultId),
          )
          .map((row) => ({
            officialResultId: row.officialResultId,
            publicationId: row.publicationId,
            seasonId: row.seasonId,
            tournamentId: row.tournamentId,
            regularSeasonNumber: row.regularSeasonNumber,
            registrationId: row.registrationId,
            competitiveRecordId: row.competitiveRecordId,
            recordType: row.recordType,
            participationStatus: row.participationStatus,
            aoyEligible: row.aoyEligible,
            sourceUpdatedAt: row.sourceUpdatedAt,
          })),
      ),
    )
    .digest("hex");
}

function participationPayload(row: ChampionshipParticipationRecord) {
  return {
    tournament_id: row.tournamentId,
    regular_season_number: row.regularSeasonNumber,
    registration_id: row.registrationId,
    official_result_entry_id: row.officialResultId,
    publication_audit_id: row.publicationId,
    competitive_record_id: row.competitiveRecordId,
    record_type: row.recordType,
    participation_status: row.participationStatus,
    historically_eligible: row.historicallyEligible,
    counts_toward_qualification: row.countsTowardQualification,
    exclusion_reason: row.exclusionReason,
    calculated_at: row.calculatedAt,
  };
}

function qualificationPayload(row: ChampionshipQualification) {
  return {
    competitive_record_id: row.competitiveRecordId,
    display_name: row.displayName,
    record_type: row.recordType,
    canonical_members: row.canonicalMembers,
    official_participations: row.officialParticipations,
    qualifying_tournament_numbers: row.qualifyingTournaments.map(
      (item) => item.regularSeasonNumber,
    ),
    nonqualifying_official_result_ids: row.nonqualifyingOfficialResults.map(
      (item) => item.officialResultId,
    ),
    remaining_participation_count: row.remainingParticipationCount,
    uncredited_regular_season_numbers: row.uncreditedRegularSeasonNumbers,
    qualification_status: row.qualificationStatus,
    qualified_at: row.qualifiedAt,
    calculated_at: row.lastRecalculatedAt,
  };
}

export async function rebuildSeasonChampionshipQualification(
  seasonId: string,
  adminUserId: string,
): Promise<ChampionshipQualificationResult> {
  const source = await loadOfficialAoySource(seasonId);
  const result = calculateChampionshipQualification(seasonId, source);
  const { error } = await createSupabaseServerClient().rpc(
    "replace_championship_qualification_projection",
    {
      p_season_id: seasonId,
      p_source_fingerprint: sourceFingerprint(source),
      p_calculation_version: result.calculationVersion,
      p_participations: result.participations.map(participationPayload),
      p_qualifications: result.qualifications.map(qualificationPayload),
      p_admin_user_id: adminUserId,
    },
  );
  if (error) {
    throw new Error("Championship qualification could not be saved.", {
      cause: error,
    });
  }
  return result;
}

export async function rebuildChampionshipQualificationForTournament(
  tournamentId: string,
  adminUserId: string,
) {
  const { data, error } = await createSupabaseServerClient()
    .from("tournaments")
    .select("season_id")
    .eq("id", tournamentId)
    .single();
  if (error || !data?.season_id) throw new Error("Tournament season not found.");
  return rebuildSeasonChampionshipQualification(data.season_id, adminUserId);
}

/**
 * Rebuilds the owning season after a documented Official Result correction.
 * The Official Result remains the source of truth; this only refreshes the
 * derived Championship projection.
 */
export async function rebuildChampionshipQualificationForOfficialResult(
  officialResultEntryId: string,
  adminUserId: string,
) {
  const supabase = createSupabaseServerClient();
  const officialResult = await supabase
    .from("official_result_entries")
    .select("tournament_id")
    .eq("id", officialResultEntryId)
    .single();
  if (officialResult.error || !officialResult.data?.tournament_id) {
    throw new Error("Official Result tournament not found.");
  }
  return rebuildChampionshipQualificationForTournament(
    officialResult.data.tournament_id,
    adminUserId,
  );
}

export async function getSeasonChampionshipQualifications(
  seasonId: string,
): Promise<ChampionshipQualification[]> {
  const supabase = createSupabaseServerClient();
  const [qualificationResult, participationResult] = await Promise.all([
    supabase
      .from("current_championship_qualifications")
      .select("*")
      .eq("season_id", seasonId)
      .order("display_name", { ascending: true }),
    supabase
      .from("current_championship_participations")
      .select("*")
      .eq("season_id", seasonId)
      .order("regular_season_number", { ascending: true }),
  ]);
  if (qualificationResult.error || participationResult.error) {
    throw new Error("Championship qualifications could not be loaded.", {
      cause: qualificationResult.error ?? participationResult.error,
    });
  }

  const participations = (participationResult.data ?? []).map((row) => ({
    officialResultId: String(row.official_result_entry_id),
    publicationId: String(row.publication_audit_id),
    seasonId: String(row.season_id),
    tournamentId: String(row.tournament_id),
    regularSeasonNumber: Number(row.regular_season_number),
    registrationId: String(row.registration_id),
    competitiveRecordId: String(row.competitive_record_id),
    recordType:
      row.record_type as ChampionshipParticipationRecord["recordType"],
    participationStatus:
      row.participation_status as ChampionshipParticipationRecord["participationStatus"],
    historicallyEligible: Boolean(row.historically_eligible),
    countsTowardQualification: Boolean(row.counts_toward_qualification),
    exclusionReason:
      row.exclusion_reason as ChampionshipParticipationRecord["exclusionReason"],
    calculatedAt: String(row.calculated_at),
  }));

  return (qualificationResult.data ?? []).map((row) => {
    const recordRows = participations.filter(
      (item) => item.competitiveRecordId === row.competitive_record_id,
    );
    return {
      competitiveRecordId: row.competitive_record_id,
      displayName: row.display_name,
      recordType: row.record_type,
      canonicalMembers:
        row.canonical_members as ChampionshipQualification["canonicalMembers"],
      officialParticipations: Number(row.official_participations),
      qualifyingTournaments: recordRows.filter(
        (item) => item.countsTowardQualification,
      ),
      nonqualifyingOfficialResults: recordRows.filter(
        (item) => !item.countsTowardQualification,
      ),
      remainingParticipationCount: Number(row.remaining_participation_count),
      uncreditedRegularSeasonNumbers:
        row.uncredited_regular_season_numbers as number[],
      qualificationStatus: row.qualification_status,
      qualifiedAt: row.qualified_at,
      lastRecalculatedAt: row.calculated_at,
    };
  });
}
