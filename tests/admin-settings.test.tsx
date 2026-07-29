import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ActiveSeasonForm from "@/components/admin/ActiveSeasonForm";
import type { Season } from "@/types/aoy";

const seasons: Season[] = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    year: 2026,
    name: "2026–2027",
    slug: "2026-2027",
    regular_season_start_date: null,
    regular_season_end_date: null,
    championship_start_date: null,
    championship_end_date: null,
    membership_sales_open: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("Admin membership settings", () => {
  it("renders the active membership season selector and selected value", () => {
    const html = renderToStaticMarkup(
      <ActiveSeasonForm
        seasons={seasons}
        activeSeasonId={seasons[0].id}
      />,
    );

    expect(html).toContain("Active Membership Season");
    expect(html).toContain("2026–2027");
    expect(html).toContain('selected=""');
    expect(html).toContain("Save");
  });

  it("uses a service-role-only transaction to preserve one active season", () => {
    const migration = readFileSync(
      "supabase/migrations/202607280008_set_active_membership_season.sql",
      "utf8",
    );

    expect(migration).toContain(
      "create or replace function public.admin_set_active_season",
    );
    expect(migration).toContain("update public.seasons");
    expect(migration).toContain("set is_active = false");
    expect(migration).toContain("set is_active = true");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("from public, anon, authenticated");
  });

  it("bootstraps the initial active membership season only when none exist", () => {
    const migration = readFileSync(
      "supabase/migrations/202607280009_bootstrap_initial_membership_season.sql",
      "utf8",
    );

    expect(migration).toContain(
      "create or replace function public.ensure_initial_membership_season",
    );
    expect(migration).toContain(
      "if not exists (select 1 from public.seasons)",
    );
    expect(migration).toContain("'2026–2027'");
    expect(migration).toContain("'2026-2027'");
    expect(migration).toMatch(/true\s*\n\s*\)/);
    expect(migration).toContain(
      "select public.ensure_initial_membership_season()",
    );
    expect(migration).toContain("to service_role");
  });
});
