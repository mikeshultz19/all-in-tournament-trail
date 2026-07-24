import { renderToStaticMarkup } from "react-dom/server";

import AdminTournamentDashboard from "@/components/admin/AdminTournamentDashboard";
import type { ReadinessChecklistItem } from "@/components/admin/WebsiteReadiness";
import type { Tournament } from "@/types/tournament";

const tournaments: Tournament[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Lake Fork Open",
    slug: "lake-fork-open-2026",
    lake: "Lake Fork",
    tournament_date: "2026-08-16T06:00:00-05:00",
    ramp: "Pope's Landing",
    launch_type: null,
    morning_registration: null,
    registration_opens: null,
    registration_closes: "2026-08-15T18:00:00-05:00",
    status: "Registration Open",
    description: "Lake Fork tournament.",
    hero_image_url: null,
    is_featured: true,
    show_on_homepage: true,
    created_at: "2026-07-01T12:00:00Z",
    updated_at: "2026-07-23T09:22:00-05:00",
    updated_by: "AITT Staff",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Sam Rayburn Open",
    slug: "sam-rayburn-open-2026",
    lake: "Sam Rayburn Reservoir",
    tournament_date: "2026-09-20T06:00:00-05:00",
    ramp: "Umphrey Family Pavilion",
    launch_type: null,
    morning_registration: null,
    registration_opens: null,
    registration_closes: null,
    status: "Scheduled",
    description: null,
    hero_image_url: null,
    is_featured: false,
    show_on_homepage: true,
    created_at: "2026-07-01T12:00:00Z",
    updated_at: "2026-07-01T12:00:00Z",
    updated_by: null,
  },
];

const preTournamentItems: ReadinessChecklistItem[] = [
  { label: "Tournament Information Updated", complete: true, href: "/admin/tournament" },
  { label: "Registration Information Complete", complete: true, href: "/admin/tournament" },
  { label: "Announcements Reviewed", complete: true, href: "/admin/announcements" },
  { label: "Conditions Updated", complete: false, href: "/admin/conditions" },
];

const postTournamentItems: ReadinessChecklistItem[] = [
  { label: "Import WeighFish Results", complete: false, href: "/admin/results" },
  { label: "Upload Tournament Winner Photo", complete: false, href: "/admin/results" },
  { label: "Upload Big Bass Winner Photo", complete: false, href: "/admin/results" },
  { label: "Publish Tournament Results", complete: false, href: "/admin/results" },
];

export function renderAdminDashboardFixture(): string {
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={tournaments}
      initialTournamentId={tournaments[0].id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      preTournamentItems={preTournamentItems}
      postTournamentItems={postTournamentItems}
    />,
  );
}
