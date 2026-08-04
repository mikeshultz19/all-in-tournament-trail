import type { Tournament } from "@/types/tournament";
import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

export interface ResultEntry {
  place: number;
  team: string;
  weight: number;
  kind?: "final" | "sidePot";
  baseWinnings?: number;
  sidePot?: "bronze" | "silver" | "gold";
  sidePotPlacement?: number;
  sidePotWeight?: number;
  sidePotPayout?: number;
}

export interface TournamentResultsRecord {
  id: string;
  tournament_id: string;
  entries: ResultEntry[];
  total_payout: number;
  bronze_payout: number;
  silver_payout: number;
  gold_payout: number;
  insurance_pot_payout: number;
  big_bass_angler: string | null;
  big_bass_team: string | null;
  big_bass_weight: number | null;
  big_bass_payout: number | null;
  champion_image_url: string | null;
  big_bass_image_url: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface LatestTournamentResults {
  tournament: Tournament;
  results: TournamentResultsRecord;
  tournamentImage: string | null;
  championImage: string;
  tournamentRecap?: string;
  bigBassImage: string;
  completeResultsUrl: string;
  insurancePotResult?: TournamentInsurancePotResultRecord | null;
  insurancePotWinnersUrl?: string;
}
