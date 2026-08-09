import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { calculateAoyStandings } from "@/lib/aoy-engine-core";
import { calculateChampionshipQualification } from "@/lib/championship-qualification-core";
import { excludeDisqualified, isDisqualified } from "@/lib/disqualification";
import type { AoyOfficialResultInput } from "@/types/aoy-engine";

const base: AoyOfficialResultInput = {
  officialResultId: "result-1", publicationId: "publication-1", seasonId: "season-1",
  tournamentId: "tournament-1", regularSeasonNumber: 1, tournamentResultStatus: "official",
  tournamentEventType: "regular_season", tournamentStatus: "Results Published",
  registrationId: "registration-1", competitiveRecordId: "record-1", recordType: "team",
  displayName: "Team One", canonicalMembers: [], officialPlacement: 1, officialWeight: 0,
  officialPenalty: 0, participationStatus: "participated", aoyEligible: true,
  sourceUpdatedAt: "2026-08-09T12:00:00Z",
};

describe("explicit disqualification workflow", () => {
  it("does not infer DQ from a blank/zero weight", () => {
    expect(isDisqualified({ participation_status: "participated" })).toBe(false);
    expect(calculateAoyStandings("season-1", [base]).performances[0].points).toBe(10);
  });

  it("awards DQ zero AOY points and no Championship participation", () => {
    const dq = { ...base, participationStatus: "disqualified" as const };
    expect(calculateAoyStandings("season-1", [dq]).performances[0].points).toBe(0);
    const championship = calculateChampionshipQualification("season-1", [dq]);
    expect(championship.participations[0].countsTowardQualification).toBe(false);
    expect(championship.participations[0].exclusionReason).toBe("disqualified");
  });

  it("omits only explicit DQ rows from payout/public consumers and restores eligibility on undo", () => {
    const rows = [{ id: "blank", participation_status: "participated", total_weight: 0 }, { id: "dq", participation_status: "disqualified", total_weight: 20 }];
    expect(excludeDisqualified(rows).map((row) => row.id)).toEqual(["blank"]);
    expect(excludeDisqualified([{ ...rows[1], participation_status: "participated" }])).toHaveLength(1);
  });

  it("persists explicit mark/undo, payout zeroing, closeout lock, audit, and Official Results omission in the local migration", () => {
    const sql = readFileSync("supabase/migrations/202608090001_add_working_result_disqualification.sql", "utf8");
    expect(sql).toContain("set_working_result_disqualification");
    expect(sql).toContain("results_verified_at is null");
    expect(sql).toContain("on_site_tournament_closeouts");
    expect(sql).toContain("mark_disqualified");
    expect(sql).toContain("remove_disqualification");
    expect(sql).toContain("new.base_payout := 0");
    expect(sql).toContain("new.bronze_payout := 0");
    expect(sql).toContain("new.silver_payout := 0");
    expect(sql).toContain("new.gold_payout := 0");
    expect(sql).toContain("new.big_bass_payout := 0");
    expect(sql).toContain("working.place < new.place");
    expect(sql).toContain("return null");
  });

  it("restores exact audited SQL NULL eligibility values and fails safely without a DQ audit", () => {
    const sql = readFileSync("supabase/migrations/202608090002_fix_remove_dq_exact_restoration.sql", "utf8");
    expect(sql).toContain("create or replace function public.set_working_result_disqualification");
    expect(sql).toContain("aoy_eligible = (v_restore ->> 'aoy_eligible')::boolean");
    expect(sql).toContain("aoy_eligibility_snapshot = nullif(");
    expect(sql).toContain("'null'::jsonb");
    expect(sql).toContain("AITT_DQ_RESTORE_AUDIT_MISSING");
    expect(sql).not.toContain("coalesce((v_restore ->> 'aoy_eligible')::boolean, true)");
    expect(sql).not.toContain("drop constraint");
    expect(sql).not.toContain("delete from public.tournament_result_entries");
  });
});
