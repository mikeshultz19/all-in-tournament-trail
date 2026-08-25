import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  getWinnerPhotosAndRecapReadiness,
  TOURNAMENT_RECAP_MAX_LENGTH,
  validateTournamentRecap,
} from "@/lib/tournament-recap";

describe("Tournament Recap editorial workflow", () => {
  it("accepts 300 characters, trims text, and treats empty text as null", () => {
    const exactLimit = "a".repeat(TOURNAMENT_RECAP_MAX_LENGTH);

    expect(validateTournamentRecap(exactLimit)).toEqual({
      ok: true,
      value: exactLimit,
    });
    expect(validateTournamentRecap("  Tournament complete.  ")).toEqual({
      ok: true,
      value: "Tournament complete.",
    });
    expect(validateTournamentRecap("   ")).toEqual({ ok: true, value: null });
  });

  it("rejects more than 300 characters at the server validation boundary", () => {
    expect(validateTournamentRecap("a".repeat(301))).toEqual({
      ok: false,
      message: "Tournament Recap must be 300 characters or fewer.",
    });
  });

  it("requires both photos, reviewed confirmation, and non-whitespace recap", () => {
    expect(
      getWinnerPhotosAndRecapReadiness({
        champion_photo_url: null,
        big_bass_photo_url: null,
        tournament_recap: "   ",
        photos_reviewed: false,
      }),
    ).toEqual({
      ready: false,
      missing: [
        "Champion photo missing",
        "Big Bass photo missing",
        "Tournament recap missing",
        "Winner photo review confirmation missing",
      ],
    });

    expect(
      getWinnerPhotosAndRecapReadiness({
        champion_photo_url: "https://example.com/champion.jpg",
        big_bass_photo_url: "https://example.com/big-bass.jpg",
        tournament_recap: "A complete tournament recap.",
        photos_reviewed: true,
      }),
    ).toEqual({ ready: true, missing: [] });
  });

  it("keeps the Admin textarea fixed, counted, and client-limited", () => {
    const source = readFileSync(
      "components/admin/TournamentRecapForm.tsx",
      "utf8",
    );

    expect(source).toContain("maxLength={TOURNAMENT_RECAP_MAX_LENGTH}");
    expect(source).toContain("h-32");
    expect(source).toContain("resize-none");
    expect(source).toContain("overflow-y-auto");
    expect(source).toContain("{recap.length} / {TOURNAMENT_RECAP_MAX_LENGTH}");
    expect(source).toContain("Save Recap");
  });

  it("uses Winner Photos & Recap consistently for the Step 4 control", () => {
    const dashboard = readFileSync(
      "components/admin/AdminTournamentDashboard.tsx",
      "utf8",
    );
    const page = readFileSync(
      "app/admin/tournament-manager/photos/page.tsx",
      "utf8",
    );

    expect(dashboard).toContain('label: "Winner Photos & Recap"');
    expect(dashboard).toContain("Winner Photos &amp; Recap");
    expect(page).toContain("Winner Photos &amp; Recap");
    expect(dashboard).toContain("missing={");
    expect(dashboard).toContain("publicationComplete || winnerPhotosAndRecap.ready");
  });

  it("updates only recap audit fields and remains independent of publication", () => {
    const actions = readFileSync(
      "app/admin/tournament-manager/photos/actions.ts",
      "utf8",
    );
    const recapAction = actions.slice(
      actions.indexOf("export async function saveTournamentRecapAction"),
    );

    expect(recapAction).toContain("tournament_recap: validation.value");
    expect(recapAction).toContain("updated_by: admin.id");
    expect(recapAction).not.toContain("result_status");
    expect(recapAction).not.toContain("official_results");
    expect(recapAction).not.toContain("payout");
    expect(recapAction).not.toContain("aoy");
    expect(recapAction).not.toContain("championship");
    expect(recapAction).not.toContain("redirect(");
  });

  it("enforces the database limit and renders safe public wrapping", () => {
    const migration = readFileSync(
      "supabase/migrations/202608250001_add_tournament_recap.sql",
      "utf8",
    );
    const desktop = readFileSync("components/WinnersCircle.tsx", "utf8");
    const mobile = readFileSync("components/MobileWinnerCircle.tsx", "utf8");

    expect(migration).toContain("char_length(tournament_recap) <= 300");
    expect(desktop).toContain("break-words");
    expect(mobile).toContain("break-words");
    expect(desktop).toContain("No tournament recap has been added.");
    expect(mobile).toContain("No tournament recap has been added.");
  });
});
