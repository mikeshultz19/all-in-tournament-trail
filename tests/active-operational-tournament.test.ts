import { describe, expect, it, vi } from "vitest";

const { createSupabaseServerClient } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

import { getActiveOperationalTournament } from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";

function tournament(
  id: string,
  status: Tournament["status"],
  regularSeasonNumber: number,
): Tournament {
  return {
    id,
    season_id: "season-1",
    event_type: "regular_season",
    regular_season_number: regularSeasonNumber,
    name: `Tournament ${regularSeasonNumber}`,
    slug: `tournament-${regularSeasonNumber}`,
    lake: "Lake",
    capacity: null,
    tournament_date: `2026-${String(regularSeasonNumber).padStart(2, "0")}-01T12:00:00Z`,
    tournament_end_date: null,
    ramp: null,
    launch_type: null,
    morning_registration: null,
    registration_opens: null,
    registration_closes: null,
    registration_information: null,
    non_member_practice_rule: null,
    member_practice_rule: null,
    practice_information: null,
    status,
    description: null,
    hero_image_url: null,
    is_featured: false,
    show_on_homepage: false,
    insurance_payout: null,
    insurance_notes: null,
    insurance_reviewed: false,
    insurance_reviewed_at: null,
    champion_photo_url: null,
    champion_photo_path: null,
    big_bass_photo_url: null,
    big_bass_photo_path: null,
    photos_reviewed: false,
    photos_reviewed_at: null,
    weighfish_imported: false,
    weighfish_imported_at: null,
    result_status: "pending",
    official_results_published_at: null,
    official_results_published_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    updated_by: null,
  };
}

function mockSchedule(rows: Tournament[]) {
  const secondOrder = vi
    .fn()
    .mockResolvedValue({ data: rows, error: null });
  const firstOrder = vi.fn().mockReturnValue({ order: secondOrder });
  const tournamentsEq = vi.fn().mockReturnValue({ order: firstOrder });
  const tournamentsSelect = vi.fn().mockReturnValue({ eq: tournamentsEq });
  const seasonMaybeSingle = vi
    .fn()
    .mockResolvedValue({ data: { id: "season-1" }, error: null });
  const seasonEq = vi.fn().mockReturnValue({ maybeSingle: seasonMaybeSingle });
  const seasonSelect = vi.fn().mockReturnValue({ eq: seasonEq });

  createSupabaseServerClient.mockReturnValue({
    from: vi.fn((table: string) =>
      table === "seasons"
        ? { select: seasonSelect }
        : { select: tournamentsSelect },
    ),
  });
}

describe("getActiveOperationalTournament", () => {
  it("keeps a past-date tournament active until its workflow is closed", async () => {
    const active = tournament("active", "Tournament Day", 1);
    const next = tournament("next", "Scheduled", 2);
    mockSchedule([active, next]);

    await expect(getActiveOperationalTournament()).resolves.toEqual(active);
  });

  it("advances after Results are officially published", async () => {
    const closed = tournament("closed", "Results Published", 1);
    const next = tournament("next", "Scheduled", 2);
    mockSchedule([closed, next]);

    await expect(getActiveOperationalTournament()).resolves.toEqual(next);
  });
});
