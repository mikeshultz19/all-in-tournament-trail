import type { CompetitiveRecordType } from "@/types/aoy";
import type {
  AoyOfficialResultInput,
  AoyParticipationStatus,
} from "@/types/aoy-engine";

export interface ChampionshipParticipationRecord {
  officialResultId: string;
  publicationId: string;
  seasonId: string;
  tournamentId: string;
  regularSeasonNumber: number;
  registrationId: string;
  competitiveRecordId: string;
  recordType: CompetitiveRecordType;
  participationStatus: AoyParticipationStatus;
  historicallyEligible: boolean;
  countsTowardQualification: boolean;
  exclusionReason:
    | "ineligible"
    | "no_show"
    | "disqualified"
    | null;
  calculatedAt: string;
}

export interface ChampionshipQualification {
  competitiveRecordId: string;
  displayName: string;
  recordType: CompetitiveRecordType;
  canonicalMembers: AoyOfficialResultInput["canonicalMembers"];
  officialParticipations: number;
  qualifyingTournaments: ChampionshipParticipationRecord[];
  nonqualifyingOfficialResults: ChampionshipParticipationRecord[];
  remainingParticipationCount: number;
  uncreditedRegularSeasonNumbers: number[];
  qualificationStatus: "qualified" | "not_qualified";
  qualifiedAt: string | null;
  lastRecalculatedAt: string;
}

export interface ChampionshipQualificationResult {
  seasonId: string;
  calculationVersion: "aitt-championship-qualification-1.0";
  calculatedAt: string;
  participations: ChampionshipParticipationRecord[];
  qualifications: ChampionshipQualification[];
}
