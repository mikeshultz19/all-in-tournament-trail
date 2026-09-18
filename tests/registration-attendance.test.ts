import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { parseWeighfishCsv } from "@/lib/weighfishParser";

const cleanup = readFileSync("supabase/migrations/202609170002_remove_no_show_feature.sql", "utf8");
const action = readFileSync("app/admin/tournament-manager/prepare/check-in-actions.ts", "utf8");
const control = readFileSync("components/admin/RegistrationCheckInControl.tsx", "utf8");
const roster = readFileSync("lib/tournament-registration-roster.ts", "utf8");
const review = readFileSync("app/admin/registration-review/page.tsx", "utf8");
const toolbar = readFileSync("components/admin/RegistrationRosterToolbar.tsx", "utf8");
const print = readFileSync("app/admin/registration-review/print/page.tsx", "utf8");
const csv = readFileSync("app/admin/registration-review/export/route.ts", "utf8");

describe("ordinary registration check-in workflow", () => {
  it("keeps only Check In and Edit / Reopen controls", () => {
    expect(action).toContain('"check_in"');
    expect(action).toContain('"clear_check_in"');
    expect(action).toContain('"set_registration_attendance"');
    expect(control).toContain("Check In");
    expect(control).toContain("Edit / Reopen");
  });

  it("contains no retired attendance feature in desktop, mobile, filters, export, or print", () => {
    for (const source of [action, control, roster, review, toolbar, print, csv]) {
      expect(source.toLowerCase()).not.toContain("no_show");
      expect(source.toLowerCase()).not.toContain("noshow");
      expect(source.toLowerCase()).not.toContain("no show");
    }
  });

  it("removes only the retired schema objects and preserves ordinary check-in", () => {
    expect(cleanup).toContain("drop column if exists no_show_at");
    expect(cleanup).toContain("drop column if exists no_show_by_admin_id");
    expect(cleanup).toContain("drop function if exists public.create_no_show_working_result");
    expect(cleanup).toContain("p_attendance_action not in ('check_in', 'clear_check_in')");
    expect(cleanup).not.toContain("drop column if exists checked_in_at");
    expect(cleanup).not.toContain("delete from public.tournament_registrations");
    expect(cleanup).not.toContain("update public.tournament_result_entries");
  });

  it("leaves ordinary zero-fish and zero-weight parsing unchanged", () => {
    const parsed = parseWeighfishCsv(
      'Place,Angler,# Fish,Total Weight (lbs),Big Fish (lbs),Cash Payout,Payout Breakdown,Prize Description\n14,"Zero Fish Team",0,0,0,$0,"",""',
    );
    expect(parsed.valid).toBe(true);
    expect(parsed.rows[0]).toMatchObject({ fishCount: 0, totalWeight: 0, participationStatus: "participated" });
  });
});
