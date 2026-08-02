import type { InsurancePotWinner } from "@/lib/insurance-pot";

export interface TournamentInsurancePotResultRecord {
  id: string;
  tournament_id: string;
  entry_count: number;
  total_pot_cents: number;
  places_paid: number;
  calculated_payouts: number[];
  winners: InsurancePotWinner[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
