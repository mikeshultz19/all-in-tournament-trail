import "server-only";

import { createHash } from "node:crypto";

import { calculateAoyStandings } from "@/lib/aoy-engine-core";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AoyCalculationResult,
  AoyOfficialResultInput,
  AoyStanding,
  AoyTournamentPerformance,
} from "@/types/aoy-engine";

type Relation<T> = T | T[] | null;

interface OfficialRow {
  id: string;
  tournament_id: string;
  registration_id: string;
  competitive_record_id: string;
  record_type: "team" | "solo";
  place: number | null;
  total_weight: number | string;
  penalty_weight: number | string;
  participation_status: AoyOfficialResultInput["participationStatus"];
  aoy_eligible: boolean;
  aoy_eligibility_snapshot: unknown;
  published_at: string;
}

function one<T>(value: Relation<T>): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function fingerprintSource(source: readonly AoyOfficialResultInput[]): string {
  const canonical = [...source]
    .sort((a, b) => a.officialResultId.localeCompare(b.officialResultId))
    .map(({ canonicalMembers, displayName, ...row }) => ({
      ...row,
      displayName,
      canonicalMembers: [...canonicalMembers].sort((a, b) =>
        a.id.localeCompare(b.id),
      ),
    }));
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export async function loadOfficialAoySource(
  seasonId: string,
): Promise<AoyOfficialResultInput[]> {
  const supabase = createSupabaseServerClient();
  const tournamentResult = await supabase
    .from("tournaments")
    .select(
      "id,season_id,regular_season_number,result_status,event_type,status",
    )
    .eq("season_id", seasonId)
    .eq("result_status", "official")
    .eq("event_type", "regular_season")
    .order("regular_season_number", { ascending: true });
  if (tournamentResult.error) {
    throw new Error("Official AOY tournaments could not be loaded.", {
      cause: tournamentResult.error,
    });
  }
  const tournaments = tournamentResult.data ?? [];
  if (!tournaments.length) return [];
  const tournamentIds = tournaments.map((item) => item.id);

  const [officialResult, publicationResult] = await Promise.all([
    supabase
      .from("official_result_entries")
      .select(
        "id,tournament_id,registration_id,competitive_record_id,record_type,place,total_weight,penalty_weight,participation_status,aoy_eligible,aoy_eligibility_snapshot,published_at",
      )
      .in("tournament_id", tournamentIds),
    supabase
      .from("official_results_publication_audit")
      .select("id,tournament_id")
      .in("tournament_id", tournamentIds),
  ]);
  if (officialResult.error || publicationResult.error) {
    throw new Error("Official AOY source results could not be loaded.", {
      cause: officialResult.error ?? publicationResult.error,
    });
  }
  const officialRows = (officialResult.data ?? []) as OfficialRow[];
  const recordIds = [
    ...new Set(officialRows.map((row) => row.competitive_record_id)),
  ];
  const recordResult = recordIds.length
    ? await supabase
        .from("teams")
        .select(
          "id,display_name,record_type,members:team_members(angler:anglers(id,display_name))",
        )
        .in("id", recordIds)
    : { data: [], error: null };
  if (recordResult.error) {
    throw new Error("AOY Competitive Records could not be loaded.", {
      cause: recordResult.error,
    });
  }

  const tournamentById = new Map(tournaments.map((row) => [row.id, row]));
  const publicationByTournament = new Map(
    (publicationResult.data ?? []).map((row) => [row.tournament_id, row.id]),
  );
  const recordById = new Map(
    (recordResult.data ?? []).map((row) => [row.id, row]),
  );

  return officialRows.map((row) => {
    const tournament = tournamentById.get(row.tournament_id);
    const record = recordById.get(row.competitive_record_id);
    const publicationId = publicationByTournament.get(row.tournament_id);
    if (!tournament || !record || !publicationId || !row.registration_id) {
      throw new Error("Official AOY history is incomplete.");
    }
    const snapshot = row.aoy_eligibility_snapshot;
    if (
      !snapshot ||
      typeof snapshot !== "object" ||
      (snapshot as { eligible?: unknown }).eligible !== row.aoy_eligible ||
      (snapshot as { registrationId?: unknown }).registrationId !== row.registration_id ||
      (snapshot as { competitiveRecordId?: unknown }).competitiveRecordId !== row.competitive_record_id ||
      (snapshot as { recordType?: unknown }).recordType !== row.record_type ||
      !Array.isArray((snapshot as { membershipSnapshot?: unknown }).membershipSnapshot)
    ) {
      throw new Error("Official AOY eligibility history is incomplete or inconsistent.");
    }
    const members = (record.members ?? []).flatMap((member) => {
      const angler = one(member.angler);
      return angler
        ? [{ id: angler.id, displayName: angler.display_name }]
        : [];
    });
    return {
      officialResultId: row.id,
      publicationId,
      seasonId,
      tournamentId: row.tournament_id,
      regularSeasonNumber: tournament.regular_season_number,
      tournamentResultStatus: tournament.result_status,
      tournamentEventType: tournament.event_type,
      tournamentStatus: tournament.status,
      registrationId: row.registration_id,
      competitiveRecordId: row.competitive_record_id,
      recordType: row.record_type,
      displayName:
        record.display_name ||
        members.map((member) => member.displayName).join(" / "),
      canonicalMembers: members.sort((a, b) => a.id.localeCompare(b.id)),
      officialPlacement: row.place,
      officialWeight: Number(row.total_weight),
      officialPenalty: Number(row.penalty_weight),
      participationStatus: row.participation_status,
      aoyEligible: row.aoy_eligible,
      sourceUpdatedAt: row.published_at,
    };
  });
}

function performancePayload(row: AoyTournamentPerformance) {
  return {
    tournament_id: row.tournamentId,
    regular_season_number: row.regularSeasonNumber,
    registration_id: row.registrationId,
    official_result_entry_id: row.officialResultId,
    publication_audit_id: row.publicationId,
    competitive_record_id: row.competitiveRecordId,
    record_type: row.recordType,
    official_placement: row.officialPlacement,
    aoy_placement: row.aoyPlacement,
    official_weight: row.officialWeight,
    official_penalty: row.officialPenalty,
    points: row.points,
    participation_status: row.participationStatus,
    eligible: row.eligible,
    counted: row.counted,
    calculated_at: row.calculatedAt,
  };
}

function standingPayload(row: AoyStanding) {
  return {
    rank: row.rank,
    competitive_record_id: row.competitiveRecordId,
    display_name: row.displayName,
    record_type: row.recordType,
    canonical_members: row.canonicalMembers,
    total_counted_points: row.totalCountedPoints,
    counted_tournament_count: row.countedTournamentCount,
    official_participation_count: row.officialParticipationCount,
    wins: row.wins,
    top_tens: row.topTens,
    total_official_season_weight: row.totalOfficialSeasonWeight,
    counted_performance_ids: row.countedPerformances.map(
      (item) => item.officialResultId,
    ),
    dropped_performance_ids: row.droppedPerformances.map(
      (item) => item.officialResultId,
    ),
    tie_status: row.tie.status,
    tie_break_details: row.tie,
    calculated_at: row.lastRecalculatedAt,
  };
}

export async function rebuildSeasonAoy(
  seasonId: string,
  adminUserId: string,
): Promise<AoyCalculationResult> {
  const source = await loadOfficialAoySource(seasonId);
  const result = calculateAoyStandings(seasonId, source);
  const { error } = await createSupabaseServerClient().rpc(
    "replace_aoy_projection",
    {
      p_season_id: seasonId,
      p_source_fingerprint: fingerprintSource(source),
      p_calculation_version: result.calculationVersion,
      p_performances: result.performances.map(performancePayload),
      p_standings: result.standings.map(standingPayload),
      p_admin_user_id: adminUserId,
    },
  );
  if (error) {
    throw new Error("The AOY projection could not be saved.", { cause: error });
  }
  return result;
}

export async function rebuildAoyForTournament(
  tournamentId: string,
  adminUserId: string,
) {
  const { data, error } = await createSupabaseServerClient()
    .from("tournaments")
    .select("season_id")
    .eq("id", tournamentId)
    .single();
  if (error || !data?.season_id) throw new Error("Tournament season not found.");
  return rebuildSeasonAoy(data.season_id, adminUserId);
}

export async function rebuildAoyForCompetitiveRecord(
  competitiveRecordId: string,
  adminUserId: string,
) {
  const { data, error } = await createSupabaseServerClient()
    .from("teams")
    .select("season_id")
    .eq("id", competitiveRecordId)
    .single();
  if (error || !data?.season_id) throw new Error("Record season not found.");
  return rebuildSeasonAoy(data.season_id, adminUserId);
}

export async function rebuildAoyForOfficialResult(
  officialResultEntryId: string,
  adminUserId: string,
) {
  const { data, error } = await createSupabaseServerClient()
    .from("official_result_entries")
    .select("tournament_id")
    .eq("id", officialResultEntryId)
    .single();
  if (error || !data?.tournament_id) {
    throw new Error("Official Result tournament not found.");
  }
  return rebuildAoyForTournament(data.tournament_id, adminUserId);
}

export async function getSeasonAoyStandings(
  seasonId: string,
): Promise<AoyStanding[]> {
  const supabase = createSupabaseServerClient();
  const [standingResult, performanceResult] = await Promise.all([
    supabase
      .from("current_aoy_standings")
      .select("*")
      .eq("season_id", seasonId)
      .order("rank", { ascending: true })
      .order("competitive_record_id", { ascending: true }),
    supabase
      .from("current_aoy_performances")
      .select("*")
      .eq("season_id", seasonId)
      .order("regular_season_number", { ascending: true }),
  ]);
  if (standingResult.error || performanceResult.error) {
    throw new Error("Current AOY standings could not be loaded.", {
      cause: standingResult.error ?? performanceResult.error,
    });
  }

  const performances = (performanceResult.data ?? []).map((row) => ({
    officialResultId: String(row.official_result_entry_id),
    publicationId: String(row.publication_audit_id),
    seasonId: String(row.season_id),
    tournamentId: String(row.tournament_id),
    regularSeasonNumber: Number(row.regular_season_number),
    registrationId: String(row.registration_id),
    competitiveRecordId: String(row.competitive_record_id),
    recordType: row.record_type as AoyTournamentPerformance["recordType"],
    officialPlacement:
      row.official_placement === null ? null : Number(row.official_placement),
    aoyPlacement:
      row.aoy_placement === null ? null : Number(row.aoy_placement),
    officialWeight: Number(row.official_weight),
    officialPenalty: Number(row.official_penalty),
    points: Number(row.points),
    participationStatus:
      row.participation_status as AoyTournamentPerformance["participationStatus"],
    eligible: Boolean(row.eligible),
    counted: Boolean(row.counted),
    calculatedAt: String(row.calculated_at),
  }));
  const byRecord = groupPerformancesByRecord(performances);

  return (standingResult.data ?? []).map((row) => {
    const recordPerformances =
      byRecord.get(row.competitive_record_id) ?? [];
    return {
      rank: Number(row.rank),
      competitiveRecordId: row.competitive_record_id,
      displayName: row.display_name,
      recordType: row.record_type,
      canonicalMembers: row.canonical_members as AoyStanding["canonicalMembers"],
      totalCountedPoints: Number(row.total_counted_points),
      countedTournamentCount: Number(row.counted_tournament_count),
      officialParticipationCount: Number(row.official_participation_count),
      wins: Number(row.wins),
      topTens: Number(row.top_tens),
      totalOfficialSeasonWeight: Number(row.total_official_season_weight),
      countedPerformances: recordPerformances.filter((item) => item.counted),
      droppedPerformances: recordPerformances.filter((item) => !item.counted),
      tie: row.tie_break_details as unknown as AoyStanding["tie"],
      lastRecalculatedAt: row.calculated_at,
    };
  });
}

function groupPerformancesByRecord(
  performances: AoyTournamentPerformance[],
): Map<string, AoyTournamentPerformance[]> {
  const grouped = new Map<string, AoyTournamentPerformance[]>();
  for (const performance of performances) {
    grouped.set(performance.competitiveRecordId, [
      ...(grouped.get(performance.competitiveRecordId) ?? []),
      performance,
    ]);
  }
  return grouped;
}
