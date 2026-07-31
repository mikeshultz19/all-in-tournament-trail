import type { Tournament } from "@/types/tournament";

export const databaseTournament: Tournament = {
  id: "11111111-1111-4111-8111-111111111111",
  season_id: null,
  event_type: "regular_season",
  regular_season_number: null,
  name: "Eagle Mountain",
  slug: "eagle-mountain-2026",
  lake: "Eagle Mountain",
  weather_latitude: 32.87562,
  weather_longitude: -97.49323,
  capacity: 50,
  tournament_date: "2026-11-01T06:00:00-06:00",
  tournament_end_date: null,
  ramp: "Twin Points Park",
  launch_type: "Trailering",
  morning_registration: "05:00",
  registration_opens: "2026-07-01T06:00:00-05:00",
  registration_closes: "2026-10-31T21:00:00-05:00",
  registration_information:
    "Online registration closes Friday, October 30 at 6:00 PM.",
  non_member_practice_rule:
    "Off-limits beginning at 12:00 AM midnight on Monday of tournament week.",
  member_practice_rule:
    "A current member registered for this tournament may practice Friday or Saturday, but not both.",
  practice_information:
    "Beginning at 12:00 AM midnight on Monday of tournament week, tournament waters are off-limits to non-member anglers competing in this event.\n\nA current member registered for this specific tournament may use one official practice day, choosing Friday or Saturday immediately before the tournament, but not both.",
  status: "Registration Open",
  description:
    "Tournament preparations are on schedule. Register during the published registration windows.",
  hero_image_url: "/images/lakes/eagle-mountain.jfif",
  is_featured: true,
  show_on_homepage: true,

  insurance_payout: 0,
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

  created_at: "2026-07-01T12:00:00Z",
  updated_at: "2026-07-21T12:00:00Z",
  updated_by: "AITT Staff",
};
