import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/admin/members",
  useSearchParams: () => new URLSearchParams(),
}));

import MembersList from "@/components/admin/MembersList";
import { filterMemberRows } from "@/lib/member-list";
import type { AdminMemberListRow } from "@/types/aoy";

const members: AdminMemberListRow[] = [
  {
    membership_id: "membership-1",
    angler_id: "11111111-1111-4111-8111-111111111111",
    first_name: "John",
    last_name: "Smith",
    display_name: "John Smith",
    email: "john@example.com",
    phone: "817-555-0101",
    is_active: true,
    membership_status: "active",
    season_id: "season-2026",
    season_name: "2026 Season",
    first_eligible_tournament_id: "tournament-1",
    first_eligible_tournament_name: "Lake Fork Open",
    effective_date: "2026-03-01",
    updated_at: "2026-07-20T15:00:00Z",
  },
  {
    membership_id: "membership-2",
    angler_id: "22222222-2222-4222-8222-222222222222",
    first_name: "Maria",
    last_name: "Garcia",
    display_name: "Maria Garcia",
    email: "maria@example.com",
    phone: "214-555-0199",
    is_active: false,
    membership_status: "refunded",
    season_id: "season-2026",
    season_name: "2026 Season",
    first_eligible_tournament_id: null,
    first_eligible_tournament_name: null,
    effective_date: "2026-04-10",
    updated_at: "2026-07-21T15:00:00Z",
  },
];

describe("Admin Members list", () => {
  it("renders the required eligibility columns and read-only actions", () => {
    const html = renderToStaticMarkup(<MembersList members={members} />);

    for (const heading of [
      "Member",
      "Membership Status",
      "Season",
      "First Eligible Tournament",
      "Member Since",
      "Last Updated",
      "Actions",
    ]) {
      expect(html).toContain(heading);
    }

    expect(html).toContain("John Smith");
    expect(html).toContain("Active");
    expect(html).toContain("Lake Fork Open");
    expect(html).toContain("Mar 1, 2026");
    expect(html).toContain("Refunded");
    expect(html).toContain("Not assigned");
    expect(html).toContain(">View</a>");
    expect(html).toContain(
      `href="/admin/members/${members[0].angler_id}"`,
    );
    expect(html).not.toContain("?season=");
    expect(html).not.toContain("Edit");
    expect(html).not.toContain("Delete");
    expect(html).not.toContain("Renew");
  });

  it("renders the required empty state", () => {
    const html = renderToStaticMarkup(<MembersList members={[]} />);

    expect(html).toContain("No members have been added.");
    expect(html).toContain("Add First Member");
    expect(html).toContain('href="/admin/members/new"');
  });

  it("searches first name, last name, display name, email, and phone", () => {
    expect(filterMemberRows(members, "John").map((row) => row.angler_id)).toEqual([
      members[0].angler_id,
    ]);
    expect(filterMemberRows(members, "garcia")).toHaveLength(1);
    expect(filterMemberRows(members, "Maria Garcia")).toHaveLength(1);
    expect(filterMemberRows(members, "john@example.com")).toHaveLength(1);
    expect(filterMemberRows(members, "214-555")).toHaveLength(1);
    expect(filterMemberRows(members, "missing")).toEqual([]);
  });
});

describe("Membership eligibility storage migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202607280002_add_membership_first_eligible_tournament.sql",
    "utf8",
  );

  it("stores, indexes, and protects the first eligible tournament reference", () => {
    expect(migration).toContain(
      "add column if not exists first_eligible_tournament_id uuid",
    );
    expect(migration).toContain(
      "memberships_first_eligible_tournament_id_fkey",
    );
    expect(migration).toContain("references public.tournaments(id)");
    expect(migration).toContain("on delete restrict");
    expect(migration).toContain(
      "memberships_first_eligible_tournament_id_idx",
    );
  });

  it("does not calculate or backfill eligibility", () => {
    expect(migration).not.toContain("update public.memberships");
    expect(migration).not.toContain("insert into");
  });
});
