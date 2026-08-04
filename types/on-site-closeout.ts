import type { WeighfishResultRow } from "@/lib/weighfishParser";

export type CloseoutCheckStatus = "not_written" | "written" | "delivered";
export type CloseoutPayoutCategory = "Base Tournament" | "Bronze Pot" | "Silver Pot" | "Gold Pot" | "Big Bass" | "AITT Insurance Pot";
export interface OnSiteCloseoutCheck { id: string; entryName: string; finishingPlace: number; category: CloseoutPayoutCategory; amountCents: number; status: CloseoutCheckStatus; }
export interface OnSiteCloseoutRecord {
  id: string; tournament_id: string; source_file_name: string | null;
  source_rows: WeighfishResultRow[]; entry_count: number;
  total_collected_cents: number; total_paid_cents: number;
  trail_retained_cents: number; difference_cents: number;
  checks: OnSiteCloseoutCheck[]; status: "draft" | "complete";
  completed_at: string | null; completed_by_admin_id: string | null;
  created_at: string; updated_at: string;
}
