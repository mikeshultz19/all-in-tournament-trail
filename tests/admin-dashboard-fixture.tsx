import { renderToStaticMarkup } from "react-dom/server";

import AdminTournamentDashboard from "@/components/admin/AdminTournamentDashboard";
import type { Tournament } from "@/types/tournament";

const tournaments: Tournament[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    season_id: null,
    event_type: "regular_season",
    name: "Lake Fork Open",
    slug: "lake-fork-open-2026",
    lake: "Lake Fork",
    capacity: 50,
    tournament_date: "2026-08-16T06:00:00-05:00",
    ramp: "Pope's Landing",
    launch_type: null,
    morning_registration: null,
    registration_opens: null,
    registration_closes: "2026-08-15T18:00:00-05:00",
    registration_information: null,
    non_member_practice_rule: null,
    member_practice_rule: null,
    practice_information: null,
    status: "Registration Open",
    description: "Lake Fork tournament.",
    hero_image_url: null,
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

    created_at: "2026-07-01T12:00:00Z",
    updated_at: "2026-07-23T09:22:00-05:00",
    updated_by: "AITT Staff",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    season_id: null,
    event_type: "regular_season",
    name: "Sam Rayburn Open",
    slug: "sam-rayburn-open-2026",
    lake: "Sam Rayburn Reservoir",
    capacity: 50,
    tournament_date: "2026-09-20T06:00:00-05:00",
    ramp: "Umphrey Family Pavilion",
    launch_type: null,
    morning_registration: null,
    registration_opens: null,
    registration_closes: null,
    registration_information: null,
    non_member_practice_rule: null,
    member_practice_rule: null,
    practice_information: null,
    status: "Scheduled",
    description: null,
    hero_image_url: null,
    is_featured: false,
    show_on_homepage: true,

    insurance_payout: 0,
    insurance_notes: null,
    insurance_reviewed: false,
    insurance_reviewed_at: null,
champion_photo_path: null,
big_bass_photo_path: null,
    champion_photo_url: null,
    big_bass_photo_url: null,
    photos_reviewed: false,
    photos_reviewed_at: null,

    weighfish_imported: false,
    weighfish_imported_at: null,

    created_at: "2026-07-01T12:00:00Z",
    updated_at: "2026-07-01T12:00:00Z",
    updated_by: null,
  },
];

export function renderAdminDashboardFixture(): string {
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={tournaments}
      initialTournamentId={tournaments[0].id}
      comparisonDate="2026-07-23T12:00:00-05:00"
    />,
  );
}
