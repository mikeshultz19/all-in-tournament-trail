import { describe, expect, it } from "vitest";

import { buildPublishedResultsArchive } from "@/lib/result-archive";
import { databaseTournament } from "@/tests/tournament-db-fixture";
import type { TournamentResultsRecord } from "@/types/results";

function resultFor(tournamentId: string): TournamentResultsRecord {
  return {
    id: `results-${tournamentId}`,
    tournament_id: tournamentId,
    entries: [],
    total_payout: 0,
    bronze_payout: 0,
    silver_payout: 0,
    gold_payout: 0,
    insurance_pot_payout: 0,
    big_bass_angler: null,
    big_bass_team: null,
    big_bass_weight: null,
    big_bass_payout: null,
    champion_image_url: null,
    big_bass_image_url: null,
    published_at: "2026-07-20T00:00:00Z",
    created_at: "2026-07-20T00:00:00Z",
    updated_at: "2026-07-20T00:00:00Z",
  };
}

describe("published Results archive mapping", () => {
  it("keeps date order, skips missing result records, and uses slugs", () => {
    const newest = {
      ...databaseTournament,
      id: "11111111-1111-4111-8111-111111111111",
      slug: "newest-event",
      tournament_date: "2026-07-20T06:00:00-05:00",
      status: "Results Published" as const,
    };
    const missing = {
      ...databaseTournament,
      id: "22222222-2222-4222-8222-222222222222",
      slug: "missing-results",
      status: "Results Published" as const,
    };

    const archive = buildPublishedResultsArchive(
      [newest, missing],
      [resultFor(newest.id)],
    );

    expect(archive.map((item) => item.tournament.id)).toEqual([newest.id]);
    expect(archive[0]?.completeResultsUrl).toBe("/results/newest-event");
  });

  it("falls back to the UUID when a published tournament has no slug", () => {
    const tournament = {
      ...databaseTournament,
      slug: "",
      status: "Results Published" as const,
    };

    const [archiveEntry] = buildPublishedResultsArchive(
      [tournament],
      [resultFor(tournament.id)],
    );

    expect(archiveEntry?.completeResultsUrl).toBe(
      `/results/${tournament.id}`,
    );
  });

  it("returns an empty archive safely", () => {
    expect(buildPublishedResultsArchive([], [])).toEqual([]);
  });

  it("uses the completed closeout total as the authoritative public payout total", () => {
    const tournament = {
      ...databaseTournament,
      status: "Results Published" as const,
    };

    const [archiveEntry] = buildPublishedResultsArchive(
      [tournament],
      [resultFor(tournament.id)],
      [],
      [{ tournament_id: tournament.id, total_paid_cents: 177000 }],
    );

    expect(archiveEntry.totalPaidOutToAnglers).toBe(1770);
  });

  it("excludes unpublished tournaments defensively", () => {
    const tournament = {
      ...databaseTournament,
      status: "Scheduled" as const,
    };

    expect(
      buildPublishedResultsArchive(
        [tournament],
        [resultFor(tournament.id)],
      ),
    ).toEqual([]);
  });
});
