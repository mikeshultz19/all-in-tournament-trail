import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AddMemberForm from "@/components/admin/AddMemberForm";
import {
  addMemberFormData,
  validateAddMemberForm,
} from "@/lib/add-member-form";
import { isAdminUser } from "@/lib/admin-auth";
import type { User } from "@supabase/supabase-js";

const tournaments = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Lake Fork Open",
    tournament_date: "2026-08-16T06:00:00-05:00",
    regular_season_number: 1,
  },
];

function validFormData(): FormData {
  const formData = new FormData();
  formData.set("firstName", "  Jane ");
  formData.set("lastName", " Angler  ");
  formData.set("email", " jane@example.com ");
  formData.set("phone", "");
  formData.set("seasonId", "22222222-2222-4222-8222-222222222222");
  formData.set("status", "active");
  formData.set("effectiveDate", "2026-08-01");
  formData.set(
    "firstEligibleTournamentId",
    "11111111-1111-4111-8111-111111111111",
  );
  return formData;
}

describe("Add Member form", () => {
  it("renders the supported physical-form fields and real tournament options", () => {
    const html = renderToStaticMarkup(
      <AddMemberForm
        seasons={[
          {
            id: "22222222-2222-4222-8222-222222222222",
            year: 2026,
            name: "2026 Season",
            slug: "2026-season",
            regular_season_start_date: null,
            regular_season_end_date: null,
            championship_start_date: null,
            championship_end_date: null,
            membership_sales_open: true,
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ]}
        defaultSeasonId="22222222-2222-4222-8222-222222222222"
        tournaments={tournaments}
        defaultEffectiveDate="2026-08-01"
      />,
    );

    for (const label of [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Membership Status",
      "Membership Effective Date",
      "First Eligible Tournament",
      "Save Member",
      "Cancel",
    ]) {
      expect(html).toContain(label);
    }

    expect(html).toContain("Lake Fork Open");
    expect(html).toContain("Aug 16, 2026");
    expect(html).not.toContain("Address");
    expect(html).not.toContain("Emergency");
    expect(html).not.toContain("Membership Number");
    expect(html).toContain(
      `value="${tournaments[0].id}" selected=""`,
    );
  });

  it("trims values and normalizes blank optional fields", () => {
    expect(addMemberFormData(validFormData())).toMatchObject({
      firstName: "Jane",
      lastName: "Angler",
      email: "jane@example.com",
      phone: "",
      effectiveDate: "2026-08-01",
      firstEligibleTournamentId:
        "11111111-1111-4111-8111-111111111111",
    });
  });

  it("validates required identity, eligibility, date, status, and optional email", () => {
    const formData = validFormData();
    formData.set("firstName", "");
    formData.set("lastName", "");
    formData.set("email", "invalid");
    formData.set("effectiveDate", "");
    formData.set("status", "pending");
    formData.set("firstEligibleTournamentId", "");

    const errors = validateAddMemberForm(addMemberFormData(formData));

    expect(errors.firstName).toBe("First name is required.");
    expect(errors.lastName).toBe("Last name is required.");
    expect(errors.email).toBe("Enter a valid email address.");
    expect(errors.effectiveDate).toContain("effective date");
    expect(errors.status).toContain("valid membership status");
    expect(errors.firstEligibleTournamentId).toContain("first tournament");
  });

  it("allows optional email and phone to remain blank", () => {
    const formData = validFormData();
    formData.set("email", "");

    expect(validateAddMemberForm(addMemberFormData(formData))).toEqual({});
  });
});

describe("Add Member authorization and transaction", () => {
  it("recognizes only the established admin app-metadata role", () => {
    const user = (role?: string) =>
      ({
        app_metadata: role ? { role, active: true } : {},
      }) as User;

    expect(isAdminUser(user("admin"))).toBe(true);
    expect(isAdminUser(user("member"))).toBe(false);
    expect(isAdminUser(user())).toBe(false);
    expect(
      isAdminUser({
        app_metadata: { role: "admin", active: false },
      } as unknown as User),
    ).toBe(false);
  });

  it("creates angler and membership atomically with service-role-only execution", () => {
    const migration = readFileSync(
      "supabase/migrations/202607280006_create_admin_member_rpc.sql",
      "utf8",
    );

    expect(migration).toContain(
      "create or replace function public.admin_create_member",
    );
    expect(migration).toContain("insert into public.anglers");
    expect(migration).toContain("insert into public.memberships");
    expect(migration).toContain("AITT_DUPLICATE_EMAIL");
    expect(migration).toContain("AITT_DUPLICATE_PHONE");
    expect(migration).toContain("grant execute");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("from public, anon, authenticated");
  });

  it("keeps effective date and first eligible tournament as independent inputs", () => {
    const migration = readFileSync(
      "supabase/migrations/202607280006_create_admin_member_rpc.sql",
      "utf8",
    );

    expect(migration).toContain("p_effective_date");
    expect(migration).toContain("p_first_eligible_tournament_id");
    expect(migration).not.toMatch(
      /p_first_eligible_tournament_id\s*:=.*p_effective_date/,
    );
  });

  it("associates the existing Eagle Mountain tournaments without changing the eligibility rule", () => {
    const migration = readFileSync(
      "supabase/migrations/202607280010_assign_eagle_mountain_to_initial_season.sql",
      "utf8",
    );

    expect(migration).toContain("where slug = '2026-2027'");
    expect(migration).toContain("event_type = 'regular_season'");
    expect(migration).toContain(
      "'a54c9b21-7e60-47f0-9007-4c95c8bbf13c'::uuid",
    );
    expect(migration).toContain(
      "'54e88b83-2521-4c77-a1b6-5ed4eed2890f'::uuid",
    );
    expect(migration).toContain(
      "this relationship, not membership effective_date",
    );
  });
});
