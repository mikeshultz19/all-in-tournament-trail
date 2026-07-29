import type { CompetitiveRecordType } from "@/types/aoy";

export type AoyParticipationStatus =
  | "participated"
  | "withdrew_after_start"
  | "no_show"
  | "disqualified";

export interface AoyOfficialResultInput {
  officialResultId: string;
  publicationId: string;
  seasonId: string;
  tournamentId: string;
  regularSeasonNumber: number | null;
  tournamentResultStatus:
    | "pending"
    | "imported"
    | "under_review"
    | "ready_to_publish"
    | "official";
  tournamentEventType: "regular_season" | "championship";
  tournamentStatus: string;
  registrationId: string;
  competitiveRecordId: string;
  recordType: CompetitiveRecordType;
  displayName: string;
  canonicalMembers: Array<{ id: string; displayName: string }>;
  officialPlacement: number | null;
  officialWeight: number;
  officialPenalty: number;
  participationStatus: AoyParticipationStatus;
  aoyEligible: boolean;
  sourceUpdatedAt: string;
}

export interface AoyTournamentPerformance {
  officialResultId: string;
  publicationId: string;
  seasonId: string;
  tournamentId: string;
  regularSeasonNumber: number;
  registrationId: string;
  competitiveRecordId: string;
  recordType: CompetitiveRecordType;
  officialPlacement: number | null;
  aoyPlacement: number | null;
  officialWeight: number;
  officialPenalty: number;
  points: number;
  participationStatus: AoyParticipationStatus;
  eligible: boolean;
  counted: boolean;
  calculatedAt: string;
}

export interface AoyTieDetails {
  status: "resolved" | "unresolved";
  resolvedBy:
    | "points"
    | "wins"
    | "top_tens"
    | "season_weight"
    | "recent_aoy_finish"
    | null;
  tiedWithCompetitiveRecordIds: string[];
  reason: string | null;
}

export interface AoyStanding {
  rank: number;
  competitiveRecordId: string;
  displayName: string;
  recordType: CompetitiveRecordType;
  canonicalMembers: Array<{ id: string; displayName: string }>;
  totalCountedPoints: number;
  countedTournamentCount: number;
  officialParticipationCount: number;
  wins: number;
  topTens: number;
  totalOfficialSeasonWeight: number;
  countedPerformances: AoyTournamentPerformance[];
  droppedPerformances: AoyTournamentPerformance[];
  tie: AoyTieDetails;
  lastRecalculatedAt: string;
}

export interface AoyCalculationResult {
  seasonId: string;
  calculationVersion: "aitt-aoy-1.0";
  calculatedAt: string;
  performances: AoyTournamentPerformance[];
  standings: AoyStanding[];
}
