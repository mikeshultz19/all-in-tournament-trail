import { describe, expect, it } from "vitest";

import {
  formatAdminTournamentDate,
  getInitialAdminTournament,
  groupAdminTournaments,
  withTournamentContext,
} from "@/lib/admin-tournaments";
import type { Tournament } from "@/types/tournament";

function tournament(
  values: Pick<
    Tournament,
    "id" | "name" | "lake" | "tournament_date" | "ramp" | "status"
  >,
): Tournament {
  return {
    season_id: null,
    event_type: "regular_season",
    regular_season_number: null,
    tournament_end_date: null,
    slug: values.id,
    capacity: 50,
    launch_type: null,
    morning_registration: null,
    registration_opens: null,
    registration_closes: null,
    registration_information: null,
    non_member_practice_rule: null,
    member_practice_rule: null,
    practice_information: null,
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
    description: null,
    hero_image_url: null,
    is_featured: false,
    show_on_homepage: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    updated_by: null,
    ...values,
  };
}

const tournaments: Tournament[] = [
  tournament({
    id: "past",
    name: "Past Tournament",
    lake: "Past Lake",
    tournament_date: "2026-06-01T06:00:00-05:00",
    ramp: "Past Ramp",
    status: "Results Published",
  }),
  tournament({
    id: "next",
    name: "Next Tournament",
    lake: "Next Lake",
    tournament_date: "2026-08-16T06:00:00-05:00",
    ramp: "Next Ramp",
    status: "Registration Open",
  }),
  tournament({
    id: "later",
    name: "Later Tournament",
    lake: "Later Lake",
    tournament_date: "2026-09-20T06:00:00-05:00",
    ramp: "Later Ramp",
    status: "Scheduled",
  }),
];

describe("admin tournament helpers", () => {
  it("chooses the earliest upcoming tournament by default", () => {
    expect(
      getInitialAdminTournament(
        tournaments,
        new Date("2026-07-23T12:00:00-05:00"),
      )?.id,
    ).toBe("next");
  });

  it("uses the preferred placeholder selection when provided", () => {
    expect(
      getInitialAdminTournament(
        tournaments,
        new Date("2026-07-23T12:00:00-05:00"),
        "later",
      )?.id,
    ).toBe("later");
  });

  it("falls back to the most recent tournament when all are past", () => {
    expect(
      getInitialAdminTournament(
        tournaments,
        new Date("2027-01-01T00:00:00-06:00"),
      )?.id,
    ).toBe("later");
  });

  it("does not automatically select a future cancelled tournament", () => {
    const cancelled = tournament({
      id: "cancelled",
      name: "Cancelled Tournament",
      lake: "Cancelled Lake",
      tournament_date: "2026-07-24T06:00:00-05:00",
      ramp: "Cancelled Ramp",
      status: "Cancelled",
    });

    expect(
      getInitialAdminTournament(
        [cancelled],
        new Date("2026-07-23T12:00:00-05:00"),
      ),
    ).toBeUndefined();
  });

  it("groups upcoming and past tournaments in useful order", () => {
    const groups = groupAdminTournaments(
      tournaments,
      new Date("2026-07-23T12:00:00-05:00"),
    );

    expect(groups.upcoming.map((tournament) => tournament.id)).toEqual([
      "next",
      "later",
    ]);
    expect(groups.past.map((tournament) => tournament.id)).toEqual(["past"]);
  });

  it("formats stable tournament dates and appends context safely", () => {
    expect(
      formatAdminTournamentDate(tournaments[1].tournament_date, true),
    ).toBe("Sunday, August 16, 2026");
    expect(
      withTournamentContext("/admin/results?view=review", "lake fork/2026"),
    ).toBe("/admin/results?view=review&tournament=lake+fork%2F2026");
  });
});
